/**
 * @swagger
 * /api/user/{username}:
 *   get:
 *     summary: 获取用户资料
 *     tags:
 *       - 用户管理
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户名
 *     responses:
 *       200:
 *         description: 成功获取用户资料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     isOnline:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *       404:
 *         description: 用户不存在
 *       401:
 *         description: 未授权访问
 */

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    
    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名不能为空'
      })
    }

    // 获取认证令牌
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: '未授权访问'
      })
    }

    // 验证JWT令牌
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
    let decodedToken
    
    try {
      decodedToken = await verifyJWT(token.replace('Bearer ', ''), jwtSecret)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌'
      })
    }

    // 从数据库获取用户信息
    const user = await getUserByUsername(username)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // 获取用户统计信息
    const userStats = await getUserStats(user.id)
    
    // 检查当前用户是否关注了该用户
    const isFollowing = await checkFollowStatus(decodedToken.userId, user.id)
    
    // 获取用户在线状态
    const isOnline = await checkUserOnlineStatus(user.id)

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '/default-avatar.svg',
        isOnline,
        isFollowing,
        createdAt: user.created_at,
        stats: userStats
      }
    }
  } catch (error: any) {
    console.error('获取用户资料失败:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})

// 辅助函数：根据用户名获取用户信息
async function getUserByUsername(username: string) {
  try {
    // 这里应该从数据库查询用户信息
    // 暂时返回模拟数据
    return {
      id: '1',
      username: username,
      email: `${username}@example.com`,
      bio: '这是一个热爱聊天的用户，喜欢交朋友，分享生活点滴。',
      avatar: '',
      created_at: new Date('2025-01-15').toISOString()
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 辅助函数：获取用户统计信息
async function getUserStats(userId: string) {
  try {
    // 这里应该从数据库查询用户统计信息
    // 暂时返回模拟数据
    return {
      messageCount: Math.floor(Math.random() * 1000),
      friendCount: Math.floor(Math.random() * 100),
      onlineTime: Math.floor(Math.random() * 10000),
      level: Math.floor(Math.random() * 10) + 1
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return {
      messageCount: 0,
      friendCount: 0,
      onlineTime: 0,
      level: 1
    }
  }
}

// 辅助函数：检查关注状态
async function checkFollowStatus(currentUserId: string, targetUserId: string) {
  try {
    // 这里应该从数据库查询关注关系
    // 暂时返回模拟数据
    return Math.random() > 0.7
  } catch (error) {
    console.error('检查关注状态失败:', error)
    return false
  }
}

// 辅助函数：检查用户在线状态
async function checkUserOnlineStatus(userId: string) {
  try {
    // 这里应该从WebSocket服务器检查在线状态
    // 暂时返回模拟数据
    return Math.random() > 0.5
  } catch (error) {
    console.error('检查在线状态失败:', error)
    return false
  }
}

// 辅助函数：验证JWT令牌
async function verifyJWT(token: string, secret: string) {
  // 这里应该使用专业的JWT库验证令牌
  // 暂时返回模拟数据
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload
  } catch (error) {
    throw new Error('无效的JWT令牌')
  }
}