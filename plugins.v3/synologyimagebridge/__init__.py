"""群晖图片桥插件：为 Synology Chat 等外部渠道提供带扩展名、免登录的图片地址。

背景：Synology Chat 的 incoming webhook 只接受路径以图片扩展名结尾的 ``file_url``，
否则整条消息返回 ``error code 117`` 并被丢弃。本插件把媒体服务器原始图片按需缓存到
本地，并对外提供 ``/img/<摘要>.jpg`` 形式的匿名地址，使通知能够携带图片。
"""

import hashlib
import re
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote, urlparse

from fastapi import HTTPException
from fastapi.responses import FileResponse

import requests

from app.plugins import _PluginBase
from app.sdk.logging import logger
from app.sdk.network import RequestUtils
from app.sdk.services import MediaServerHelper

# 对外暴露的文件名：32 位摘要 + 图片后缀，只接受程序自己写出的命名
_FILENAME_PATTERN = re.compile(r"^([0-9a-f]{32})\.(jpg|jpeg|png|webp|gif)$")
_IMAGE_SUFFIX_BY_TYPE = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}


# 通知渠道在媒体项缺少封面时会退回官方图标，这些主机同样需要允许取图
_BUILTIN_IMAGE_HOSTS = {
    "emby.media",
    "plex.tv",
    "www.plex.tv",
    "play-lh.googleusercontent.com",
}


class SynologyImageBridge(_PluginBase):
    """群晖图片桥：缓存并转发媒体服务器原图，供外部渠道匿名取图。"""

    plugin_name = "群晖图片桥"
    plugin_desc = "为 Synology Chat 等渠道提供带图片扩展名的匿名图片地址，原图本地缓存，按保留天数与容量上限自动清理。"
    plugin_icon = "synologyimagebridge.png"
    plugin_version = "1.1.0"
    plugin_label = "工具"
    plugin_author = "gi29734401"
    plugin_config_prefix = "synologyimagebridge_"
    plugin_order = 60
    auth_level = 1

    _enabled = False
    _retention_days = 7
    _max_size_mb = 512
    _extra_hosts: List[str] = []
    _stats: Dict[str, Any] = {}
    _lock = threading.RLock()
    _last_prune = 0.0

    def init_plugin(self, config: Optional[Dict[str, Any]] = None) -> None:
        """读取插件配置，准备缓存目录并清理过期文件。

        :param config: 插件配置字典，缺省时视为未启用
        """
        config = config or {}
        self._enabled = bool(config.get("enabled"))
        self._retention_days = self._as_int(config.get("retention_days"), 7, 1, 365)
        self._max_size_mb = self._as_int(config.get("max_size_mb"), 512, 16, 20480)
        self._extra_hosts = self._as_hosts(config.get("extra_hosts"))
        self._stats = self.get_data("stats") or {}
        self._stats.setdefault("hits", 0)
        self._stats.setdefault("misses", 0)
        self._stats.setdefault("written", 0)
        self._stats.setdefault("pruned", 0)
        self._stats.setdefault("last_cleanup", 0)
        self._ensure_dir()
        if self._enabled:
            self.prune()

    def get_state(self) -> bool:
        """返回插件是否启用。"""
        return self._enabled

    @staticmethod
    def get_render_mode() -> Tuple[str, str]:
        """声明插件使用 Vue 联邦组件渲染界面。"""
        return "vue", "dist/assets"

    def get_api(self) -> List[Dict[str, Any]]:
        """注册图片网关与统计接口。

        :return: 插件 API 描述列表；图片接口免登录供外部渠道取图
        """
        return [
            {
                "path": "/img/{filename}",
                "endpoint": self.api_image,
                "methods": ["GET"],
                "auth": "bear",
                "allow_anonymous": True,
                "summary": "匿名图片网关：返回已缓存的原始图片",
            },
            {
                "path": "/stats",
                "endpoint": self.api_stats,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "缓存统计：张数、占用空间与命中情况",
            },
            {
                "path": "/entries",
                "endpoint": self.api_entries,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "最近写入的缓存条目",
            },
            {
                "path": "/clear",
                "endpoint": self.api_clear,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "清空全部缓存文件",
            },
        ]

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        """Vue 模式下返回空表单与当前默认配置。"""
        return [], self._current_config()

    def get_page(self) -> List[dict]:
        """Vue 模式下详情页由远程 Page 组件渲染。"""
        return []

    def get_service(self) -> List[Dict[str, Any]]:
        """注册每日清理服务。

        :return: 调度服务列表；未启用时返回空列表
        """
        if not self._enabled:
            return []
        return [
            {
                "id": "SynologyImageBridgeCleanup|4:10",
                "name": "群晖图片桥缓存清理",
                "trigger": "cron",
                "func": self._scheduled_prune,
                "kwargs": {"hour": 4, "minute": 10},
            }
        ]

    def _scheduled_prune(self, hour: int = 0, minute: int = 0, **kwargs: Any) -> Dict[str, int]:
        """定时清理入口，兼容调度器传入的时间参数。

        :param hour: 调度器传入的小时，未使用
        :param minute: 调度器传入的分钟，未使用
        :return: 删除数量与释放字节数
        """
        _ = (hour, minute, kwargs)
        return self.prune(reason="schedule")

    def stop_service(self) -> None:
        """插件停止时无需额外释放的资源。"""
        return None

    def api_image(self, filename: str, src: str = "") -> FileResponse:
        """匿名返回缓存图片，必要时先下载原图。

        :param filename: 形如 ``<32位摘要>.jpg`` 的公开文件名
        :param src: 原始图片地址（URL 编码），仅在缓存未命中时使用
        :return: 图片文件响应
        """
        if not self._enabled:
            raise HTTPException(status_code=404, detail="插件未启用")
        match = _FILENAME_PATTERN.match(filename or "")
        if not match:
            raise HTTPException(status_code=404, detail="文件名不合法")
        digest = match.group(1)
        # 缓存文件统一以 .jpg 命名，对外后缀只用于满足渠道的扩展名校验
        path = self._ensure_dir() / f"{digest}.jpg"
        if path.exists() and path.stat().st_size > 0:
            self._count_hit()
            return self._file_response(path)

        source_url = self._decode_source(src)
        if not source_url:
            raise HTTPException(status_code=404, detail="缓存未命中且未提供图片来源")
        if self._digest(source_url) != digest:
            raise HTTPException(status_code=403, detail="摘要与图片来源不匹配")
        if not self._is_allowed_url(source_url):
            raise HTTPException(status_code=403, detail="图片来源不在允许的媒体服务器范围内")

        content, content_type = self._download(self._with_media_server_key(source_url))
        if not content:
            self._count_miss()
            raise HTTPException(status_code=502, detail="下载原图失败")
        self._write_cache(path, content)
        self._stats["misses"] = int(self._stats.get("misses", 0)) + 1
        self.save_data("stats", self._stats)
        self._maybe_prune()
        return self._file_response(path, content_type)

    def api_stats(self) -> Dict[str, Any]:
        """返回缓存统计信息。

        :return: 张数、占用字节数、命中数与配置项
        """
        entries = self._list_entries()
        hits = int(self._stats.get("hits", 0) or 0)
        misses = int(self._stats.get("misses", 0) or 0)
        total = hits + misses
        return {
            "enabled": self._enabled,
            "count": len(entries),
            "size_bytes": sum(item["size"] for item in entries),
            "hits": hits,
            "misses": misses,
            "hit_rate": round(hits * 100.0 / total, 1) if total else 0.0,
            "written": int(self._stats.get("written", 0) or 0),
            "pruned": int(self._stats.get("pruned", 0) or 0),
            "last_cleanup": int(self._stats.get("last_cleanup", 0) or 0),
            "retention_days": self._retention_days,
            "max_size_mb": self._max_size_mb,
            "data_dir": str(self._ensure_dir()),
            "allowed_hosts": sorted(self._allowed_hosts()),
        }

    def api_entries(self, limit: int = 20) -> List[Dict[str, Any]]:
        """返回最近写入的缓存条目。

        :param limit: 最多返回的条目数量
        :return: 按写入时间倒序排列的条目
        """
        try:
            count = max(1, min(int(limit), 200))
        except (TypeError, ValueError):
            count = 20
        return self._list_entries()[:count]

    def api_clear(self) -> Dict[str, Any]:
        """清空全部缓存文件并返回删除结果。

        :return: 删除的文件数量与释放的字节数
        """
        removed, freed = 0, 0
        directory = self._ensure_dir()
        with self._lock:
            for path in directory.glob("*"):
                if not path.is_file():
                    continue
                try:
                    size = path.stat().st_size
                    path.unlink()
                    removed += 1
                    freed += size
                except OSError as error:
                    logger.warning(f"群晖图片桥删除缓存失败 {path.name}: {error}")
        self._stats["last_cleanup"] = int(time.time())
        self.save_data("stats", self._stats)
        logger.info(f"群晖图片桥已清空缓存：{removed} 个文件，释放 {freed} 字节")
        return {"removed": removed, "freed_bytes": freed}

    def prune(self, reason: str = "manual") -> Dict[str, int]:
        """按保留天数与容量上限清理缓存。

        :param reason: 触发来源，便于日志区分
        :return: 删除数量与释放字节数
        """
        self._ensure_dir()
        removed, freed = self._prune_by_age()
        removed_size, freed_size = self._prune_by_size()
        self._stats["pruned"] = int(self._stats.get("pruned", 0) or 0) + removed + removed_size
        self._stats["last_cleanup"] = int(time.time())
        self.save_data("stats", self._stats)
        if removed or removed_size:
            logger.info(
                f"群晖图片桥清理完成（{reason}）：按天数删除 {removed} 个，按容量删除 {removed_size} 个，"
                f"释放 {freed + freed_size} 字节"
            )
        return {"removed": removed + removed_size, "freed_bytes": freed + freed_size}

    def _current_config(self) -> Dict[str, Any]:
        """返回当前配置快照，供 Vue 配置页初始化。

        :return: 插件配置字典
        """
        return {
            "enabled": self._enabled,
            "retention_days": self._retention_days,
            "max_size_mb": self._max_size_mb,
            "extra_hosts": "\n".join(self._extra_hosts),
        }

    def _ensure_dir(self) -> Path:
        """确保缓存目录存在并返回其路径。

        :return: 缓存目录路径
        """
        directory = self.get_data_path() / "images"
        try:
            directory.mkdir(parents=True, exist_ok=True)
        except OSError as error:
            logger.error(f"群晖图片桥创建缓存目录失败：{error}")
        return directory

    def _file_response(self, path: Path, content_type: Optional[str] = None) -> FileResponse:
        """构造带长缓存的图片响应。

        :param path: 本地缓存文件路径
        :param content_type: 下载时获得的原始类型，可缺省
        :return: 文件响应对象
        """
        media_type = content_type if content_type in _IMAGE_SUFFIX_BY_TYPE else "image/jpeg"
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=604800"},
        )

    @staticmethod
    def _decode_source(src: str) -> str:
        """解码查询参数中的图片来源地址。

        :param src: 可能经过 URL 编码的图片地址
        :return: 原始地址；非法时返回空字符串
        """
        from urllib.parse import unquote

        value = unquote(src or "").strip()
        if not value.startswith(("http://", "https://")):
            return ""
        return value

    @staticmethod
    def _digest(url: str) -> str:
        """计算图片地址的稳定摘要，用于缓存文件名。

        :param url: 图片地址
        :return: 32 位十六进制摘要
        """
        return hashlib.sha256(url.encode("utf-8")).hexdigest()[:32]

    def _allowed_hosts(self) -> set:
        """汇总允许取图的媒体服务器主机名。

        :return: 主机名集合，包含插件配置中的额外主机
        """
        hosts = {host for host in self._extra_hosts if host}
        hosts.update(_BUILTIN_IMAGE_HOSTS)
        try:
            for config in MediaServerHelper().get_configs(include_disabled=True).values():
                for key in ("host", "play_host"):
                    hostname = urlparse(str((config.config or {}).get(key) or "").strip()).hostname
                    if hostname:
                        hosts.add(hostname.lower())
        except Exception as error:  # noqa: BLE001 - 媒体服务器未配置时不影响插件加载
            logger.debug(f"群晖图片桥读取媒体服务器配置失败：{error}")
        return hosts

    def _media_server_for(self, url: str) -> Optional[Dict[str, Any]]:
        """按主机名匹配已配置的媒体服务器。

        :param url: 图片地址
        :return: 命中的媒体服务器配置字典，未命中返回 None
        """
        hostname = (urlparse(url).hostname or "").lower()
        try:
            for config in MediaServerHelper().get_configs(include_disabled=True).values():
                data = config.config or {}
                for key in ("host", "play_host"):
                    if (urlparse(str(data.get(key) or "").strip()).hostname or "").lower() == hostname:
                        return data
        except Exception as error:  # noqa: BLE001 - 读取失败时按未匹配处理
            logger.debug(f"群晖图片桥匹配媒体服务器失败：{error}")
        return None

    def _with_media_server_key(self, url: str) -> str:
        """为缺少鉴权参数的图片地址补上所属媒体服务器的 API 密钥。

        :param url: 原始图片地址
        :return: 可能补上 api_key 的图片地址
        """
        parsed = urlparse(url)
        query = dict(
            item.split("=", 1) if "=" in item else (item, "")
            for item in (parsed.query or "").split("&")
            if item
        )
        if any(key in query for key in ("api_key", "api-key", "apikey", "X-Emby-Token")):
            return url
        data = self._media_server_for(url)
        apikey = str((data or {}).get("apikey") or "").strip()
        if not apikey:
            return url
        separator = "&" if parsed.query else "?"
        return f"{url}{separator}api_key={apikey}"


    def _is_allowed_url(self, url: str) -> bool:
        """判断图片地址是否属于允许的媒体服务器。

        :param url: 待校验的图片地址
        :return: 主机在白名单内且不含用户信息时为 True
        """
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            return False
        if parsed.username or parsed.password:
            return False
        return parsed.hostname.lower() in self._allowed_hosts()

    def _download(self, url: str) -> Tuple[Optional[bytes], Optional[str]]:
        """下载原始图片内容。

        媒体服务器通常位于内网，请求必须绕过宿主运行时可能注入的全局代理，
        因此这里使用一个显式关闭环境代理的独立会话。

        :param url: 图片地址
        :return: 图片字节内容与响应内容类型
        """
        try:
            session = requests.Session()
            session.trust_env = False
            response = RequestUtils(session=session).get_res(url=url, timeout=20)
        except Exception as error:  # noqa: BLE001 - 网络异常统一转成下载失败
            logger.warning(f"群晖图片桥下载图片异常：{error}")
            return None, None
        if not response or response.status_code != 200 or not response.content:
            logger.warning(
                f"群晖图片桥下载图片失败：{getattr(response, 'status_code', 'N/A')} {url}"
            )
            return None, None
        return response.content, (response.headers.get("content-type") or "").split(";")[0]

    def _write_cache(self, path: Path, content: bytes) -> None:
        """把图片写入缓存文件。

        :param path: 目标缓存路径
        :param content: 图片字节内容
        """
        tmp = path.with_suffix(".tmp")
        try:
            tmp.write_bytes(content)
            tmp.replace(path)
            self._stats["written"] = int(self._stats.get("written", 0) or 0) + 1
        except OSError as error:
            logger.error(f"群晖图片桥写入缓存失败：{error}")

    def _list_entries(self) -> List[Dict[str, Any]]:
        """列出缓存文件及其大小与写入时间。

        :return: 按写入时间倒序排列的条目列表
        """
        entries: List[Dict[str, Any]] = []
        directory = self._ensure_dir()
        for path in directory.glob("*"):
            try:
                if not path.is_file():
                    continue
                info = path.stat()
                entries.append(
                    {
                        "name": path.name,
                        "size": info.st_size,
                        "created": int(info.st_mtime),
                    }
                )
            except OSError:
                continue
        return sorted(entries, key=lambda item: item["created"], reverse=True)

    def _prune_by_age(self) -> Tuple[int, int]:
        """删除超过保留天数的缓存文件。

        :return: 删除数量与释放字节数
        """
        deadline = time.time() - self._retention_days * 86400
        removed, freed = 0, 0
        with self._lock:
            for entry in self._list_entries():
                if entry["created"] >= deadline:
                    continue
                try:
                    (self._ensure_dir() / entry["name"]).unlink()
                    removed += 1
                    freed += entry["size"]
                except OSError:
                    continue
        return removed, freed

    def _prune_by_size(self) -> Tuple[int, int]:
        """按容量上限删除最旧的缓存文件。

        :return: 删除数量与释放字节数
        """
        limit = self._max_size_mb * 1024 * 1024
        entries = self._list_entries()
        total = sum(item["size"] for item in entries)
        removed, freed = 0, 0
        with self._lock:
            for entry in reversed(entries):
                if total <= limit:
                    break
                try:
                    (self._ensure_dir() / entry["name"]).unlink()
                    total -= entry["size"]
                    removed += 1
                    freed += entry["size"]
                except OSError:
                    continue
        return removed, freed

    def _maybe_prune(self) -> None:
        """限频触发一次容量与过期清理，避免每次请求都扫描目录。"""
        now = time.time()
        if now - self._last_prune < 600:
            return
        self._last_prune = now
        try:
            self.prune(reason="request")
        except Exception as error:  # noqa: BLE001 - 清理失败不影响取图
            logger.warning(f"群晖图片桥自动清理失败：{error}")

    def _count_hit(self) -> None:
        """累计一次缓存命中。"""
        self._stats["hits"] = int(self._stats.get("hits", 0) or 0) + 1
        self.save_data("stats", self._stats)

    def _count_miss(self) -> None:
        """累计一次缓存未命中。"""
        self._stats["misses"] = int(self._stats.get("misses", 0) or 0) + 1
        self.save_data("stats", self._stats)

    @staticmethod
    def _as_int(value: Any, default: int, minimum: int, maximum: int) -> int:
        """把配置值转换为限定范围内的整数。

        :param value: 原始配置值
        :param default: 无法解析时使用的默认值
        :param minimum: 允许的最小值
        :param maximum: 允许的最大值
        :return: 规整后的整数
        """
        try:
            number = int(value)
        except (TypeError, ValueError):
            return default
        return max(minimum, min(maximum, number))

    @staticmethod
    def _as_hosts(value: Any) -> List[str]:
        """把多行文本解析为主机名列表。

        :param value: 多行或列表形式的主机配置
        :return: 去重后的主机名列表
        """
        if isinstance(value, (list, tuple)):
            candidates = [str(item) for item in value]
        else:
            candidates = str(value or "").replace(",", "\n").splitlines()
        hosts: List[str] = []
        for candidate in candidates:
            host = candidate.strip().lower()
            if not host:
                continue
            hostname = urlparse(host if "//" in host else f"//{host}").hostname
            if hostname and hostname not in hosts:
                hosts.append(hostname)
        return hosts
