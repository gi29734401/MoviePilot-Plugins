# 群晖图片桥（SynologyImageBridge）

为 Synology Chat 等外部渠道提供**带图片扩展名**、**免登录**的图片地址：原图落盘缓存，按保留天数与容量上限自动清理。

## 解决什么问题

Synology Chat 的 incoming webhook 只接受**路径以图片扩展名结尾**的 `file_url`：

| file_url | 群晖返回 |
| --- | --- |
| `https://emby.example.com/Items/123/Images/Backdrop`（无扩展名） | `{"error":{"code":117}}`，**整条消息被丢弃** |
| `https://example.com/x.jpg` | `success: true` |

而 MoviePilot 的媒体库通知把 Emby/Jellyfin 的图片地址原样放进 `file_url`，因此群晖渠道的通知会全部失败（连文字一起丢）。

本插件在 MoviePilot 侧提供图片网关：

```
群晖 → https://<mp>/api/v1/plugin/SynologyImageBridge/img/<摘要>.webp?src=<源地址>
        ↓ 命中缓存直接返回；未命中则按需下载原图并落盘
      原图（不压缩）
```

- 路径后缀使用 `.webp`：既满足群晖的扩展名校验，又避免常见反向代理把 `.jpg/.png` 当作静态文件拦截；
- **不压缩原图**，只按保留天数 / 容量上限清理；
- 仅允许**已配置媒体服务器**（含外网播放地址）的图片主机，外加 Emby/Plex/Jellyfin 官方兜底图标主机，不做任意 URL 代理；
- 匿名路由只接受本插件写出的 `<32位摘要>.<后缀>`，文件不存在直接 404。

## 配置

| 配置 | 说明 |
| --- | --- |
| 启用插件 | 关闭后图片网关不响应 |
| 缓存保留天数 | 默认 7 天（1–365） |
| 缓存容量上限 | 默认 512 MB（16–20480），超限按写入时间删最旧 |
| 额外允许的图片主机 | 每行一个主机名；已配置媒体服务器默认允许 |

详情页展示缓存张数、占用空间、命中率、最近写入条目与容量占用，并提供「清空缓存」。

## 需要配合的核心改动

本插件只解决"提供带扩展名的匿名图片地址"，群晖渠道仍需要 MoviePilot 侧配合：

1. 通知图片改写为图片桥地址；
2. 带图发送失败时自动去掉图片、降级为纯文本重发；
3. `[查看详情](url)` → `查看详情：url`（群晖不解析 Markdown 链接）。

## 本地开发

```bash
cd frontend
npm install
npm run build   # 产物输出到 ../../plugins.v3/synologyimagebridge/dist
```
