// 用项目清单生成多主题、多状态的 PNG；输入路径均相对清单所在目录。
const fs = require('node:fs/promises')
const path = require('node:path')
const { parseArgs } = require('node:util')
const { dependency, positiveInteger } = require('./runtime.cjs')
function entries(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length) throw new Error(name + ' 必须是非空对象。')
  return Object.entries(value)
}
async function main() {
  const { values } = parseArgs({ options: { config: { type: 'string' }, check: { type: 'boolean' }, help: { type: 'boolean' } } })
  if (values.help) { console.log('用法：node build-icons.cjs --config icons.json [--check]'); return }
  if (!values.config) throw new Error('缺少 --config 项目图标清单。')
  const file = path.resolve(values.config), base = path.dirname(file)
  const config = JSON.parse(await fs.readFile(file, 'utf8'))
  if (config.version !== 1) throw new Error('图标清单 version 必须为 1。')
  if (typeof config.output !== 'string' || !config.output.endsWith('.png')) throw new Error('output 必须是 PNG 路径模板。')
  const plans = [], targets = new Set(), sources = new Set()
  for (const [icon, sourceMap] of entries(config.icons, 'icons')) {
    for (const [variant, state] of entries(config.variants, 'variants')) {
      const sourceName = sourceMap?.[state?.state]
      if (typeof sourceName !== 'string' || !sourceName.endsWith('.svg')) throw new Error(icon + '/' + variant + ' 缺少对应状态的 SVG。')
      const source = path.resolve(base, sourceName)
      const svg = await fs.readFile(source, 'utf8')
      if (state.color && (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(state.color) || !svg.includes('currentColor'))) throw new Error('换色需要十六进制颜色和含 currentColor 的 SVG：' + sourceName)
      sources.add(source)
      for (const [layout, geometry] of entries(config.layouts, 'layouts')) {
        const width = positiveInteger(geometry.width, 'width'), height = positiveInteger(geometry.height, 'height')
        const visibleHeight = positiveInteger(geometry.visibleHeight, 'visibleHeight')
        const top = geometry.top ?? 0
        if (!Number.isInteger(top) || top < 0 || top + visibleHeight > height) throw new Error(layout + ' 的图形超出画布，请检查 top、visibleHeight、height。')
        const output = path.resolve(base, config.output.replace(/\{(icon|variant|layout)\}/g, (_, key) => ({ icon, variant, layout })[key]))
        if (targets.has(output)) throw new Error('输出路径重复，请在 output 中区分图标、主题和尺寸。')
        targets.add(output)
        plans.push({ svg: state.color ? svg.replace(/currentColor/g, state.color) : svg, width, height, visibleHeight, top, output })
      }
    }
  }
  if ([...targets].some(target => sources.has(target))) throw new Error('输出不能覆盖 SVG 源文件。')
  const sharp = dependency('sharp', 'APP_WORKFLOW_SHARP_MODULE')
  // 先完成所有渲染与边界检查，避免配置错误时只写出部分资源。
  const rendered = []
  for (const plan of plans) {
    const image = await sharp(Buffer.from(plan.svg), { density: 288 }).trim().resize({ height: plan.visibleHeight }).png().toBuffer()
    const metadata = await sharp(image).metadata()
    if (metadata.width > plan.width) throw new Error('图形比画布宽，不能裁切：' + plan.output)
    const buffer = await sharp({ create: { width: plan.width, height: plan.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: image, left: Math.floor((plan.width - metadata.width) / 2), top: plan.top }]).png().toBuffer()
    rendered.push({ output: plan.output, buffer })
  }
  for (const item of rendered) {
    if (values.check) {
      let actual
      try { actual = await fs.readFile(item.output) } catch (_) { throw new Error('缺少生成资源：' + item.output) }
      if (!actual.equals(item.buffer)) throw new Error('图标与生成规则不一致：' + item.output)
    } else {
      await fs.mkdir(path.dirname(item.output), { recursive: true })
      await fs.writeFile(item.output, item.buffer)
    }
  }
  console.log((values.check ? '图标一致性检查通过：' : '图标生成完成：') + rendered.length + ' 个。')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
