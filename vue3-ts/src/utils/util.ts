/**
 * 替换模板字符串中的占位符
 * @param template 模板字符串，使用 {0}, {1} 等占位符
 * @param params 替换参数数组
 * @returns 替换后的字符串
 */
export function replaceTemplate(template, params) {
  return template.replace(/{(.*?)}/g, (match, p1) => {
    const key = p1.trim().split('.')
    return params[key]
  })
}
