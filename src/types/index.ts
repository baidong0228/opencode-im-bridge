/**
 * Type definitions for opencode-im-bridge
 * 
 * opencode-im-bridge 的类型定义 (中英文双语注释)
 */
// ============ 配置类型 ============

export interface BridgeConfig {
  /** 服务器端口 / Server port */
  port: number
  /** 日志级别 / Log level: trace | debug | info | warn | error */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error'
  /** OpenCode 配置 / OpenCode configuration */
  opencode: OpenCodeConfig
  /** QQ 适配器配置 / QQ adapter configuration */
  qq?: QQAdapterConfig
  /** 飞书适配器配置 / Lark adapter configuration */
  lark?: LarkAdapterConfig
  /** 微信适配器配置 / WeChat adapter configuration */
  wechat?: WeChatAdapterConfig
}

export interface OpenCodeConfig {
  /** OpenCode 服务地址 / OpenCode server URL */
  baseUrl?: string
  /** API Key (如果需要) / API Key if required */
  apiKey?: string
  /** 默认工作目录 / Default working directory */
  workDir?: string
}

// ============ QQ OneBot 协议类型 ============

export interface QQAdapterConfig {
  /** 是否启用 / Enable adapter */
  enabled: boolean
  /** QQ 连接模式: onebot (OneBot协议) 或 official (官方API) / Connection mode */
  mode?: 'onebot' | 'official'
  /** OneBot WebSocket 地址 (mode=onebot) / OneBot WebSocket URL */
  wsUrl?: string
  /** access_token (可选, mode=onebot) / Optional access token */
  accessToken?: string
  /** QQ 开放平台 AppID (mode=official) / QQ Open Platform AppID */
  appId?: string
  /** QQ 开放平台 AppSecret (mode=official) / QQ Open Platform AppSecret */
  appSecret?: string
  /** 重连间隔 (毫秒) / Reconnect interval in ms */
  reconnectInterval?: number
  /** 允许的用户 QQ 号列表 / Allowed user QQ IDs */
  allowedUsers?: number[]
  /** 允许的群号列表 / Allowed group IDs */
  allowedGroups?: number[]
}

/** OneBot 消息段 */
export interface OneBotMessageSegment {
  type: 'text' | 'at' | 'image' | 'face' | 'record' | 'video' | 'reply'
  data: Record<string, unknown>
}

/** OneBot 私聊消息 */
export interface OneBotPrivateMessage {
  time: number
  self_id: number
  post_type: 'message'
  message_type: 'private'
  sub_type: 'friend' | 'group' | 'other'
  user_id: number
  message: string | OneBotMessageSegment[]
  raw_message: string
  font: number
  sender: {
    user_id: number
    nickname: string
    sex?: 'male' | 'female' | 'unknown'
    age?: number
  }
  message_id: number
}

/** OneBot 群消息 */
export interface OneBotGroupMessage extends Omit<OneBotPrivateMessage, 'message_type' | 'sub_type'> {
  message_type: 'group'
  sub_type: 'normal' | 'anonymous' | 'notice'
  group_id: number
  anonymous?: {
    id: number
    name: string
    flag: string
  }
}

export type OneBotMessage = OneBotPrivateMessage | OneBotGroupMessage

/** OneBot API 响应 */
export interface OneBotApiResponse<T = unknown> {
  status: 'ok' | 'failed'
  retcode: number
  data: T
  message?: string
}

// ============ 飞书类型 ============

export interface LarkAdapterConfig {
  /** 是否启用 */
  enabled: boolean
  /** App ID */
  appId: string
  /** App Secret */
  appSecret: string
  /** Encrypt Key (可选) */
  encryptKey?: string
  /** Verification Token (可选) */
  verificationToken?: string
}

// ============ 微信类型 ============

export interface WeChatAdapterConfig {
  /** 是否启用 */
  enabled: boolean
  /** 企业微信 CorpId */
  corpId?: string
  /** 企业微信 AgentId */
  agentId?: string
  /** 企业微信 Secret */
  secret?: string
}

// ============ 桥接消息类型 ============

/** 统一的消息格式 (内部使用) */
export interface BridgeMessage {
  /** 消息 ID */
  id: string
  /** 来源平台 */
  platform: 'qq' | 'lark' | 'wechat'
  /** 消息类型 */
  type: 'private' | 'group'
  /** 发送者 ID */
  userId: string
  /** 发送者昵称 */
  userName?: string
  /** 群 ID (群消息时) */
  groupId?: string
  /** 消息内容 (纯文本) */
  content: string
  /** 原始消息对象 */
  raw: unknown
  /** 时间戳 */
  timestamp: number
}

/** 回复消息 */
export interface BridgeReply {
  /** 消息内容 */
  content: string
  /** 是否 at 发送者 (群消息) */
  atSender?: boolean
  /** 回复的消息 ID */
  replyTo?: string
}

// ============ 会话类型 ============

export interface UserSession {
  /** 用户 ID */
  userId: string
  /** 平台 */
  platform: 'qq' | 'lark' | 'wechat'
  /** OpenCode 会话 ID */
  opencodeSessionId?: string
  /** 最后活跃时间 */
  lastActive: number
  /** 会话状态 */
  status: 'idle' | 'busy' | 'waiting'
}

// ============ 适配器类型 ============

/** 适配器基类接口 */
export interface IAdapter {
  /** 适配器名称 */
  readonly name: string
  /** 平台类型 */
  readonly platform: 'qq' | 'lark' | 'wechat'
  /** 是否已连接 */
  readonly connected: boolean
  
  /** 初始化适配器 */
  init(config: unknown): Promise<void>
  /** 建立连接 */
  connect(): Promise<void>
  /** 断开连接 */
  disconnect(): Promise<void>
  /** 发送消息 */
  sendMessage(targetId: string, message: BridgeReply, isGroup?: boolean): Promise<void>
  /** 设置消息处理器 */
  onMessage(handler: (msg: BridgeMessage) => Promise<void>): void
}

// ============ 事件类型 ============

export type BridgeEventType = 
  | 'message:received'
  | 'message:sent'
  | 'session:created'
  | 'session:closed'
  | 'adapter:connected'
  | 'adapter:disconnected'
  | 'adapter:error'

export interface BridgeEvent {
  type: BridgeEventType
  payload: unknown
  timestamp: number
}
