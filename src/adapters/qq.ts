/**
 * QQ OneBot Protocol Adapter
 * QQ OneBot 协议适配器
 * 
 * Supports: go-cqhttp, NapCatQQ, etc.
 * 支持: go-cqhttp, NapCatQQ 等
 */

import WebSocket from 'ws'
import { BaseAdapter } from './base.js'
import type { 
  BridgeMessage, 
  BridgeReply, 
  QQAdapterConfig, 
  OneBotMessage, 
  OneBotApiResponse 
} from '../types/index.js'

/**
 * Generate unique echo ID for API calls
 * 生成用于 API 调用的唯一 echo ID
 */
let echoId = 0
function generateEchoId(): string {
  return `echo_${Date.now()}_${++echoId}`
}

/**
 * QQ OneBot adapter implementation
 * QQ OneBot 适配器实现
 */
export class QQAdapter extends BaseAdapter {
  readonly name = 'QQ'
  readonly platform = 'qq' as const

  private ws: WebSocket | null = null
  private config: QQAdapterConfig
  private reconnectTimer: NodeJS.Timeout | null = null
  private apiCallbacks: Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }> = new Map()

  constructor(config: QQAdapterConfig) {
    super()
    this.config = config
  }

  /**
   * Initialize adapter / 初始化适配器
   */
  async init(config: unknown): Promise<void> {
    await super.init(config)
    this.config = config as QQAdapterConfig
  }

  /**
   * Connect to OneBot WebSocket / 连接到 OneBot WebSocket
   */
  async connect(): Promise<void> {
    if (!this.config.wsUrl) {
      throw new Error('QQ WebSocket URL not configured')
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.config.wsUrl) {
          reject(new Error('QQ WebSocket URL not configured'))
          return
        }
        
        this.log('info', `Connecting to ${this.config.wsUrl}...`)
        // Build WebSocket URL with access token
        let wsUrl = this.config.wsUrl
        if (this.config.accessToken) {
          const url = new URL(wsUrl)
          url.searchParams.set('access_token', this.config.accessToken)
          wsUrl = url.toString()
        }
        this.ws = new WebSocket(wsUrl)

        this.ws.on('open', () => {
          this._connected = true
          this.log('info', 'Connected to OneBot WebSocket')
          this.clearReconnectTimer()
          resolve()
        })

        this.ws.on('message', (data) => {
          this.handleMessage(data)
        })

        this.ws.on('error', (error) => {
          this.log('error', 'WebSocket error:', error.message)
          if (!this._connected) {
            reject(error)
          }
        })

        this.ws.on('close', (code, reason) => {
          this.log('warn', `WebSocket closed: ${code} - ${reason}`)
          this._connected = false
          this.scheduleReconnect()
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from OneBot / 断开与 OneBot 的连接
   */
  async disconnect(): Promise<void> {
    this.clearReconnectTimer()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this._connected = false
    this.log('info', 'Disconnected')
  }

  /**
   * Send message via OneBot API / 通过 OneBot API 发送消息
   */
  async sendMessage(targetId: string, message: BridgeReply, isGroup = false): Promise<void> {
    if (!this._connected || !this.ws) {
      throw new Error('Not connected to OneBot')
    }

    const apiMethod = isGroup ? 'send_group_msg' : 'send_private_msg'
    const params: Record<string, unknown> = {
      message: this.formatMessage(message),
    }

    if (isGroup) {
      params.group_id = parseInt(targetId, 10)
      if (message.atSender) {
        params.message = `[CQ:at,qq=${targetId}] ${params.message}`
      }
    } else {
      params.user_id = parseInt(targetId, 10)
    }

    await this.callApi(apiMethod, params)
  }

  /**
   * Format message content / 格式化消息内容
   */
  private formatMessage(message: BridgeReply): string {
    let content = message.content
    
    // Add reply if specified
    if (message.replyTo) {
      content = `[CQ:reply,id=${message.replyTo}] ${content}`
    }
    
    return content
  }

  /**
   * Call OneBot API / 调用 OneBot API
   */
  private async callApi(action: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const echo = generateEchoId()
      
      const request = {
        action,
        params,
        echo,
      }

      // Set timeout
      const timeout = setTimeout(() => {
        this.apiCallbacks.delete(echo)
        reject(new Error(`API call timeout: ${action}`))
      }, 10000)

      // Store callback
      this.apiCallbacks.set(echo, { resolve, reject, timeout })

      // Send request
      this.ws!.send(JSON.stringify(request))
    })
  }

  /**
   * Handle incoming WebSocket message / 处理接收到的 WebSocket 消息
   */
  private handleMessage(data: WebSocket.RawData): void {
    try {
      const raw = data.toString()
      const json = JSON.parse(raw)

      // Handle API response
      if (json.echo) {
        const callback = this.apiCallbacks.get(json.echo)
        if (callback) {
          clearTimeout(callback.timeout)
          this.apiCallbacks.delete(json.echo)
          
          if (json.status === 'ok') {
            callback.resolve(json.data)
          } else {
            callback.reject(new Error(json.message || 'API call failed'))
          }
        }
        return
      }

      // Handle event
      if (json.post_type === 'message') {
        this.handleOneBotMessage(json as OneBotMessage)
      }

    } catch (error) {
      this.log('error', 'Failed to parse message:', error)
    }
  }

  /**
   * Handle OneBot message event / 处理 OneBot 消息事件
   */
  private handleOneBotMessage(msg: OneBotMessage): void {
    // Check permission
    if (!this.checkPermission(msg)) {
      this.log('debug', 'Message from unauthorized user/group, ignored')
      return
    }

    // Extract message content
    const content = typeof msg.message === 'string' 
      ? msg.message 
      : msg.message
          .filter(seg => seg.type === 'text')
          .map(seg => seg.data.text as string)
          .join('')

    // Skip empty messages
    if (!content.trim()) {
      return
    }

    // Build bridge message
    const bridgeMsg: BridgeMessage = {
      id: String(msg.message_id),
      platform: 'qq',
      type: msg.message_type,
      userId: String(msg.user_id),
      userName: msg.sender.nickname,
      content: content.trim(),
      raw: msg,
      timestamp: msg.time * 1000,
    }

    // Add group ID for group messages
    if (msg.message_type === 'group') {
      bridgeMsg.groupId = String(msg.group_id)
    }

    // Emit to handler
    this.emitMessage(bridgeMsg)
  }

  /**
   * Check if message is from authorized user/group
   * 检查消息是否来自授权用户/群
   */
  private checkPermission(msg: OneBotMessage): boolean {
    // If no allowlist, allow all
    if (!this.config.allowedUsers?.length && !this.config.allowedGroups?.length) {
      return true
    }

    const userId = msg.user_id
    const groupId = msg.message_type === 'group' ? msg.group_id : null

    // Check user allowlist
    if (this.config.allowedUsers?.length) {
      if (this.config.allowedUsers.includes(userId)) {
        return true
      }
    }

    // Check group allowlist
    if (groupId && this.config.allowedGroups?.length) {
      if (this.config.allowedGroups.includes(groupId)) {
        return true
      }
    }

    return false
  }

  /**
   * Schedule reconnection / 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return
    }

    const interval = this.config.reconnectInterval || 5000
    this.log('info', `Reconnecting in ${interval}ms...`)
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(err => {
        this.log('error', 'Reconnect failed:', err.message)
      })
    }, interval)
  }

  /**
   * Clear reconnect timer / 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

export default QQAdapter
