# OpenCode IM Bridge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/opencode-im-bridge.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

**A lightweight IM bridge for [OpenCode](https://opencode.ai) - Remote control your AI coding agent via QQ, WeChat, Feishu/Lark, and more.**

[中文文档](./README.zh-CN.md)

## Why opencode-im-bridge?

While [OpenClawd](https://github.com/liam798/docker-openclawd) provides similar functionality, it comes with a heavy Docker-based architecture. **opencode-im-bridge** is designed to be:

- 🪶 **Lightweight** - Single Node.js process, no Docker required
- 🔌 **Pluggable** - Easy to add new IM platform adapters
- 🔒 **Secure** - Sensitive configs via environment variables, never committed to git
- 🚀 **Fast** - Minimal dependencies, quick startup

## Features

- ✅ **QQ** - Two modes available:
  - **Official API** - Out-of-the-box, no third-party client needed
  - **OneBot Protocol** - Full features via NapCatQQ/go-cqhttp
- 🚧 **Feishu/Lark** - Official Bot API (coming soon)
- 🚧 **WeChat** - Enterprise WeChat (coming soon)
- 📱 Remote control from anywhere
- 🔐 User permission control (allowlist by user/group)
- 💬 Multi-session support
- 🐳 Docker ready - Single `docker-compose up` to start

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to get started:

```bash
# Clone the repository
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# Copy and configure environment
cp .env.example .env
# Edit .env and set your QQ_APP_ID and QQ_APP_SECRET

# Start with Docker (QQ Official API mode - out of the box)
docker-compose up -d

# Or with OneBot mode (requires NapCatQQ)
docker-compose --profile onebot up -d
```

### Option 2: Manual Installation

#### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm
- For OneBot mode: A QQ bot client (e.g., [NapCatQQ](https://github.com/NapNeko/NapCatQQ))

#### Install

```bash
# Install dependencies
pnpm install

# Build
pnpm build
```

#### Configuration

1. Copy the example configuration:

```bash
cp .env.example .env
```

2. Edit `.env` with your settings:

**For QQ Official API (Out-of-the-box):**

```bash
# Enable QQ adapter
QQ_ENABLED=true

# QQ official bot credentials (get from https://bot.q.qq.com)
QQ_APP_ID=your_app_id
QQ_APP_SECRET=your_app_secret

# (Optional) Restrict access
# QQ_ALLOWED_USERS=123456789,987654321
```

**For OneBot Protocol (requires NapCatQQ):**

```bash
# Enable QQ adapter
QQ_ENABLED=true

# OneBot WebSocket URL
QQ_WS_URL=ws://localhost:3001

# (Optional) Restrict access
# QQ_ALLOWED_USERS=123456789,987654321
```

#### Start

```bash
# Start the bridge
pnpm start

# Or use the quick-start script
./start.sh        # Linux/macOS
start.bat         # Windows
```

### Usage

Send messages to your QQ bot:

```
# Basic chat
你好，请帮我写一个 Hello World 程序

# With context
查看当前目录结构

# Commands
/help  - Show help
/status - Check OpenCode status
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  opencode-im-bridge                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ QQ Adapter  │  │Lark Adapter │  │Wx Adapter   │    │
│  │  (OneBot)   │  │  (Official) │  │ (WeCom)     │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │            │
│         └────────────────┼────────────────┘            │
│                          │                             │
│                  ┌───────▼───────┐                     │
│                  │Message Router │                     │
│                  │  + Sessions   │                     │
│                  └───────┬───────┘                     │
│                          │                             │
│                  ┌───────▼───────┐                     │
│                  │ OpenCode SDK  │                     │
│                  └───────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Bridge server port | `3000` |
| `LOG_LEVEL` | Log level (trace/debug/info/warn/error) | `info` |
| `QQ_ENABLED` | Enable QQ adapter | `false` |
| `QQ_WS_URL` | OneBot WebSocket URL | - |
| `QQ_APP_ID` | QQ official bot AppID | - |
| `QQ_APP_SECRET` | QQ official bot AppSecret | - |
| `QQ_ALLOWED_USERS` | Allowed user IDs (comma-separated) | - |
| `QQ_ALLOWED_GROUPS` | Allowed group IDs (comma-separated) | - |

See [.env.example](./.env.example) for full configuration options.

## Development

```bash
# Development mode with hot reload
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Roadmap

- [x] QQ official bot API support
- [x] OneBot protocol support
- [x] Docker deployment
- [ ] Feishu/Lark adapter
- [ ] WeChat adapter
- [ ] Web dashboard
- [ ] Multi-language support
- [ ] Plugin system for custom commands

## License

[MIT](./LICENSE)

## Acknowledgments

- [OpenCode](https://opencode.ai) - The AI coding agent
- [OneBot](https://github.com/howmanybots/onebot) - Unified chatbot protocol
- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - Modern QQ bot implementation
