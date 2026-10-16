# HTML 转图片

适用于已有的本地 HTML 设计稿，不用于登录真实站点、操作用户浏览器或替代手机/模拟器截图。脚本会执行该 HTML 的页面脚本；只对用户任务授权的本地内容使用。

```bash
node <skill-dir>/scripts/render-html.cjs --input /path/to/prototype.html --output /path/to/review.png
```

可选项：

| 参数 | 作用 |
| --- | --- |
| `--width 980 --height 1090` | 浏览器视口，单位 CSS px |
| `--scale 1.5` | 输出像素倍率，范围 0.5–4 |
| `--theme dark` | 系统 prefers-color-scheme，可选 light/dark |
| `--query variant=dark` | 本地页面的 URL 查询参数 |
| `--selector .phone` | 只截取一个匹配的组件；省略时导出全页 |

页面若靠自己的类名或状态选择主题，单设 --theme 不会替它切换。使用页面支持的 --query，或在原型内提供切换机制，不注入任意 DOM/CSS 强改成另一版设计。

依赖 Node.js 18+、Playwright 与已安装的 Chrome。默认使用 Chrome channel；可设置 APP_WORKFLOW_PLAYWRIGHT_MODULE、APP_WORKFLOW_CHROME_PATH 指定已有位置。不要遇到 Playwright 缺少自带 Chromium 就直接下载，先检查系统 Chrome 是否可用。

脚本在独立无头浏览器中等待字体和图片加载，发现图片失效或页面 JavaScript 异常就停止，不交付看似成功的空白图。截图后仍应目视检查布局、颜色、裁切与字体；自动检查不能证明设计正确。

输出路径与已有文件由用户任务确定，PNG 会覆盖同名导出文件。使用独立无头浏览器，不需要项目服务端或个人浏览器会话。
