# DreamAtlas 云端访问说明

当前仓库是静态前端（HTML/CSS/JS），可用两种方式部署：

## 1) 临时公网访问（最快）

适合演示：一条命令生成公网链接（`https://*.lhr.life` 或 `https://*.localhost.run`）。

```bash
./scripts/cloud_share.sh 4173
```

运行后终端会打印公网 URL，把该链接发给别人即可访问。  
> 注意：这是临时隧道，终端关闭后链接失效。

## 2) 持久化托管（推荐）

可部署到 Vercel / Netlify / Cloudflare Pages：
- 该项目无后端依赖，直接把仓库连接到静态站点托管平台即可。
- 发布目录为仓库根目录（包含 `index.html`）。

