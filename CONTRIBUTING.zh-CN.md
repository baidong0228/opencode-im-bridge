# 贡献指南

[English](./CONTRIBUTING.md)

感谢你有兴趣为 opencode-im-bridge 做贡献！

## 开发环境设置

### 前置要求

- Node.js >= 20.0.0
- pnpm（推荐）或 npm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 监听模式编译
pnpm dev

# 类型检查
pnpm typecheck

# 运行测试
pnpm test
```

## 项目结构

```
opencode-im-bridge/
├── src/
│   ├── index.ts          # 主入口
│   ├── cli.ts            # CLI 入口
│   ├── config.ts         # 配置加载器
│   ├── bridge/           # Bridge 核心服务
│   │   ├── server.ts     # HTTP/WebSocket 服务器
│   │   ├── router.ts     # 消息路由
│   │   └── session.ts    # 会话管理
│   ├── adapters/         # IM 平台适配器
│   │   ├── base.ts       # 适配器基类
│   │   ├── qq.ts         # QQ (OneBot)
│   │   ├── lark.ts       # 飞书
│   │   └── wechat.ts     # 微信
│   ├── opencode/         # OpenCode 集成
│   │   └── client.ts     # OpenCode 客户端
│   ├── types/            # 类型定义
│   │   └── index.ts
│   └── utils/            # 工具函数
├── examples/             # 配置示例
└── tests/                # 测试文件
```

## 添加新的 IM 适配器

1. 在 `src/adapters/` 创建新文件，如 `telegram.ts`
2. 继承 `BaseAdapter` 类
3. 实现必要的方法：
   - `connect()` - 建立连接
   - `disconnect()` - 断开连接
   - `sendMessage()` - 发送消息
   - `onMessage()` - 消息回调
4. 在 `src/adapters/index.ts` 中导出
5. 添加配置类型到 `src/types/index.ts`

## 代码规范

- 使用 TypeScript strict 模式
- 所有公共 API 需要有 JSDoc 注释
- 遵循现有的代码风格
- 提交前运行 `pnpm typecheck`

## 提交规范

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 其他

## Pull Request 流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 创建 Pull Request

## 问题反馈

遇到问题请先搜索 [Issues](https://github.com/baidong0228/opencode-im-bridge/issues)，如果没有找到相关问题，欢迎创建新 Issue。

请提供：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息 (Node.js 版本、操作系统等)

## 安全

⚠️ **重要提示**：

- 切勿提交 `.env` 文件或包含敏感信息的文件
- 敏感信息请使用环境变量
- 安全漏洞请私下报告

## 许可证

通过贡献代码，你同意你的贡献将以 MIT 许可证授权。
