// 临时样例验证生成边界与导图结果，不读取或修改 App 项目。
const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { dependency } = require('./runtime.cjs')
const sharp = dependency('sharp', 'APP_WORKFLOW_SHARP_MODULE')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'app-workflow-test-'))
after(() => fs.rmSync(root, { recursive: true, force: true }))
function run(file, args) {
  return spawnSync(process.execPath, [path.join(__dirname, file), ...args], { encoding: 'utf8', timeout: 60000 })
}
function fixture(name) { const dir = path.join(root, name); fs.mkdirSync(dir); return dir }
function config(dir, patch = {}) {
  fs.writeFileSync(path.join(dir, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor"><rect x="8" y="4" width="16" height="24"/></svg>')
  const data = {
    version: 1, icons: { sample: { regular: 'icon.svg' } },
    variants: { light: { state: 'regular', color: '#112233' }, dark: { state: 'regular', color: '#aabbcc' } },
    layouts: { tab: { width: 24, height: 24, visibleHeight: 24, top: 0 }, padded: { width: 32, height: 32, visibleHeight: 24, top: 4 } },
    output: 'generated/{icon}-{variant}-{layout}.png', ...patch
  }
  const file = path.join(dir, 'icons.json')
  fs.writeFileSync(file, JSON.stringify(data))
  return file
}
test('图标清单生成多个主题和尺寸，颜色与可见顶部符合配置', async () => {
  const dir = fixture('icons'), file = config(dir)
  const generated = run('build-icons.cjs', ['--config', file])
  assert.equal(generated.status, 0, generated.stderr)
  assert.equal(fs.readdirSync(path.join(dir, 'generated')).length, 4)
  for (const [variant, rgb] of [['light', [17, 34, 51]], ['dark', [170, 187, 204]]]) {
    for (const [layout, size, top] of [['tab', 24, 0], ['padded', 32, 4]]) {
      const { data, info } = await sharp(path.join(dir, 'generated', `sample-${variant}-${layout}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.equal(info.width, size)
      assert.equal(info.height, size)
      const y = Math.floor(size / 2), x = Math.floor(size / 2), offset = (y * size + x) * 4
      assert.deepEqual([...data.subarray(offset, offset + 3)], rgb)
      let first = size
      for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) if (data[(row * size + col) * 4 + 3]) first = Math.min(first, row)
      assert.equal(first, top)
    }
  }
  const checked = run('build-icons.cjs', ['--config', file, '--check'])
  assert.equal(checked.status, 0, checked.stderr)
  const target = path.join(dir, 'generated/sample-light-tab.png')
  fs.writeFileSync(target, 'changed')
  assert.notEqual(run('build-icons.cjs', ['--config', file, '--check']).status, 0)
  assert.equal(fs.readFileSync(target, 'utf8'), 'changed', '一致性检查不能覆盖文件')
})
test('图形越界与输出路径冲突在写文件前失败', () => {
  for (const [name, patch] of [['overflow', { layouts: { tab: { width: 24, height: 24, visibleHeight: 24, top: 1 } } }], ['duplicate', { output: 'generated/same.png' }]]) {
    const dir = fixture(name), file = config(dir, patch)
    assert.notEqual(run('build-icons.cjs', ['--config', file]).status, 0)
    assert.equal(fs.existsSync(path.join(dir, 'generated')), false)
  }
})
test('局部 HTML 导图支持查询参数、深色系统主题和输出尺寸', async () => {
  const dir = fixture('html'), input = path.join(dir, 'page.html'), output = path.join(dir, 'result.png')
  fs.writeFileSync(input, '<!doctype html><meta charset="utf-8"><style>body{margin:0}#card{width:80px;height:40px;background:white}@media(prefers-color-scheme:dark){#card{background:#234567}}</style><div id="card">原型</div><script>if(new URLSearchParams(location.search).get("variant")!=="dark")throw Error("参数缺失")</script>')
  const result = run('render-html.cjs', ['--input', input, '--output', output, '--width', '200', '--height', '100', '--scale', '1', '--query', 'variant=dark', '--theme', 'dark', '--selector', '#card'])
  assert.equal(result.status, 0, result.stderr)
  const metadata = await sharp(output).metadata()
  assert.equal(metadata.width, 80)
  assert.equal(metadata.height, 40)
  const sample = await sharp(output).extract({ left: 79, top: 39, width: 1, height: 1 }).removeAlpha().raw().toBuffer()
  assert.deepEqual([...sample], [35, 69, 103])
})
test('图片缺失或页面脚本报错时不导出成功图片', () => {
  for (const [name, html] of [['broken', '<img src="missing.png">'], ['script-error', '<script>throw Error("页面错误")</script>']]) {
    const dir = fixture(name), input = path.join(dir, 'page.html'), output = path.join(dir, 'result.png')
    fs.writeFileSync(input, '<!doctype html>' + html)
    const result = run('render-html.cjs', ['--input', input, '--output', output])
    assert.notEqual(result.status, 0)
    assert.equal(fs.existsSync(output), false)
  }
})
test('未知参数被拒绝，不隐式覆盖输出', () => {
  assert.notEqual(run('build-icons.cjs', ['--chek']).status, 0)
  assert.notEqual(run('render-html.cjs', ['--unknown']).status, 0)
})
