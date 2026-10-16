// 检查 Git 并按需初始化；不修改远程地址、身份配置或提交文件。
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

function setupGit(projectDir) {
  const cwd = fs.realpathSync(projectDir)
  if (!fs.statSync(cwd).isDirectory()) throw new Error('项目路径必须是已有目录')
  const git = args => spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 15000, env: { ...process.env, LC_ALL: 'C' } })
  const version = git(['--version'])
  if (version.error?.code === 'ENOENT') {
    console.error('未找到 Git。请先从 https://git-scm.com/downloads 安装 Git，安装后重新运行本脚本。')
    return 2
  }
  if (version.error || version.status !== 0) throw new Error(version.error?.message || version.stderr || 'Git 无法运行，请检查安装环境')
  const probe = git(['rev-parse', '--absolute-git-dir'])
  if (probe.status === 0) {
    console.log(`当前项目已属于 Git 仓库：${probe.stdout.trim()}`)
  } else {
    // 已有仓库损坏、权限或信任配置异常时，不用 init 掩盖错误。
    let current = cwd
    while (true) {
      if (fs.existsSync(path.join(current, '.git')) || fs.existsSync(path.join(current, 'HEAD')) && fs.existsSync(path.join(current, 'objects'))) {
        throw new Error(probe.error?.message || probe.stderr || '已有 Git 仓库无法读取')
      }
      const parent = path.dirname(current)
      if (parent === current) break
      current = parent
    }
    if (probe.error || !/not a git repository/i.test(probe.stderr || '')) throw new Error(probe.error?.message || probe.stderr || '无法确定 Git 仓库状态')
    const init = git(['init'])
    if (init.error || init.status !== 0) throw new Error(init.error?.message || init.stderr || 'Git 初始化失败')
    console.log(`已初始化本地 Git 仓库：${cwd}`)
  }
  console.log('本地 Git 已可用于记录版本、比较改动和回退。可选关联 GitHub 或 Gitee 远程仓库，便于异地备份、跨设备同步和团队协作；不关联也可继续本地开发。')
  return 0
}

if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error('用法：node setup-git.cjs <项目目录>')
    process.exitCode = 1
  } else {
    try { process.exitCode = setupGit(args[0]) } catch (error) { console.error(error.message); process.exitCode = 1 }
  }
}
