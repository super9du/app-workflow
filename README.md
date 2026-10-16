# app-workflow

面向 Web、PC 客户端、手机客户端和微信小程序的设计与开发工作流 Skill。

- `init`：建立 DESIGN.md、design token，选择设计路径并检查平台技能。
- `develop`：有设计资料的大前端界面开发自动应用，先分析组件和复用，再按 token 实现。
- agent 按需调用 HTML 转图片、SVG 转 PNG 及其他专业技能。

## 安装

使用 Skills CLI（需要 Node.js 和 npx）：

```bash
npx skills add super9du/app-workflow --skill app-workflow -g
```

仅安装到 Codex：

```bash
npx skills add super9du/app-workflow --skill app-workflow -g -a codex
```

仅安装到 Claude Code：

```bash
npx skills add super9du/app-workflow --skill app-workflow -g -a claude-code
```

`-g` 表示用户级全局安装；省略则安装到当前项目。Codex 和 Claude Code 的命令通过同一个 Skills CLI 指定目标 agent，并非各客户端内置的安装子命令。已有同名技能请先保存本地修改；安装后新会话可加载技能。

## 仓库结构

```text
app-workflow/
├── README.md
└── skills/
    └── app-workflow/
        ├── SKILL.md
        ├── agents/
        ├── references/
        └── scripts/
```

仓库说明与可安装技能分离；每个技能包含自己的入口、参考文档和脚本。Skills CLI 可自动发现 `skills/` 下的技能。

## 使用

```text
使用 app-workflow init，为这个微信小程序建立设计规范和 token。
根据这份设计稿开发设置页，使用 app-workflow。
将这个 HTML 原型转为图片。
将现有 SVG 按深浅主题生成 PNG 图标资源。
```

支持技能参数的客户端可使用 `app-workflow init`；斜杠命令写法由客户端决定，本仓库不注册 CLI 或全局命令。普通按设计开发无需手动指定 develop。

需要在项目中强化路由时，可将以下规则加入项目 AGENTS.md：

> 大前端界面开发涉及设计图、设计稿、原型、截图、Figma 或 HTML 设计稿时，必须使用 app-workflow 的 develop 流程。

## 文件与依赖

入口见 [SKILL.md](skills/app-workflow/SKILL.md)。初始化、开发、设计路径及转换说明按需加载，位于 skills/app-workflow/references/。

转换脚本需要 Node.js 18+；SVG 转 PNG 需要 sharp；HTML 转图片需要 Playwright 与 Chrome。工作流本身不强制这些工具全部安装，只有调用转换能力时才需要。Figma 与其他专业技能均按任务选择。

```bash
node skills/app-workflow/scripts/test.cjs
```

测试使用临时目录和独立无头浏览器。可通过 APP_WORKFLOW_SHARP_MODULE、APP_WORKFLOW_PLAYWRIGHT_MODULE、APP_WORKFLOW_CHROME_PATH 指向已有依赖；不依赖个人机器固定路径。

本仓库不附带项目业务代码、个人配置、登录凭据或第三方设计资源。
