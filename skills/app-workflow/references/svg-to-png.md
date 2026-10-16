# SVG 转 PNG 图标资源

优先使用项目已有的 SVG 和许可。支持 `fill="currentColor"` 或 `stroke="currentColor"` 换色；保留品牌原色时不配置 color。此脚本不联网查找图标，不生成新图形。

在项目中创建清单，例如 icons.json（以下文件由项目提供，路径相对清单目录）：

```json
{
  "version": 1,
  "icons": {
    "discover": {
      "regular": "assets/source/compass.svg",
      "selected": "assets/source/compass-fill.svg"
    }
  },
  "variants": {
    "light": { "state": "regular", "color": "#777777" },
    "light-selected": { "state": "selected", "color": "#171717" },
    "dark": { "state": "regular", "color": "#b9b9b9" },
    "dark-selected": { "state": "selected", "color": "#f5f5f5" }
  },
  "layouts": {
    "tab": { "width": 56, "height": 56, "visibleHeight": 56, "top": 0 }
  },
  "output": "assets/generated/{icon}-{variant}-{layout}.png"
}
```

```bash
node <skill-dir>/scripts/build-icons.cjs --config /path/to/icons.json
node <skill-dir>/scripts/build-icons.cjs --config /path/to/icons.json --check
```

- 笛卡尔组合 icons × variants × layouts，输出命名必须避免冲突。
- width、height、visibleHeight、top 均是**图片像素**，不等于组件的布局尺寸。图形水平居中，top 为画布透明留白；默认 top 为 0。用于精确布局的图标宜无顶部留白，让组件样式控制间距。
- SVG 按可见范围裁边并等比缩放到 visibleHeight，超出画布会报错，不裁掉图形来凑尺寸。透明色画布固定，主题颜色支持 #RRGGBB 或 #RRGGBBAA。
- `--check` 重新渲染并逐字节比较，不修改资源。比较受 sharp 版本影响，项目需要可复现资源时在宿主工具环境锁定版本。
- 生成会覆盖清单指定的 PNG；先确认输出范围。不改 SVG、许可文件或 App 样式。

需要 Node.js 18+ 和 sharp。脚本会在当前项目及 Skill 位置查找模块，也可设置 APP_WORKFLOW_SHARP_MODULE 为已有模块目录。宿主依赖与项目运行依赖分开；在提供工作区运行库查询工具的环境，优先查找已有库。
