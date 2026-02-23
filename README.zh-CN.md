# OpenCode IM Bridge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/opencode-im-bridge.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

**轻量级 OpenCode IM 桥接器 - 通过 QQ、微信、飞书等 IM 远程控制你的 AI 编程助手。**

[English](./README.md)

## 为什么选择 opencode-im-bridge？

虽然 [OpenClawd](https://github.com/liam798/docker-openclawd) 提供了类似功能，但它采用了较重的 Docker 架构。**opencode-im-bridge** 的设计理念是：

- 🪶 **轻量级** - 单个 Node.js 进程，无需 Docker
- 🔌 **可插拔** - 易于添加新的 IM 平台适配器
- 🔒 **安全** - 敏感配置通过环境变量管理，永不提交到 Git
- 🚀 **快速** - 最小依赖，秒级启动

## 功能特性

- ✅ **QQ** - 支持两种模式：
  - **官方 API** - 开箱即用，无需第三方客户端
  - **OneBot 协议** - 通过 NapCatQQ/go-cqhttp 获得完整功能
- 🚧 **飞书** - 官方 Bot API（开发中）
- 🚧 **微信** - 企业微信（开发中）
- 📱 随时随地远程控制
- 🔐 用户权限控制（用户/群组白名单）
- 💬 多会话支持
- 🐳 Docker 就绪 - 单个 `docker-compose up` 即可启动

## 快速开始

### 方式一：Docker 部署（推荐）

最简单的启动方式：

```bash
# 克隆仓库
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 复制并配置环境变量
cp .env.example .env
# 编辑 .env，设置 QQ_APP_ID 和 QQ_APP_SECRET

# 使用 Docker 启动（QQ 官方 API 模式 - 开箱即用）
docker-compose up -d

# 或者使用 OneBot 模式（需要 NapCatQQ）
docker-compose --profile onebot up -d
```

### 方式二：手动安装

#### 前置要求

- Node.js >= 20.0.0
- pnpm（推荐）或 npm
- OneBot 模式需要：支持 OneBot 协议的 QQ 机器人（如 [NapCatQQ](https://github.com/NapNeko/NapCatQQ)）

#### 安装

```bash
# 安装依赖
pnpm install

# 构建
pnpm build
```

#### 配置

1. 复制示例配置文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 填入你的配置：

**QQ 官方 API 模式（开箱即用）：**

```bash
# 启用 QQ 适配器
QQ_ENABLED=true

# QQ 开放平台凭证（从 https://bot.q.qq.com 获取）
QQ_APP_ID=你的AppID
QQ_APP_SECRET=你的AppSecret

# （可选）限制访问权限
# QQ_ALLOWED_USERS=123456789,987654321
```

**OneBot 协议模式（需要 NapCatQQ）：**

```bash
# 启用 QQ 适配器
QQ_ENABLED=true

# OneBot WebSocket 地址
QQ_WS_URL=ws://localhost:3001

# （可选）限制访问权限
# QQ_ALLOWED_USERS=123456789,987654321
```

#### 启动

```bash
# 启动 Bridge
pnpm start

# 或使用快速启动脚本
./start.sh        # Linux/macOS
start.bat         # Windows
```

### 使用方法

向你的 QQ 机器人发送消息：

```
# 普通对话
你好，请帮我写一个 Hello World 程序

# 带上下文
查看当前目录结构

# 命令
/help   - 显示帮助
/status - 检查 OpenCode 状态
```

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                  opencode-im-bridge                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ QQ 适配器   │  │ 飞书适配器  │  │ 微信适配器  │    │
│  │  (OneBot)   │  │  (官方API)  │  │ (企业微信)  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │            │
│         └────────────────┼────────────────┘            │
│                          │                             │
│                  ┌───────▼───────┐                     │
│                  │  消息路由器   │                     │
│                  │  + 会话管理   │                     │
│                  └───────┬───────┘                     │
│                          │                             │
│                  ┌───────▼───────┐                     │
│                  │ OpenCode SDK  │                     │
│                  └───────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## 配置参考

### 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `PORT` | Bridge 服务端口 | `3000` |
| `LOG_LEVEL` | 日志级别 (trace/debug/info/warn/error) | `info` |
| `QQ_ENABLED` | 启用 QQ 适配器 | `false` |
| `QQ_WS_URL` | OneBot WebSocket 地址 | - |
| `QQ_APP_ID` | QQ 开放平台 AppID | - |
| `QQ_APP_SECRET` | QQ 开放平台 AppSecret | - |
| `QQ_ALLOWED_USERS` | 允许的用户 QQ 号（逗号分隔） | - |
| `QQ_ALLOWED_GROUPS` | 允许的群号（逗号分隔） | - |

完整配置选项请参考 [.env.example](./.env.example)。

## 开发

```bash
# 开发模式（热重载）
pnpm dev

# 类型检查
pnpm typecheck

# 运行测试
pnpm test
```

## 贡献指南

欢迎贡献代码！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 开发路线

- [x] QQ 开放平台 API 支持
- [x] OneBot 协议支持
- [x] Docker 部署
- [ ] 飞书适配器
- [ ] 微信适配器
- [ ] Web 管理面板
- [ ] 多语言支持
- [ ] 自定义命令插件系统

## 安全说明

⚠️ **重要提示**：

- `.env` 文件包含敏感信息，**请勿提交到 Git**
- `config.json` 如果包含敏感配置，也**不要提交**
- 建议在生产环境使用环境变量管理敏感信息
- 使用 `QQ_ALLOWED_USERS` 和 `QQ_ALLOWED_GROUPS` 限制访问权限

## 许可证

[MIT](./LICENSE)

## 致谢

- [OpenCode](https://opencode.ai) - AI 编程助手
- [OneBot](https://github.com/howmanybots/onebot) - 统一聊天机器人协议
- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - 现代化 QQ 机器人实现
