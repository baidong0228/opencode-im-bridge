# OpenCode IM Bridge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![QQ](https://img.shields.io/badge/QQ-Official%20%7C%20OneBot-green.svg)](https://bot.q.qq.com)

**Remote control OpenCode via IM - Chat with your AI coding assistant in QQ.**

English | [中文](./README.zh-CN.md)

---

## 🎯 Quick Start Guide

| Your Situation | Recommended Mode | Why |
|----------------|------------------|-----|
| New user, want to try quickly | **Docker + OneBot** | One command, scan QR to login |
| Have public server | Official API | No extra software needed |
| Local dev, no public IP | **Docker + OneBot** | No tunneling required |
| Prefer official API only | Official API + Tunnel | Need cloudflare/ngrok |

**👉 Most users: Docker + OneBot mode is recommended**

---

## 🚀 Quick Start

### Option 1: Docker + OneBot (Recommended)

**Best for: Local development, beginners, no public IP**

#### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows) or Docker (Linux)
- A QQ account (for the bot)

#### Steps

```bash
# 1. Clone the project
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. Create config file
cp .env.example .env

# 3. Edit .env for OneBot mode
# Only need to set:
QQ_ENABLED=true
QQ_WS_URL=ws://napcat:3001
# Comment out Official API settings if any

# 4. Start all services (including NapCatQQ)
docker-compose --profile onebot up -d

# 5. Open browser, access NapCatQQ WebUI
# http://localhost:6099
# Scan QR code to login your bot QQ account

# 6. Done! Send messages to your bot now
```

#### Verify

```bash
# Check service status
curl http://localhost:3000/health
```

---

### Option 2: QQ Official API

**Best for: Public servers, official API preference**

#### Prerequisites

- Public server OR tunneling tool
- QQ Open Platform account ([Apply here](https://bot.q.qq.com))
- Created QQ bot

#### Steps

##### A. Create QQ Bot

1. Visit [QQ Open Platform](https://bot.q.qq.com)
2. Create a bot, get `AppID` and `AppSecret`

##### B. Setup Tunneling (for local dev)

```bash
# Option 1: Cloudflare Tunnel (recommended, free)
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
# Output: https://xxx.trycloudflare.com

# Option 2: ngrok
brew install ngrok
ngrok http 3000
# Output: https://xxx.ngrok.io
```

##### C. Configure QQ Open Platform

1. Bot Settings → Sandbox Config
2. Set callback URL: `https://your-domain/webhook/qq`
3. Add test users (your QQ number)

##### D. Start Service

```bash
# 1. Clone project
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. Create config
cp .env.example .env

# 3. Edit .env
QQ_ENABLED=true
QQ_APP_ID=your_app_id
QQ_APP_SECRET=your_secret

# 4. Start
docker-compose up -d
# OR
pnpm install && pnpm build && pnpm start
```

---

### Option 3: Manual Installation

**Best for: Developers, custom deployment**

#### Prerequisites

- Node.js >= 20.0.0
- pnpm (`npm install -g pnpm`)
- For OneBot mode: NapCatQQ or other OneBot implementation

#### Steps

```bash
# 1. Clone
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. Install
pnpm install

# 3. Build
pnpm build

# 4. Configure
cp .env.example .env
# Edit .env for your mode

# 5. Start
pnpm start
```

---

## 📱 Usage

### Send Messages to Bot

```
# Normal conversation
Help me write a Python crawler

# Help
/help

# Check status
/status

# List files
List files in current directory
```

### Permission Control

Configure in `.env`:

```bash
# Allow specific users (QQ numbers)
QQ_ALLOWED_USERS=123456789,987654321

# Allow specific groups
QQ_ALLOWED_GROUPS=123456789

# No config = Open to all
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | ❌ |
| `LOG_LEVEL` | Log level | `info` | ❌ |
| `QQ_ENABLED` | Enable QQ | `true` | ✅ |
| `QQ_WS_URL` | OneBot WebSocket | - | OneBot |
| `QQ_APP_ID` | Official API AppID | - | Official |
| `QQ_APP_SECRET` | Official API Secret | - | Official |
| `QQ_ALLOWED_USERS` | Whitelist users | - | ❌ |
| `QQ_ALLOWED_GROUPS` | Whitelist groups | - | ❌ |

---

## 🐳 Docker Commands

```bash
# Start (OneBot mode)
docker-compose --profile onebot up -d

# Start (Official API mode)
docker-compose up -d

# View logs
docker-compose logs -f bridge

# Stop
docker-compose down

# Restart
docker-compose restart

# Status
docker-compose ps
```

---

## 🔧 Troubleshooting

### Q: OneBot mode not connecting?

1. Verify NapCatQQ is running: visit `http://localhost:6099`
2. Confirm QR code login completed
3. Check logs: `docker-compose logs napcat`

### Q: Official API not receiving messages?

1. Verify callback URL is correct
2. Confirm tunneling is working
3. Confirm test users are added

### Q: Docker startup failed?

1. Verify Docker Desktop is running
2. Confirm ports 3000/3001/6099 are available
3. Check logs: `docker-compose logs`

---

## 🗺️ Roadmap

- [x] QQ Official API support
- [x] OneBot protocol support
- [x] Docker one-click deployment
- [x] Permission whitelist
- [ ] Feishu/Lark adapter
- [ ] WeChat adapter
- [ ] Web dashboard
- [ ] Multi-turn conversation context

---

## 📄 License

[MIT](./LICENSE)

---

## 💝 Acknowledgments

- [OpenCode](https://github.com/opencode-ai/opencode) - AI coding assistant
- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - QQ bot implementation
- [OneBot](https://github.com/botuniverse/onebot) - Unified bot protocol
