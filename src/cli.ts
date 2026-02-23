#!/usr/bin/env node
/**
 * opencode-im-bridge CLI
 * 
 * Command-line interface for opencode-im-bridge
 * opencode-im-bridge 命令行接口
 */

import { BridgeApp, loadConfig, printConfigSummary } from './index.js'

/**
 * Print usage / 打印使用说明
 */
function printUsage(): void {
  console.log(`
opencode-im-bridge - IM bridge for OpenCode

Usage:
  opencode-im-bridge [options]

Options:
  --help, -h      Show this help message
  --version, -v   Show version
  --config, -c    Path to config file

Environment Variables:
  QQ_ENABLED          Enable QQ adapter (true/false)
  QQ_WS_URL           OneBot WebSocket URL
  QQ_APP_ID           QQ Open Platform AppID
  QQ_APP_SECRET       QQ Open Platform AppSecret
  QQ_ALLOWED_USERS    Allowed user IDs (comma-separated)
  QQ_ALLOWED_GROUPS   Allowed group IDs (comma-separated)

Examples:
  # Start with environment variables
  QQ_ENABLED=true QQ_WS_URL=ws://localhost:3001 opencode-im-bridge

  # Start with config file
  opencode-im-bridge --config /path/to/config.json

For more information, visit:
https://github.com/baidong0228/opencode-im-bridge
`)
}

/**
 * Print version / 打印版本
 */
function printVersion(): void {
  // Read version from package.json
  console.log('opencode-im-bridge v0.1.0')
}

/**
 * Parse command line arguments / 解析命令行参数
 */
function parseArgs(): { help: boolean; version: boolean; configPath?: string } {
  const args = process.argv.slice(2)
  const result = { help: false, version: false, configPath: undefined as string | undefined }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--help':
      case '-h':
        result.help = true
        break
      case '--version':
      case '-v':
        result.version = true
        break
      case '--config':
      case '-c':
        result.configPath = args[++i]
        break
      default:
        if (arg.startsWith('--config=')) {
          result.configPath = arg.split('=')[1]
        }
    }
  }

  return result
}

/**
 * Main entry point / 主入口
 */
async function main(): Promise<void> {
  const args = parseArgs()

  if (args.help) {
    printUsage()
    process.exit(0)
  }

  if (args.version) {
    printVersion()
    process.exit(0)
  }

  // Set config path if specified
  if (args.configPath) {
    process.env.CONFIG_PATH = args.configPath
  }

  try {
    // Load configuration
    const config = loadConfig()
    
    // Create and start bridge
    const app = new BridgeApp(config)
    await app.start()

  } catch (error) {
    console.error('')
    console.error('❌ Failed to start bridge:')
    console.error('')
    
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    } else {
      console.error('   Unknown error')
    }
    
    console.error('')
    console.error('Please check your configuration and try again.')
    console.error('Run with --help for usage information.')
    console.error('')
    
    process.exit(1)
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
