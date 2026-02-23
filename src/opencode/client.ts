/**
 * OpenCode Client
 * OpenCode 客户端
 * 
 * Client for interacting with OpenCode
 * 与 OpenCode 交互的客户端
 */

import { spawn, ChildProcess } from 'child_process'
import type { BridgeMessage, OpenCodeConfig, BridgeReply } from '../types/index.js'

/**
 * OpenCode client configuration
 * OpenCode 客户端配置
 */
export interface OpenCodeClientOptions {
  baseUrl?: string
  apiKey?: string
  workDir?: string
}

/**
 * OpenCode client for executing commands
 * 用于执行命令的 OpenCode 客户端
 */
export class OpenCodeClient {
  private config: OpenCodeClientOptions
  private pendingProcesses: Map<string, ChildProcess> = new Map()

  constructor(config: OpenCodeClientOptions = {}) {
    this.config = config
  }

  /**
   * Send message to OpenCode / 发送消息到 OpenCode
   * 
   * This spawns an OpenCode CLI process with the message
   * 这会启动一个 OpenCode CLI 进程来处理消息
   */
  async sendMessage(message: BridgeMessage): Promise<BridgeReply> {
    const sessionId = `im-${message.platform}-${message.userId}`
    const workDir = this.config.workDir || process.cwd()

    return new Promise((resolve, reject) => {
      try {
        // Build command args
        const args = [
          'opencode',
          '--no-interactive',
          '--session', sessionId,
        ]

        // Add message as the last argument
        args.push(message.content)

        console.log(`[opencode] Running: ${args.join(' ')}`)

        // Spawn OpenCode process
        const proc = spawn('npx', args, {
          cwd: workDir,
          env: {
            ...process.env,
            // Pass any API key if configured
            ...(this.config.apiKey ? { OPENCODE_API_KEY: this.config.apiKey } : {}),
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        this.pendingProcesses.set(sessionId, proc)

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        const timeout = setTimeout(() => {
          proc.kill()
          reject(new Error('OpenCode process timeout'))
        }, 5 * 60 * 1000) // 5 minute timeout

        proc.on('close', (code) => {
          clearTimeout(timeout)
          this.pendingProcesses.delete(sessionId)

          if (code === 0) {
            resolve({
              content: this.formatOutput(stdout),
            })
          } else {
            console.error(`[opencode] Process exited with code ${code}`)
            console.error(`[opencode] stderr: ${stderr}`)
            
            resolve({
              content: `❌ OpenCode 返回错误 (code ${code}):\n${stderr || stdout || 'Unknown error'}`,
            })
          }
        })

        proc.on('error', (error) => {
          clearTimeout(timeout)
          this.pendingProcesses.delete(sessionId)
          
          console.error('[opencode] Process error:', error)
          reject(error)
        })

      } catch (error) {
        console.error('[opencode] Failed to spawn process:', error)
        reject(error)
      }
    })
  }

  /**
   * Format OpenCode output / 格式化 OpenCode 输出
   */
  private formatOutput(output: string): string {
    // Remove ANSI escape codes
    let cleaned = output
      .replace(/\x1b\[[0-9;]*m/g, '')
      .replace(/\x1b\].*?\x07/g, '')
      .trim()

    // Limit output length
    const maxLength = 4000
    if (cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength) + '\n... (输出已截断)'
    }

    return cleaned || '(无输出)'
  }

  /**
   * Cancel pending process / 取消待处理的进程
   */
  cancel(sessionId: string): boolean {
    const proc = this.pendingProcesses.get(sessionId)
    if (proc) {
      proc.kill()
      this.pendingProcesses.delete(sessionId)
      return true
    }
    return false
  }

  /**
   * Check if OpenCode is available / 检查 OpenCode 是否可用
   */
  async checkAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('npx', ['opencode', '--version'], {
        stdio: 'pipe',
      })

      proc.on('close', (code) => {
        resolve(code === 0)
      })

      proc.on('error', () => {
        resolve(false)
      })
    })
  }
}

// Singleton instance
export const opencodeClient = new OpenCodeClient()

export default opencodeClient
