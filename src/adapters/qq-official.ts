/**
 * QQ Official API Adapter (QQ 开放平台官方机器人)
 * 
 * 使用 QQ 开放平台官方 API，无需第三方客户端
 * 开箱即用，但功能相对 OneBot 有一定限制
 * 
 * 文档: https://bot.q.qq.com/wiki/develop/api/
 */

import { BaseAdapter } from './base.js'
import type { BridgeMessage, BridgeReply, QQAdapterConfig } from '../types/index.js'

/**
 * QQ 开放平台 API 响应
 */
interface QQApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

/**
 * QQ 消息事件
 */
interface QQMessageEvent {
  id: string
  timestamp: number
  author: {
    id: string
    username: string
    avatar: string
    bot: boolean
  }
  content: string
  channel_id?: string
  guild_id?: string
  direct_message?: boolean
}

/**
 * Access Token 响应
 */
interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * QQ Official API Adapter
 * QQ 官方开放平台适配器
 */
export class QQOfficialAdapter extends BaseAdapter {
  readonly name = 'QQ-Official'
  readonly platform = 'qq' as const

  private config: QQAdapterConfig
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private baseUrl = 'https://api.sgroup.qq.com'
  private pollInterval: NodeJS.Timeout | null = null

  constructor(config: QQAdapterConfig) {
    super()
    this.config = config
  }

  /**
   * Connect - 获取 Access Token 并开始轮询
   */
  async connect(): Promise<void> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('QQ 官方机器人需要配置 QQ_APP_ID 和 QQ_APP_SECRET')
    }

    this.log('info', 'Connecting to QQ Official API...')

    // 获取 Access Token
    await this.refreshAccessToken()

    // 验证 Token
    try {
      // await this.getMe() // temporarily disabled
      this._connected = true
      this.log('info', 'Connected to QQ Official API')
      
      // 开始轮询消息（注：官方推荐使用 Webhook，这里用轮询作为简单实现）
      // 实际生产环境建议配置 Webhook
      this.startPolling()
      
    } catch (error) {
      throw new Error(`QQ Official API 认证失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this._connected = false
    this.log('info', 'Disconnected from QQ Official API')
  }

  /**
   * Send message via QQ Official API
   */
  async sendMessage(targetId: string, message: BridgeReply, isGroup = false): Promise<void> {
    if (!this._connected || !this.accessToken) {
      throw new Error('Not connected to QQ Official API')
    }

    // 确保token有效
    await this.ensureTokenValid()

    const endpoint = isGroup 
      ? `/channels/${targetId}/messages`
      : `/dms/${targetId}/messages`

    const body = {
      content: message.content,
      msg_id: message.replyTo,
    }

    const response = await this.apiCall('POST', endpoint, body)
    
    if (response.code !== 0) {
      throw new Error(`QQ API 发送消息失败: ${response.message}`)
    }

    this.log('debug', `Message sent to ${targetId}`)
  }

  /**
   * Refresh Access Token
   */
  private async refreshAccessToken(): Promise<void> {
    this.log('debug', `Requesting token with appId: ${this.config.appId?.substring(0, 6)}***`)
    
    try {
      const response = await fetch('https://bots.qq.com/app/getAppAccessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: this.config.appId,
          clientSecret: this.config.appSecret,
        }),
      })

      const data = await response.json() as unknown
      this.log('debug', 'QQ API response:', JSON.stringify(data))
      
      // QQ API 可能返回不同格式，检查响应
      const resp = data as Record<string, unknown>
      
      // 检查是否有 code 字段
      if ('code' in resp && typeof resp.code === 'number' && resp.code !== 0) {
        const errorMsg = String(resp.message || resp.traceId || JSON.stringify(data))
        throw new Error(`QQ API 错误 (${resp.code}): ${errorMsg}`)
      }
      
      // 检查是否有 access_token 直接返回 (不同 API 格式)
      if ('access_token' in resp) {
        this.accessToken = String(resp.access_token)
        const expiresIn = typeof resp.expires_in === 'number' ? resp.expires_in : 7200
        this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000
        this.log('info', 'Access token obtained successfully')
        return
      }
      
      // 检查 data 字段格式
      if ('data' in resp && resp.data && typeof resp.data === 'object') {
        const dataObj = resp.data as Record<string, unknown>
        if ('access_token' in dataObj) {
          this.accessToken = String(dataObj.access_token)
          const expiresIn = typeof dataObj.expires_in === 'number' ? dataObj.expires_in : 7200
          this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000
          this.log('info', 'Access token obtained successfully')
          return
        }
      }
      
      // 未知格式
      throw new Error(`未知的 API 响应格式: ${JSON.stringify(data).substring(0, 200)}`)
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`网络请求失败: ${String(error)}`)
    }
  }

  /**
   * Ensure token is valid
   */
  private async ensureTokenValid(): Promise<void> {
    if (Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken()
    }
  }

  /**
   * Get bot info
   */
  private async getMe(): Promise<void> {
    const response = await this.apiCall('GET', '/users/@me')
    if (response.code !== 0) {
      throw new Error(response.message)
    }
  }

  /**
   * API call helper
   */
  private async apiCall(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<QQApiResponse> {
    await this.ensureTokenValid()

    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Authorization': `QQBot ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Union-Appid': this.config.appId!,
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    return response.json() as Promise<QQApiResponse>
  }

  /**
   * Start polling for messages (simplified implementation)
   * Note: For production, use Webhook instead
   */
  private startPolling(): void {
    // QQ 官方 API 推荐使用 Webhook 接收消息
    // 这里提供一个简化版的轮询实现
    // 实际使用建议配置 Webhook 服务器
    
    this.log('info', 'Message polling started (consider using Webhook for production)')
    
    // 轮询间隔：30秒
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollMessages()
      } catch (error) {
        this.log('error', 'Poll error:', error)
      }
    }, 30000)
  }

  /**
   * Poll for new messages
   */
  private async pollMessages(): Promise<void> {
    // 获取私信列表
    try {
      const response = await this.apiCall('GET', '/users/@me/dms')
      // 处理消息...
      // 这里是简化实现，实际需要跟踪已读消息
    } catch {
      // Ignore poll errors
    }
  }

  /**
   * Handle incoming message from webhook
   */
  handleWebhookEvent(event: QQMessageEvent): void {
    // 权限检查
    if (!this.checkPermission(event.author.id, event.guild_id)) {
      return
    }

    // 跳过机器人消息
    if (event.author.bot) {
      return
    }

    // 跳过空消息
    if (!event.content.trim()) {
      return
    }

    const message: BridgeMessage = {
      id: event.id,
      platform: 'qq',
      type: event.channel_id ? 'group' : 'private',
      userId: event.author.id,
      userName: event.author.username,
      content: event.content.trim(),
      raw: event,
      timestamp: event.timestamp * 1000,
    }

    if (event.channel_id) {
      message.groupId = event.channel_id
    }

    this.emitMessage(message)
  }

  /**
   * Check permission
   */
  private checkPermission(userId: string, guildId?: string): boolean {
    // 如果没有配置白名单，允许所有
    if (!this.config.allowedUsers?.length && !this.config.allowedGroups?.length) {
      return true
    }

    // 检查用户白名单
    if (this.config.allowedUsers?.length) {
      if (this.config.allowedUsers.includes(Number(userId))) {
        return true
      }
    }

    // 检查群白名单
    if (guildId && this.config.allowedGroups?.length) {
      if (this.config.allowedGroups.includes(Number(guildId))) {
        return true
      }
    }

    return false
  }
}

export default QQOfficialAdapter
