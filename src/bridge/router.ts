/**
 * Message Router
 * 消息路由器
 * 
 * Routes messages between IM adapters and OpenCode
 * 在 IM 适配器和 OpenCode 之间路由消息
 */

import type { BridgeMessage, BridgeReply, IAdapter } from '../types/index.js'
import { sessionManager } from './session.js'

/**
 * Message handler type / 消息处理器类型
 */
export type MessageProcessor = (message: BridgeMessage, session: ReturnType<typeof sessionManager.getOrCreate>) => Promise<BridgeReply | null>

/**
 * Message Router
 * 消息路由器
 */
export class MessageRouter {
  private adapters: Map<string, IAdapter> = new Map()
  private processor: MessageProcessor | null = null
  private commandPrefix = '/'

  /**
   * Register adapter / 注册适配器
   */
  registerAdapter(adapter: IAdapter): void {
    this.adapters.set(adapter.platform, adapter)
    
    // Set up message handler
    adapter.onMessage(async (message) => {
      await this.routeMessage(message)
    })
  }

  /**
   * Set message processor / 设置消息处理器
   */
  setProcessor(processor: MessageProcessor): void {
    this.processor = processor
  }

  /**
   * Route incoming message / 路由接收到的消息
   */
  private async routeMessage(message: BridgeMessage): Promise<void> {
    console.log(`[router] Received message from ${message.platform}:${message.userId}: ${message.content.slice(0, 50)}...`)

    // Handle built-in commands
    const commandResult = await this.handleCommand(message)
    if (commandResult) {
      await this.sendReply(message, commandResult)
      return
    }

    // Get or create session
    const session = sessionManager.getOrCreate(message.platform, message.userId, message.groupId)

    // Check if busy
    if (session.status === 'busy') {
      await this.sendReply(message, {
        content: '⏳ 正在处理上一个请求，请稍候...',
      })
      return
    }

    // Process message
    if (this.processor) {
      try {
        sessionManager.update(message.platform, message.userId, { status: 'busy' }, message.groupId)
        
        const reply = await this.processor(message, session)
        
        if (reply) {
          await this.sendReply(message, reply)
        }
        
        sessionManager.update(message.platform, message.userId, { status: 'idle' }, message.groupId)
        
      } catch (error) {
        console.error('[router] Error processing message:', error)
        
        sessionManager.update(message.platform, message.userId, { status: 'idle' }, message.groupId)
        
        await this.sendReply(message, {
          content: `❌ 处理消息时出错: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }
  }

  /**
   * Handle built-in commands / 处理内置命令
   */
  private async handleCommand(message: BridgeMessage): Promise<BridgeReply | null> {
    const content = message.content.trim()
    
    if (!content.startsWith(this.commandPrefix)) {
      return null
    }

    const [command, ...args] = content.slice(1).split(/\s+/)
    const lowerCommand = command.toLowerCase()

    switch (lowerCommand) {
      case 'help':
      case '帮助':
        return {
          content: `📖 opencode-im-bridge 帮助

命令:
/help, /帮助 - 显示此帮助
/status, /状态 - 查看服务状态
/clear, /清除 - 清除当前会话

直接发送消息即可与 OpenCode 对话。`,
        }

      case 'status':
      case '状态':
        const adapterStatus = Array.from(this.adapters.values())
          .map(a => `${a.platform}: ${a.connected ? '✅ 已连接' : '❌ 未连接'}`)
          .join('\n')
        
        return {
          content: `📊 服务状态

适配器:
${adapterStatus}

会话数: ${sessionManager.count}`,
        }

      case 'clear':
      case '清除':
      case 'reset':
      case '重置':
        sessionManager.clearOpenCodeSession(message.platform, message.userId, message.groupId)
        return {
          content: '🔄 会话已清除，可以开始新对话。',
        }

      default:
        return null
    }
  }

  /**
   * Send reply via appropriate adapter / 通过适当的适配器发送回复
   */
  private async sendReply(originalMessage: BridgeMessage, reply: BridgeReply): Promise<void> {
    const adapter = this.adapters.get(originalMessage.platform)
    
    if (!adapter) {
      console.error(`[router] No adapter found for platform: ${originalMessage.platform}`)
      return
    }

    const targetId = originalMessage.groupId || originalMessage.userId
    const isGroup = !!originalMessage.groupId

    try {
      await adapter.sendMessage(targetId, reply, isGroup)
      console.log(`[router] Sent reply to ${originalMessage.platform}:${targetId}`)
    } catch (error) {
      console.error(`[router] Failed to send reply:`, error)
    }
  }

  /**
   * Broadcast message to all adapters / 向所有适配器广播消息
   */
  async broadcast(message: BridgeReply): Promise<void> {
    // This could be used for announcements
    console.log('[router] Broadcast not implemented yet')
  }
}

// Singleton instance
export const messageRouter = new MessageRouter()

export default messageRouter
