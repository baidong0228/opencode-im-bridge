/**
 * Base adapter class for IM platforms
 * IM 平台适配器基类
 */

import type { IAdapter, BridgeMessage, BridgeReply } from '../types/index.js'

/**
 * Message handler type / 消息处理器类型
 */
export type MessageHandler = (message: BridgeMessage) => Promise<void>

/**
 * Abstract base class for IM adapters
 * IM 适配器抽象基类
 */
export abstract class BaseAdapter implements IAdapter {
  abstract readonly name: string
  abstract readonly platform: 'qq' | 'lark' | 'wechat'
  
  protected _connected = false
  protected _messageHandler: MessageHandler | null = null
  protected _config: unknown

  /** 是否已连接 / Whether connected */
  get connected(): boolean {
    return this._connected
  }

  /**
   * Initialize the adapter / 初始化适配器
   */
  async init(config: unknown): Promise<void> {
    this._config = config
  }

  /**
   * Connect to IM platform / 连接到 IM 平台
   */
  abstract connect(): Promise<void>

  /**
   * Disconnect from IM platform / 断开与 IM 平台的连接
   */
  abstract disconnect(): Promise<void>

  /**
   * Send message / 发送消息
   * @param targetId Target user/group ID / 目标用户/群 ID
   * @param message Message to send / 要发送的消息
   * @param isGroup Whether sending to a group / 是否发送到群
   */
  abstract sendMessage(targetId: string, message: BridgeReply, isGroup?: boolean): Promise<void>

  /**
   * Set message handler / 设置消息处理器
   * @param handler Handler function / 处理函数
   */
  onMessage(handler: MessageHandler): void {
    this._messageHandler = handler
  }

  /**
   * Emit message to handler / 触发消息处理器
   * @param message Bridge message / 桥接消息
   */
  protected async emitMessage(message: BridgeMessage): Promise<void> {
    if (this._messageHandler) {
      try {
        await this._messageHandler(message)
      } catch (error) {
        console.error(`[${this.name}] Error in message handler:`, error)
      }
    }
  }

  /**
   * Log message / 记录日志
   */
  protected log(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: unknown[]): void {
    const prefix = `[${this.name}]`
    switch (level) {
      case 'error':
        console.error(prefix, message, ...args)
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'debug':
        // Only log debug in development
        if (process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'trace') {
          console.log(prefix, '[DEBUG]', message, ...args)
        }
        break
      default:
        console.log(prefix, message, ...args)
    }
  }
}
