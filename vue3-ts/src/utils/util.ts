/**
 * 替换模板字符串中的占位符
 * @param template 模板字符串，使用 {0}, {1} 等占位符
 * @param params 替换参数数组
 * @returns 替换后的字符串
 */
export function replaceTemplate(template: any, params: any) {
  return template.replace(/{(.*?)}/g, (match, p1) => {
    const key = p1.trim().split('.')
    return params[key]
  })
}

/**
 * 定位信息
 */
export const useLocation = () => {
  let coords = { lat: null, lng: null }
  let loading = false
  let error = null

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('浏览器不支持定位')
        return
      }

      loading = true
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position)
          coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          loading = false
          resolve(coords)
        },
        (err) => {
          error = err.message
          loading = false
          reject(err)
        },
      )
    })
  }

  return { coords, loading, error, getLocation }
}

// 节流函数
export const throttle = (func: Function, delay: number) => {
  let timeoutId: number
  let lastExecTime = 0
  return function (...args: any[]) {
    const currentTime = Date.now()
    if (currentTime - lastExecTime > delay) {
      func?.apply(null, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(
        () => {
          func?.apply(null, args)
          lastExecTime = Date.now()
        },
        delay - (currentTime - lastExecTime),
      )
    }
  }
}
