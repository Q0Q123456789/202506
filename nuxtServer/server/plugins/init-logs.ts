import { initLogsTables } from '../utils/init-logs'
import { requestLogger } from '../utils/request-logger'

/**
 * Nitro 插件：初始化日志表
 */
export default defineNitroPlugin(async (nitroApp) => {
  // 应用启动时初始化日志表
  try {
    await initLogsTables()
    console.log('✅ 请求日志系统已初始化')
  } catch (error: any) {
    console.error('⚠️ 日志表初始化失败，请求日志功能可能不可用:', error.message)
  }

  // 应用关闭时刷新日志缓冲区
  nitroApp.hooks.hook('close', async () => {
    try {
      await requestLogger.close()
      console.log('✅ 请求日志缓冲区已刷新')
    } catch (error: any) {
      console.error('⚠️ 刷新请求日志缓冲区失败:', error.message)
    }
  })
})

