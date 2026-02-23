/**
 * Logger utility
 * 日志工具
 */

import pino from 'pino'

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

/**
 * Create logger instance / 创建日志实例
 */
export function createLogger(name: string, level: LogLevel = 'info') {
  return pino({
    name,
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  })
}

/**
 * Simple console logger fallback
 * 简单的控制台日志回退
 */
export function createConsoleLogger(name: string, level: LogLevel = 'info') {
  const prefix = `[${name}]`
  
  const shouldLog = (targetLevel: LogLevel): boolean => {
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error']
    return levels.indexOf(targetLevel) >= levels.indexOf(level)
  }

  return {
    trace: (msg: string, ...args: unknown[]) => shouldLog('trace') && console.log(prefix, '[TRACE]', msg, ...args),
    debug: (msg: string, ...args: unknown[]) => shouldLog('debug') && console.log(prefix, '[DEBUG]', msg, ...args),
    info: (msg: string, ...args: unknown[]) => shouldLog('info') && console.log(prefix, msg, ...args),
    warn: (msg: string, ...args: unknown[]) => shouldLog('warn') && console.warn(prefix, '[WARN]', msg, ...args),
    error: (msg: string, ...args: unknown[]) => shouldLog('error') && console.error(prefix, '[ERROR]', msg, ...args),
  }
}

export type Logger = ReturnType<typeof createConsoleLogger>

/**
 * Create appropriate logger based on environment
 * 根据环境创建适当的日志器
 */
export function createAppLogger(name: string, level?: LogLevel): Logger {
  const logLevel = level || (process.env.LOG_LEVEL as LogLevel) || 'info'
  
  // Try to use pino-pretty, fallback to console
  try {
    return createLogger(name, logLevel)
  } catch {
    return createConsoleLogger(name, logLevel)
  }
}
