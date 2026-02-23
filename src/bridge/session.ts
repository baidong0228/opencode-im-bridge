/**
 * Session Manager
 * 会话管理器
 */

import type { UserSession } from '../types/index.js'

/**
 * Session manager for tracking user conversations
 * 用于跟踪用户对话的会话管理器
 */
export class SessionManager {
  private sessions: Map<string, UserSession> = new Map()
  
  /** Session timeout in milliseconds / 会话超时时间（毫秒） */
  private sessionTimeout: number

  constructor(sessionTimeout = 30 * 60 * 1000) { // 30 minutes default
    this.sessionTimeout = sessionTimeout
  }

  /**
   * Generate session key / 生成会话键
   */
  private getKey(platform: string, userId: string, groupId?: string): string {
    return groupId ? `${platform}:${groupId}:${userId}` : `${platform}:${userId}`
  }

  /**
   * Get or create session / 获取或创建会话
   */
  getOrCreate(platform: 'qq' | 'lark' | 'wechat', userId: string, groupId?: string): UserSession {
    const key = this.getKey(platform, userId, groupId)
    
    let session = this.sessions.get(key)
    
    if (!session || this.isExpired(session)) {
      session = {
        platform,
        userId,
        status: 'idle',
        lastActive: Date.now(),
      }
      this.sessions.set(key, session)
    }

    return session
  }

  /**
   * Update session / 更新会话
   */
  update(platform: 'qq' | 'lark' | 'wechat', userId: string, updates: Partial<UserSession>, groupId?: string): UserSession | null {
    const key = this.getKey(platform, userId, groupId)
    const session = this.sessions.get(key)
    
    if (!session) {
      return null
    }

    Object.assign(session, updates, { lastActive: Date.now() })
    return session
  }

  /**
   * Set OpenCode session ID / 设置 OpenCode 会话 ID
   */
  setOpenCodeSession(platform: 'qq' | 'lark' | 'wechat', userId: string, opencodeSessionId: string, groupId?: string): void {
    this.update(platform, userId, { opencodeSessionId, status: 'busy' }, groupId)
  }

  /**
   * Clear OpenCode session / 清除 OpenCode 会话
   */
  clearOpenCodeSession(platform: 'qq' | 'lark' | 'wechat', userId: string, groupId?: string): void {
    this.update(platform, userId, { opencodeSessionId: undefined, status: 'idle' }, groupId)
  }

  /**
   * Check if session is expired / 检查会话是否过期
   */
  private isExpired(session: UserSession): boolean {
    return Date.now() - session.lastActive > this.sessionTimeout
  }

  /**
   * Clean up expired sessions / 清理过期会话
   */
  cleanup(): number {
    let cleaned = 0
    
    for (const [key, session] of this.sessions) {
      if (this.isExpired(session)) {
        this.sessions.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Get active session count / 获取活跃会话数
   */
  get count(): number {
    return this.sessions.size
  }

  /**
   * Get all sessions / 获取所有会话
   */
  getAll(): UserSession[] {
    return Array.from(this.sessions.values())
  }
}

// Singleton instance
export const sessionManager = new SessionManager()

export default sessionManager
