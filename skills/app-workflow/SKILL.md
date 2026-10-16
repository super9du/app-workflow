---
name: app-workflow
description: 建立 App 项目设计规范与 design token，并依据设计资料完成组件分析、复用和界面开发。Web、PC 客户端、手机客户端、微信小程序等大前端开发，只要涉及设计图、设计稿、原型、截图、Figma 或 HTML 设计稿，必须应用 develop 流程；也支持按需将 HTML 转图片、SVG 转 PNG。
---

# App 设计与开发工作流

用户入口为 `init` 与 `develop`，也接受自然语言。它们是本 Skill 的任务路由参数，不保证客户端注册了对应斜杠命令；支持的客户端可使用 `/app-workflow init`。

## 任务路由

- **init：项目设计配置**。用户要求建立项目设计基础时，读取 [project-setup.md](references/project-setup.md)。先检查 Git 并按需初始化本地仓库，再确定 DESIGN.md、design token 和所需平台技能。重复执行只补缺项，不覆盖已确认成果。
- **develop：按设计开发**。大前端界面开发存在相关设计资料时，无需用户显式调用，必须读取并执行 [design-to-code.md](references/design-to-code.md)。
- **制作设计稿**。用户需要探索或制作界面方案时，读取 [design-options.md](references/design-options.md)，根据目标推荐概念图、HTML 交互原型或 Figma。已有设计资料的开发不重复选路径。
- **辅助能力由 agent 判断**。需要 HTML 转图片时读取 [html-to-image.md](references/html-to-image.md)；需要将已有 SVG 按主题、状态、尺寸转 PNG 时读取 [svg-to-png.md](references/svg-to-png.md)。它们不是额外用户子命令，也不是每次开发的必经步骤。

只加载当前任务相关的说明。本 Skill 不替代项目 AGENTS.md、产品规则或专业平台工具，不统一不同项目的技术栈和视觉风格。

## 通用约定

- 先读已有代码和规范。已有上下文不重复询问；分析结果简短告知用户后继续已授权工作，不逐项增加审批。
- 仅参考风格与按图还原是不同要求；依用户表述执行，关键歧义影响结果时再询问。
- 较大重构先说明原因、范围和影响，询问是否重构；获准后先保存并提交当前代码作为恢复基线，不将敏感文件纳入提交。
- 专业技能按任务选用，避免同时加载多个职责重叠的技能。优先已有技能；缺少时说明用途、提供可信来源并建议安装，不自动安装或上传资料到外部服务。
- 命令中的 `<skill-dir>` 指本 SKILL.md 所在目录。项目输入、配置和输出使用当前项目路径，不依赖固定仓库结构或个人机器路径。

## 工具运行与检查

复用已有 Node、sharp、Playwright 与 Chrome；可用 APP_WORKFLOW_SHARP_MODULE、APP_WORKFLOW_PLAYWRIGHT_MODULE、APP_WORKFLOW_CHROME_PATH 指定宿主依赖。转换参数由项目清单提供，不写回全局 Skill。

`node <skill-dir>/scripts/test.cjs` 检查现有转换脚本，在临时目录生成样例，使用独立无头浏览器，不修改用户项目、登录会话或全局配置。需要已有 sharp、Playwright 和 Chrome。缺图或页面脚本错误时导图失败，不交付空白截图。
