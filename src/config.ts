/**
 * 配置加载器
 * 支持: 环境变量 > config.json > 默认值
 * 敏感信息优先从环境变量读取
 */

import { config as loadDotenv } from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { BridgeConfig, QQAdapterConfig, LarkAdapterConfig, WeChatAdapterConfig } from './types/index.js'

// 加载 .env 文件 (如果存在)
loadDotenv()

/**
 * 从环境变量解析布尔值
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * 从环境变量解析数字数组
 */
function parseNumberArray(value: string | undefined): number[] | undefined {
  if (!value) return undefined
  return value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

/**
 * 从环境变量解析字符串 (如果存在)
 */
function parseString(value: string | undefined): string | undefined {
  return value || undefined
}

/**
 * 从环境变量解析数字
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * 加载 JSON 配置文件
 */
function loadJsonConfig(path: string): Partial<BridgeConfig> | null {
  try {
    if (!existsSync(path)) return null
    const content = readFileSync(path, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`[config] Failed to load ${path}:`, error)
    return null
  }
}

/**
 * 从环境变量构建 QQ 配置
 * 环境变量优先级高于配置文件
 */
function buildQQConfig(jsonConfig?: QQAdapterConfig): QQAdapterConfig | undefined {
  // 检查是否启用 (环境变量优先)
  const enabled = parseBoolean(process.env.QQ_ENABLED, jsonConfig?.enabled ?? false)
  if (!enabled) {
    return { enabled: false }
  }

  // 自动检测模式：有 appId 用官方 API，有 wsUrl 用 OneBot
  const appId = parseString(process.env.QQ_APP_ID) ?? jsonConfig?.appId
  const wsUrl = parseString(process.env.QQ_WS_URL) ?? jsonConfig?.wsUrl
  
  let mode: 'onebot' | 'official' = jsonConfig?.mode ?? 'onebot'
  if (appId && !wsUrl) {
    mode = 'official'
  } else if (wsUrl && !appId) {
    mode = 'onebot'
  }
  // 如果都配置了，优先使用官方 API（开箱即用）
  if (appId) {
    mode = 'official'
  }
  return {
    enabled: true,
    mode,
    // OneBot WebSocket 地址
    wsUrl: wsUrl ?? '',
    // OneBot access_token
    accessToken: parseString(process.env.QQ_ACCESS_TOKEN) ?? jsonConfig?.accessToken,
    // QQ 开放平台 (官方机器人)
    appId,
    appSecret: parseString(process.env.QQ_APP_SECRET) ?? jsonConfig?.appSecret,
    // 重连配置
    reconnectInterval: parseNumber(process.env.QQ_RECONNECT_INTERVAL, jsonConfig?.reconnectInterval ?? 5000),
    // 权限控制
    allowedUsers: parseNumberArray(process.env.QQ_ALLOWED_USERS) ?? jsonConfig?.allowedUsers ?? [],
    allowedGroups: parseNumberArray(process.env.QQ_ALLOWED_GROUPS) ?? jsonConfig?.allowedGroups ?? [],
  }
}

/**
 * 从环境变量构建飞书配置
 */
function buildLarkConfig(jsonConfig?: LarkAdapterConfig): LarkAdapterConfig | undefined {
  const enabled = parseBoolean(process.env.LARK_ENABLED, jsonConfig?.enabled ?? false)
  
  if (!enabled) {
    return { enabled: false, appId: '', appSecret: '' }
  }

  return {
    enabled: true,
    appId: parseString(process.env.LARK_APP_ID) ?? jsonConfig?.appId ?? '',
    appSecret: parseString(process.env.LARK_APP_SECRET) ?? jsonConfig?.appSecret ?? '',
    encryptKey: parseString(process.env.LARK_ENCRYPT_KEY) ?? jsonConfig?.encryptKey,
    verificationToken: parseString(process.env.LARK_VERIFICATION_TOKEN) ?? jsonConfig?.verificationToken,
  }
}

/**
 * 从环境变量构建微信配置
 */
function buildWeChatConfig(jsonConfig?: WeChatAdapterConfig): WeChatAdapterConfig | undefined {
  const enabled = parseBoolean(process.env.WECHAT_ENABLED, jsonConfig?.enabled ?? false)
  
  if (!enabled) {
    return { enabled: false }
  }

  return {
    enabled: true,
    corpId: parseString(process.env.WECHAT_CORP_ID) ?? jsonConfig?.corpId,
    agentId: parseString(process.env.WECHAT_AGENT_ID) ?? jsonConfig?.agentId,
    secret: parseString(process.env.WECHAT_SECRET) ?? jsonConfig?.secret,
  }
}

/**
 * 加载完整配置
 * 优先级: 环境变量 > config.json > 默认值
 */
export function loadConfig(): BridgeConfig {
  // 尝试加载 JSON 配置文件
  const configPath = process.env.CONFIG_PATH || resolve(process.cwd(), 'config.json')
  const jsonConfig = loadJsonConfig(configPath) || {}

  // 构建最终配置 (环境变量覆盖 JSON 配置)
  const config: BridgeConfig = {
    port: parseNumber(process.env.PORT, jsonConfig.port ?? 3000),
    logLevel: (parseString(process.env.LOG_LEVEL) as BridgeConfig['logLevel']) ?? jsonConfig.logLevel ?? 'info',
    
    opencode: {
      baseUrl: parseString(process.env.OPENCODE_BASE_URL) ?? jsonConfig.opencode?.baseUrl,
      apiKey: parseString(process.env.OPENCODE_API_KEY) ?? jsonConfig.opencode?.apiKey,
      workDir: parseString(process.env.OPENCODE_WORK_DIR) ?? jsonConfig.opencode?.workDir,
    },
    
    qq: buildQQConfig(jsonConfig.qq),
    lark: buildLarkConfig(jsonConfig.lark),
    wechat: buildWeChatConfig(jsonConfig.wechat),
  }

  // 验证必要配置
  validateConfig(config)

  return config
}

/**
 * 验证配置
 */
function validateConfig(config: BridgeConfig): void {
  const errors: string[] = []

  // 检查是否有任何适配器启用
  const hasAdapter = 
    (config.qq?.enabled) ||
    (config.lark?.enabled) ||
    (config.wechat?.enabled)

  if (!hasAdapter) {
    errors.push('至少需要启用一个 IM 适配器 (QQ/飞书/微信)')
  }

  // 检查 QQ 配置
  if (config.qq?.enabled) {
    if (!config.qq.wsUrl && !config.qq.appId) {
      errors.push('QQ 适配器需要配置 wsUrl (OneBot) 或 appId (官方机器人)')
    }
    if (config.qq.appId && !config.qq.appSecret) {
      errors.push('使用 QQ 官方机器人需要配置 appSecret')
    }
  }

  // 检查飞书配置
  if (config.lark?.enabled) {
    if (!config.lark.appId || !config.lark.appSecret) {
      errors.push('飞书适配器需要配置 appId 和 appSecret')
    }
  }

  // 检查微信配置
  if (config.wechat?.enabled) {
    if (!config.wechat.corpId || !config.wechat.secret) {
      errors.push('微信适配器需要配置 corpId 和 secret')
    }
  }

  if (errors.length > 0) {
    console.error('[config] 配置验证失败:')
    errors.forEach(err => console.error(`  - ${err}`))
    throw new Error('配置验证失败，请检查配置文件或环境变量')
  }
}

/**
 * 打印配置摘要 (隐藏敏感信息)
 */
export function printConfigSummary(config: BridgeConfig): void {
  console.log('[config] 配置加载完成:')
  console.log(`  - 服务端口: ${config.port}`)
  console.log(`  - 日志级别: ${config.logLevel}`)
  console.log(`  - OpenCode: ${config.opencode.baseUrl || '默认'}`)
  
  if (config.qq?.enabled) {
    console.log(`  - QQ: 启用 (${config.qq.appId ? '官方' : 'OneBot'})`)
    if (config.qq.appId) {
      console.log(`    - AppID: ${maskSecret(config.qq.appId)}`)
    }
    console.log(`    - 允许用户: ${config.qq.allowedUsers?.length || 0} 个`)
    console.log(`    - 允许群: ${config.qq.allowedGroups?.length || 0} 个`)
  }
  
  if (config.lark?.enabled) {
    console.log(`  - 飞书: 启用`)
    console.log(`    - AppID: ${maskSecret(config.lark.appId)}`)
  }
  
  if (config.wechat?.enabled) {
    console.log(`  - 微信: 启用`)
    console.log(`    - CorpID: ${maskSecret(config.wechat.corpId || '')}`)
  }
}

/**
 * 隐藏敏感信息
 */
function maskSecret(value: string): string {
  if (value.length <= 8) return '****'
  return value.slice(0, 4) + '****' + value.slice(-4)
}

// 导出默认配置加载函数
export default loadConfig


// Export helper functions for testing
export { parseBoolean, parseNumber, parseNumberArray, parseString }