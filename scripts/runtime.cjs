// 宿主工具依赖按需加载，不将个人机器路径或 App 项目依赖写死。
const path = require('node:path')
function dependency(name, environmentKey) {
  try {
    const override = process.env[environmentKey]
    return require(override || require.resolve(name, { paths: [process.cwd(), __dirname] }))
  } catch (_) {
    throw new Error('未找到 ' + name + '。可使用项目已有模块，或设置 ' + environmentKey + ' 为宿主模块的绝对路径。')
  }
}
function positiveInteger(value, name, max = 8192) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1 || number > max) throw new Error(name + ' 必须是 1 至 ' + max + ' 的整数。')
  return number
}
module.exports = { dependency, positiveInteger }
