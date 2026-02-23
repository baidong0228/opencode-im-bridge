# OpenCode IM Bridge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![QQ](https://img.shields.io/badge/QQ-Official%20%7C%20OneBot-green.svg)](https://bot.q.qq.com)

**远程控制 OpenCode 的 IM 桥接器 - 在 QQ 里和 AI 编程助手对话。**

[English](./README.md) | 中文

---

## 🎯 快速选择

| 你的情况 | 推荐模式 | 为什么 |
|---------|---------|--------|
| 新手，想快速体验 | **Docker + OneBot** | 一条命令启动，扫码登录即可 |
| 有公网服务器 | 官方 API | 无需额外软件，开箱即用 |
| 本地开发，无公网 | **Docker + OneBot** | 不需要内网穿透 |
| 只想用官方接口 | 官方 API + 内网穿透 | 需要 cloudflare/ngrok |

**👉 大多数用户：推荐 Docker + OneBot 模式**

---

## 🚀 快速开始

### 方式一：Docker + OneBot（推荐）

**适合：本地开发、新手、无公网 IP**

#### 前置要求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Mac/Windows）或 Docker（Linux）
- 一个 QQ 号（用于机器人）

#### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. 创建配置文件
cp .env.example .env

# 3. 编辑 .env，配置 OneBot 模式
# 只需要改这几行：
QQ_ENABLED=true
QQ_WS_URL=ws://napcat:3001
# 注释掉官方 API 的配置（如果有的话）

# 4. 启动所有服务（包含 NapCatQQ）
docker-compose --profile onebot up -d

# 5. 打开浏览器，访问 NapCatQQ WebUI
# http://localhost:6099
# 扫码登录你的机器人 QQ 号

# 6. 完成！现在可以向机器人发送消息了
```

#### 验证

```bash
# 检查服务状态
curl http://localhost:3000/health
```

向你的机器人 QQ 发送消息，应该会收到回复。

---

### 方式二：QQ 官方 API

**适合：有公网服务器、想用官方接口**

#### 前置要求

- 公网服务器 或 内网穿透工具
- QQ 开放平台账号（[申请地址](https://bot.q.qq.com)）
- 已创建的 QQ 机器人

#### 步骤

##### A. 申请 QQ 机器人

1. 访问 [QQ 开放平台](https://bot.q.qq.com)
2. 创建机器人，获取 `AppID` 和 `AppSecret`

##### B. 配置内网穿透（本地开发需要）

```bash
# 方案1: Cloudflare Tunnel（推荐，免费）
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
# 会输出: https://xxx.trycloudflare.com

# 方案2: ngrok
brew install ngrok
ngrok http 3000
# 会输出: https://xxx.ngrok.io
```

##### C. 配置 QQ 开放平台

1. 进入机器人设置 → 沙盒配置
2. 填写回调地址：`https://你的域名/webhook/qq`
3. 添加测试用户（你的 QQ 号）

##### D. 启动服务

```bash
# 1. 克隆项目
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. 创建配置文件
cp .env.example .env

# 3. 编辑 .env
QQ_ENABLED=true
QQ_APP_ID=你的AppID
QQ_APP_SECRET=你的AppSecret

# 4. 启动
docker-compose up -d
# 或
pnpm install && pnpm build && pnpm start
```

---

### 方式三：手动安装

**适合：开发者、自定义部署**

#### 前置要求

- Node.js >= 20.0.0
- pnpm（`npm install -g pnpm`）
- OneBot 模式需要：NapCatQQ 或其他 OneBot 实现

#### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/baidong0228/opencode-im-bridge.git
cd opencode-im-bridge

# 2. 安装依赖
pnpm install

# 3. 构建
pnpm build

# 4. 配置
cp .env.example .env
# 编辑 .env 配置你的模式

# 5. 启动
pnpm start
```

---

## 📱 使用方法

### 向机器人发送消息

```
# 普通对话
帮我写一个 Python 爬虫

# 查看帮助
/help

# 检查状态
/status

# 查看当前目录
列出当前目录的文件
```

### 权限控制

在 `.env` 中配置：

```bash
# 只允许指定用户（QQ号）
QQ_ALLOWED_USERS=123456789,987654321

# 只允许指定群
QQ_ALLOWED_GROUPS=123456789

# 不配置 = 全部开放（任何人都能用）
```

---

## ⚙️ 配置参考

### 环境变量

| 变量 | 描述 | 默认值 | 必填 |
|------|------|--------|------|
| `PORT` | 服务端口 | `3000` | ❌ |
| `LOG_LEVEL` | 日志级别 | `info` | ❌ |
| `QQ_ENABLED` | 启用 QQ | `true` | ✅ |
| `QQ_WS_URL` | OneBot WebSocket | - | OneBot 必填 |
| `QQ_APP_ID` | 官方 API AppID | - | 官方必填 |
| `QQ_APP_SECRET` | 官方 API Secret | - | 官方必填 |
| `QQ_ALLOWED_USERS` | 白名单用户 | - | ❌ |
| `QQ_ALLOWED_GROUPS` | 白名单群 | - | ❌ |

### 完整配置示例

```bash
# .env 文件示例

# ============ 通用配置 ============
PORT=3000
LOG_LEVEL=info

# ============ OneBot 模式（推荐）============
QQ_ENABLED=true
QQ_WS_URL=ws://localhost:3001

# ============ 或 官方 API 模式 ============
# QQ_ENABLED=true
# QQ_APP_ID=102853304
# QQ_APP_SECRET=your-secret

# ============ 权限控制 ============
# QQ_ALLOWED_USERS=123456789
# QQ_ALLOWED_GROUPS=123456789
```

---

## 🐳 Docker 命令速查

```bash
# 启动（OneBot 模式）
docker-compose --profile onebot up -d

# 启动（官方 API 模式）
docker-compose up -d

# 查看日志
docker-compose logs -f bridge

# 停止
docker-compose down

# 重启
docker-compose restart

# 查看状态
docker-compose ps
```

---

## 🔧 常见问题

### Q: OneBot 模式连不上？

1. 确认 NapCatQQ 已启动：访问 `http://localhost:6099`
2. 确认已扫码登录
3. 检查日志：`docker-compose logs napcat`

### Q: 官方 API 收不到消息？

1. 确认回调地址配置正确
2. 确认内网穿透正常运行
3. 确认已添加测试用户

### Q: Docker 启动失败？

1. 确认 Docker Desktop 已启动
2. 确认端口 3000/3001/6099 未被占用
3. 查看日志：`docker-compose logs`

---

## 📁 项目结构

```
opencode-im-bridge/
├── src/
│   ├── adapters/        # IM 平台适配器
│   │   ├── qq.ts        # OneBot 协议
│   │   └── qq-official.ts # 官方 API
│   ├── bridge/          # 核心桥接逻辑
│   ├── config.ts        # 配置加载
│   └── index.ts         # 主入口
├── scripts/             # 启动脚本
├── test/                # 测试文件
├── docker-compose.yml   # Docker 编排
├── Dockerfile
└── .env.example         # 配置模板
```

---

## 🗺️ 开发路线

- [x] QQ 官方 API 支持
- [x] OneBot 协议支持
- [x] Docker 一键部署
- [x] 权限白名单
- [ ] 飞书适配器
- [ ] 微信适配器
- [ ] Web 管理面板
- [ ] 多轮对话上下文

---

## 🤝 贡献

欢迎贡献！查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 许可证

[MIT](./LICENSE)

---

## 💝 致谢

- [OpenCode](https://github.com/opencode-ai/opencode) - AI 编程助手
- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - QQ 机器人实现
- [OneBot](https://github.com/botuniverse/onebot) - 统一机器人协议
