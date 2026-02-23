/**
 * opencode-im-bridge
 * 
 * IM bridge for OpenCode - Remote control via QQ, WeChat, Feishu
 * OpenCode IM 桥接器 - 通过 QQ、微信、飞书远程控制
 */

import { BridgeServer } from './bridge/server.js'
import { messageRouter } from './bridge/router.js'
import { QQAdapter } from './adapters/qq.js'
import { QQOfficialAdapter } from './adapters/qq-official.js'
import { OpenCodeClient } from './opencode/client.js'
import { loadConfig, printConfigSummary } from './config.js'
import type { BridgeConfig, BridgeMessage, BridgeReply, IAdapter } from './types/index.js'

export { 
  BridgeServer, 
  messageRouter, 
  QQAdapter,
  QQOfficialAdapter,
  OpenCodeClient,
  loadConfig,
  printConfigSummary,
}

export type { 
  BridgeConfig, 
  BridgeMessage, 
  BridgeReply,
}

/**
 * Main Bridge Application
 * Bridge 主应用
 */
export class BridgeApp {
  private config: BridgeConfig
  private server: BridgeServer
  private adapters: Map<string, IAdapter> = new Map()
  private opencodeClient: OpenCodeClient

  constructor(config?: BridgeConfig) {
    this.config = config || loadConfig()
    this.server = new BridgeServer(this.config)
    this.opencodeClient = new OpenCodeClient(this.config.opencode)
  }

  /**
   * Start the bridge / 启动 Bridge
   */
  async start(): Promise<void> {
    console.log('')
    console.log('╔════════════════════════════════════════════╗')
    console.log('║       opencode-im-bridge v0.1.0            ║')
    console.log('║   Remote control for OpenCode via IM       ║')
    console.log('╚════════════════════════════════════════════╝')
    console.log('')

    // Print config summary
    printConfigSummary(this.config)
    console.log('')

    // Set up message processor
    messageRouter.setProcessor(async (message, session) => {
      return this.processMessage(message, session)
    })

    // Initialize and connect adapters
    await this.initAdapters()

    // Start HTTP server
    await this.server.start()

    console.log('')
    console.log('✅ Bridge started successfully!')
    console.log('')

    // Handle shutdown
    this.setupShutdownHandlers()
  }

  /**
   * Initialize adapters / 初始化适配器
   */
  private async initAdapters(): Promise<void> {
    // QQ Adapter
    if (this.config.qq?.enabled) {
      const mode = this.config.qq.mode || (this.config.qq.appId ? 'official' : 'onebot')
      
      if (mode === 'official' && this.config.qq.appId) {
        // 使用 QQ 官方 API - 开箱即用
        console.log('[bridge] Initializing QQ Official API adapter...')
        const qqAdapter = new QQOfficialAdapter(this.config.qq)
        
        try {
          await qqAdapter.connect()
          messageRouter.registerAdapter(qqAdapter)
          this.adapters.set('qq', qqAdapter)
          console.log('[bridge] QQ Official API adapter connected ✅')
        } catch (error) {
          console.error('[bridge] Failed to connect QQ Official API:', error)
        }
      } else if (mode === 'onebot' && this.config.qq.wsUrl) {
        // 使用 OneBot 协议 - 需要 NapCatQQ 等实现
        console.log('[bridge] Initializing QQ OneBot adapter...')
        const qqAdapter = new QQAdapter(this.config.qq)
        
        try {
          await qqAdapter.connect()
          messageRouter.registerAdapter(qqAdapter)
          this.adapters.set('qq', qqAdapter)
          console.log('[bridge] QQ OneBot adapter connected ✅')
        } catch (error) {
          console.error('[bridge] Failed to connect QQ OneBot:', error)
        }
      } else {
        console.error('[bridge] QQ adapter enabled but no valid configuration found')
        console.error('[bridge]   - For Official API: set QQ_APP_ID and QQ_APP_SECRET')
        console.error('[bridge]   - For OneBot: set QQ_WS_URL')
      }
    }
  }

  /**
   * Process incoming message / 处理接收到的消息
   */
  private async processMessage(message: BridgeMessage, session: unknown): Promise<BridgeReply | null> {
    console.log(`[bridge] Processing message from ${message.userName || message.userId}: ${message.content.slice(0, 50)}...`)
    
    try {
      const reply = await this.opencodeClient.sendMessage(message)
      return reply
    } catch (error) {
      console.error('[bridge] Error processing message:', error)
      return {
        content: `❌ 处理失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Setup shutdown handlers / 设置关闭处理器
   */
  private setupShutdownHandlers(): void {
    const shutdown = async () => {
      console.log('')
      console.log('[bridge] Shutting down...')
      
      // Disconnect adapters
      for (const adapter of this.adapters.values()) {
        await adapter.disconnect()
      }
      
      // Stop server
      await this.server.stop()
      
      console.log('[bridge] Goodbye!')
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }

  /**
   * Stop the bridge / 停止 Bridge
   */
  async stop(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      await adapter.disconnect()
    }
    await this.server.stop()
  }
}

export default BridgeApp
