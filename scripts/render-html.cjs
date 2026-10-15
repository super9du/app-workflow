// 在独立无头浏览器中渲染本地设计稿，不复用个人浏览器的会话。
const fs = require('node:fs/promises')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { parseArgs } = require('node:util')
const { dependency, positiveInteger } = require('./runtime.cjs')
async function main() {
  const { values } = parseArgs({ options: {
    input: { type: 'string' }, output: { type: 'string' }, width: { type: 'string', default: '980' }, height: { type: 'string', default: '1090' },
    scale: { type: 'string', default: '1.5' }, query: { type: 'string' }, theme: { type: 'string' }, selector: { type: 'string' }, help: { type: 'boolean' }
  } })
  if (values.help) { console.log('用法：node render-html.cjs --input 本地.html --output 预览.png [--width 980 --height 1090 --scale 1.5 --theme dark --query variant=dark --selector .phone]'); return }
  if (!values.input || !values.output) throw new Error('必须指定 --input 本地 HTML 与 --output PNG。')
  const source = path.resolve(values.input), output = path.resolve(values.output)
  if (path.extname(source).toLowerCase() !== '.html' || path.extname(output).toLowerCase() !== '.png') throw new Error('输入须为本地 .html 文件，输出须为 .png。')
  await fs.access(source)
  const width = positiveInteger(values.width, 'width'), height = positiveInteger(values.height, 'height')
  const scale = Number(values.scale)
  if (!Number.isFinite(scale) || scale < 0.5 || scale > 4) throw new Error('scale 必须在 0.5 至 4 之间。')
  if (values.theme && !['dark', 'light'].includes(values.theme)) throw new Error('theme 仅支持 dark 或 light。')
  const { chromium } = dependency('playwright', 'APP_WORKFLOW_PLAYWRIGHT_MODULE')
  const browser = await chromium.launch({ headless: true, ...(process.env.APP_WORKFLOW_CHROME_PATH ? { executablePath: process.env.APP_WORKFLOW_CHROME_PATH } : { channel: 'chrome' }) })
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, ...(values.theme ? { colorScheme: values.theme } : {}) })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const url = pathToFileURL(source)
    if (values.query) url.search = values.query
    await page.goto(url.href, { timeout: 30000 })
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})))
    })
    const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length)
    if (errors.length || broken) throw new Error('页面有脚本错误或未加载图片，停止导出。')
    await fs.mkdir(path.dirname(output), { recursive: true })
    if (values.selector) await page.locator(values.selector).screenshot({ path: output, timeout: 10000 })
    else await page.screenshot({ path: output, fullPage: true })
    console.log('HTML 截图已导出：' + output)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
