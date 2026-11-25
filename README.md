# MoviePilot 插件仓库（本地/自建）

MoviePilot V3 插件源。把这个地址加入 MoviePilot 的 `PLUGIN_MARKET`（设置 → 插件 → 插件市场仓库）即可在插件市场安装、更新。

```
https://github.com/gi29734401/MoviePilot-Plugins
```

## 插件列表

| 插件 | 说明 |
| --- | --- |
| **群晖图片桥**（`SynologyImageBridge`） | 为 Synology Chat 等外部渠道提供**带图片扩展名**、**免登录**的图片地址：原图落盘缓存，按保留天数与容量上限自动清理，附 Vue 配置页与缓存统计页 |

## 群晖图片桥（SynologyImageBridge）

### 解决什么问题

Synology Chat 的 incoming webhook 只接受**路径以图片扩展名结尾**的 `file_url`：

- `https://emby.example.com/Items/123/Images/Backdrop` → 没有扩展名 → 返回 `{"error":{"code":117}}`，**整条消息被丢弃**（连文字一起丢）；
- `https://example.com/x.jpg` → 正常发送。

而 MoviePilot 的媒体库通知把 Emby/Jellyfin 的图片地址原样塞进 `file_url`，于是群晖渠道的通知全部失败。

本插件在 MoviePilot 侧提供图片网关：

```
群晖 → https://<mp>/api/v1/plugin/SynologyImageBridge/img/<摘要>.webp?src=<源地址>
        ↓ 命中缓存直接返回；未命中则按需下载原图并落盘
      原图（不压缩）
```

- **不压缩原图**，仅按保留天数 / 容量上限清理；
- 只接受**已配置媒体服务器**（含外网播放地址）的图片主机，外加 Emby/Plex/Jellyfin 官方兜底图标主机，不做任意 URL 代理；
- 匿名路由只接受本插件写出的 `<32位摘要>.<后缀>` 文件，不存在即 404。

### 配置项

| 配置 | 说明 |
| --- | --- |
| 启用插件 | 开关；关闭后图片网关不响应 |
| 缓存保留天数 | 默认 7 天，范围 1–365 |
| 缓存容量上限 | 默认 512 MB，范围 16–20480；超限时按写入时间删最旧 |
| 额外允许的图片主机 | 每行一个主机名；已配置的媒体服务器主机默认允许 |

### 详情页

详情页展示缓存张数、占用空间、命中率、最近写入条目与容量占用条，并提供「清空缓存」。

### 配合的核心改动

群晖渠道原先直接发送 `file_url`，需要配合 MoviePilot 侧改动：

1. 通知图片改写为图片桥地址（路径带扩展名）；
2. 带图发送失败时自动去掉图片、降级为纯文本重发；
3. `[查看详情](url)` 改为 `查看详情：url`（群晖不解析 Markdown 链接）。

## 本地开发

```bash
# 前端（Vue 联邦）
cd frontend
npm install
npm run build     # 产物输出到 plugins.v3/synologyimagebridge/dist
```

MoviePilot 侧把本仓库目录加入本地插件源：

```
PLUGIN_LOCAL_REPO_PATHS=/config/local-plugins
```
