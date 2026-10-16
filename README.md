# app-workflow

用 AI 开发界面时，你是否遇到过这些问题？

- 同一个项目，每次生成的页面风格都不一样，颜色、间距和圆角越改越乱。
- 已经有设计稿，AI 却直接开始写页面，没有检查现有组件，最后多出一套重复实现。
- 想做一个新应用，却不知道该先定设计规范、做交互原型，还是画 Figma。
- 代码看起来没问题，实际运行后才发现深色主题、长文案或交互状态没有处理好。

**app-workflow 是一套给 AI 编程助手使用的设计与开发工作流 Skill**，适用于 Web、PC 客户端、手机客户端和微信小程序。它帮助 AI 先理解项目的设计规则和已有组件，再把设计资料落实为界面，并检查实际渲染与交互。

## 它如何帮助你

| 你的需求 | 工作流会做什么 |
| --- | --- |
| 为项目建立设计基础 | 通过 `init` 梳理或补齐 `DESIGN.md` 与设计 token，让后续页面沿用同一套视觉规则 |
| 根据设计稿开发界面 | 通过 `develop` 读取设计与代码，先判断组件该复用、扩展还是新增，再从基础组件到页面逐步实现 |
| 还没确定设计方案 | 根据目标选择概念图、HTML 交互原型或 Figma；需要探索时，先比较少量核心页面方案 |
| 检查实现是否符合设计 | 对照实际渲染，检查本次任务涉及的主题、长内容、视口及交互状态，并说明验证范围 |

已有规范和 token 会继续复用；重复初始化只补缺项。工作流尊重项目的技术栈、业务规则与组件边界，具体的平台开发和设计操作按需配合专业技能完成。

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

`-g` 表示用户级全局安装；省略则安装到当前项目。

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

## 如何使用

安装后，在支持 Skill 的 AI 编程助手中用自然语言提出需求即可。

### 1. 新项目，或需要补齐设计规范

```text
使用 app-workflow init，为这个微信小程序建立设计规范和设计 token。
```

AI 会先检查 Git 环境，按需初始化本地仓库，再检查已有代码和设计资料，建立或补齐设计基础。可选关联 GitHub 或 Gitee，方便备份和协作；不关联也可使用本地 Git 开发。你会得到设计规范的位置、token 的使用方式、已有组件入口，以及必要的平台技能提醒。

如果还没有设计方向，可以先说明产品目标：

```text
我想做一个给个人使用的记账应用，先用 app-workflow 帮我确定设计方向，做一个可操作的 HTML 原型。
```

### 2. 已有设计，直接开发

```text
根据这份设计稿开发设置页，使用 app-workflow，沿用项目已有组件和深浅主题。
```

涉及设计图、截图、原型、Figma 或 HTML 设计稿的界面开发，会进入 `develop` 流程，无需每次重新初始化。AI 会先简要说明组件方案，再实现并验证。

需要在项目中明确这项约定时，可将以下规则加入项目的 `AGENTS.md`：

> 大前端界面开发涉及设计图、设计稿、原型、截图、Figma 或 HTML 设计稿时，必须使用 app-workflow 的 develop 流程。

`init` 和 `develop` 是 Skill 的流程名称。本仓库不提供独立 CLI；斜杠命令是否可用、如何书写，取决于客户端。

### 3. 提供多种工具辅助应用开发

```text
- 将这个 HTML 原型转为图片。
- 将现有 SVG 按深浅主题生成 PNG 图标资源。
```

工具为辅助能力，由 AI 按任务选用，不是每次开发的必经步骤。后续会增加更多辅助工具。

## 环境与扩展能力

`init` 的 Git 检查脚本需要 Node.js 18+；未安装 Git 时会提示安装。

使用设计与开发流程，无需一次性安装所有转换工具。只有用到对应能力时才需要准备依赖：

| 能力 | 所需环境 |
| --- | --- |
| HTML 转图片 | Node.js 18+、Playwright、Chrome |
| SVG 转 PNG | Node.js 18+、sharp |
| Figma 操作、平台开发等 | 按任务检查对应技能和连接条件 |

流程入口见 [SKILL.md](skills/app-workflow/SKILL.md)。详细说明按任务拆分在 [references](skills/app-workflow/references/) 中，AI 只需读取当前任务相关内容。

## 维护与验证

Git 初始化脚本可单独验证，无需图片转换依赖：

```bash
node --test skills/app-workflow/scripts/setup-git.test.cjs
```

修改转换脚本后，可运行：

```bash
node skills/app-workflow/scripts/test.cjs
```

测试需要上述转换依赖，在临时目录中生成样例，并使用独立无头浏览器。可通过 `APP_WORKFLOW_SHARP_MODULE`、`APP_WORKFLOW_PLAYWRIGHT_MODULE`、`APP_WORKFLOW_CHROME_PATH` 指向已有依赖。

这组测试检查转换脚本；具体项目的界面仍需在对应平台验证实际渲染和交互。
