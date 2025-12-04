import type { WebSocket } from 'ws'

type AnySocket = WebSocket & { __userId?: string }

// 用户映射: userId -> set of sockets
export const users = new Map<string, Set<AnySocket>>()

// 房间映射: room -> set of userIds
export const rooms = new Map<string, Set<string>>()

// 统计信息
export const stats = {
  totalConnections: 0,
  totalRooms: 0,
  peakConnections: 0
}

export function addUserConn(userId: string, socket: AnySocket) {
  socket.__userId = userId
  let set = users.get(userId)
  if (!set) {
    set = new Set()
    users.set(userId, set)
  }
  set.add(socket)
  
  // 更新统计
  const totalSockets = Array.from(users.values()).reduce((sum, sockets) => sum + sockets.size, 0)
  if (totalSockets > stats.peakConnections) {
    stats.peakConnections = totalSockets
  }
}

export function removeUserConn(userId: string, socket: AnySocket) {
  const set = users.get(userId)
  if (set) {
    set.delete(socket)
    if (set.size === 0) users.delete(userId)
  }
  // 从所有房间移除
  const roomsToLeave: string[] = []
  for (const [room, members] of rooms) {
    if (members.has(userId)) {
      members.delete(userId)
      if (members.size === 0) {
        roomsToLeave.push(room)
      }
    }
  }
  // 删除空房间
  roomsToLeave.forEach(room => rooms.delete(room))
  stats.totalRooms = rooms.size
}

export function joinRoom(userId: string, room: string) {
  if (!userId || !room) return false
  
  let members = rooms.get(room)
  if (!members) {
    members = new Set()
    rooms.set(room, members)
    stats.totalRooms = rooms.size
  }
  
  if (members.has(userId)) return false // 已在房间中
  
  members.add(userId)
  return true
}

export function leaveRoom(userId: string, room: string) {
  if (!userId || !room) return false
  
  const members = rooms.get(room)
  if (!members || !members.has(userId)) return false
  
  members.delete(userId)
  if (members.size === 0) {
    rooms.delete(room)
    stats.totalRooms = rooms.size
  }
  return true
}

export function sendToUser(userId: string, payload: any) {
  const set = users.get(userId)
  if (!set || set.size === 0) return false
  
  const raw = JSON.stringify(payload)
  let success = false
  
  for (const s of set) {
    try {
      if (s.readyState === s.OPEN) {
        s.send(raw)
        success = true
      }
    } catch (e) {
      console.warn('[ws-utils] Failed to send to user:', userId, e)
    }
  }
  
  return success
}

export function sendToRoom(room: string, payload: any, exceptUserId?: string) {
  const members = rooms.get(room)
  if (!members || members.size === 0) return false
  
  const raw = JSON.stringify(payload)
  let recipients = 0
  
  for (const userId of members) {
    if (exceptUserId && userId === exceptUserId) continue
    
    const userSockets = users.get(userId)
    if (!userSockets) continue
    
    for (const s of userSockets) {
      try {
        if (s.readyState === s.OPEN) {
          s.send(raw)
          recipients++
        }
      } catch (e) {
        console.warn('[ws-utils] Failed to send to room member:', userId, e)
      }
    }
  }
  
  return recipients > 0
}

export function broadcast(payload: any) {
  if (users.size === 0) return false
  
  const raw = JSON.stringify(payload)
  let totalSent = 0
  
  for (const set of users.values()) {
    for (const s of set) {
      try {
        if (s.readyState === s.OPEN) {
          s.send(raw)
          totalSent++
        }
      } catch (e) {
        // 忽略发送错误，可能是连接已关闭
      }
    }
  }
  
  return totalSent > 0
}

export function getUserRooms(userId: string): string[] {
  const userRooms: string[] = []
  for (const [room, members] of rooms) {
    if (members.has(userId)) {
      userRooms.push(room)
    }
  }
  return userRooms
}

export function getRoomMembers(room: string): string[] {
  const members = rooms.get(room)
  return members ? Array.from(members) : []
}

export function getOnlineUsers(): string[] {
  return Array.from(users.keys())
}

export function getStats() {
  const totalSockets = Array.from(users.values()).reduce((sum, sockets) => sum + sockets.size, 0)
  return {
    ...stats,
    onlineUsers: users.size,
    totalSockets,
    rooms: rooms.size
  }
}
