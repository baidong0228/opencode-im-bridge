/**
 * Bridge Server
 * Bridge 服务器
 * 
 * Main HTTP server for the bridge
 * Bridge 的主 HTTP 服务器
 */

import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import type { BridgeConfig } from '../types/index.js'

/**
 * Bridge server instance
 * Bridge 服务器实例
 */
export class BridgeServer {
  private server: FastifyInstance
  private config: BridgeConfig
  private isRunning = false

  constructor(config: BridgeConfig) {
    this.config = config
    
    this.server = Fastify({
      logger: false, // We use our own logging
    })

    this.setupRoutes()
  }

  /**
   * Setup HTTP routes / 设置 HTTP 路由
   */
  private setupRoutes(): void {
    // Health check
    this.server.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: Date.now(),
      }
    })

    // Status endpoint
    this.server.get('/status', async () => {
      return {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      }
    })
  }

  /**
   * Start the server / 启动服务器
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return
    }

    try {
      await this.server.listen({ 
        port: this.config.port,
        host: '0.0.0.0',
      })
      
      this.isRunning = true
      console.log(`[server] Bridge server listening on port ${this.config.port}`)
      
    } catch (error) {
      console.error('[server] Failed to start server:', error)
      throw error
    }
  }

  /**
   * Stop the server / 停止服务器
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    try {
      await this.server.close()
      this.isRunning = false
      console.log('[server] Bridge server stopped')
      
    } catch (error) {
      console.error('[server] Failed to stop server:', error)
      throw error
    }
  }

  /**
   * Get server address / 获取服务器地址
   */
  get address(): string | null {
    if (!this.isRunning) {
      return null
    }
    
    const address = this.server.server.address()
    if (typeof address === 'string') {
      return address
    }
    
    return address ? `http://localhost:${address.port}` : null
  }
}

export default BridgeServer
