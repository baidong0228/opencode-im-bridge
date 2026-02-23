# Contributing to opencode-im-bridge

[中文版](./CONTRIBUTING.zh-CN.md)

Thank you for your interest in contributing to opencode-im-bridge!

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Development

```bash
# Watch mode compilation
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test
```

## Project Structure

```
opencode-im-bridge/
├── src/
│   ├── index.ts          # Main entry
│   ├── cli.ts            # CLI entry
│   ├── config.ts         # Configuration loader
│   ├── bridge/           # Bridge core service
│   │   ├── server.ts     # HTTP/WebSocket server
│   │   ├── router.ts     # Message routing
│   │   └── session.ts    # Session management
│   ├── adapters/         # IM platform adapters
│   │   ├── base.ts       # Base adapter class
│   │   ├── qq.ts         # QQ (OneBot)
│   │   ├── lark.ts       # Feishu/Lark
│   │   └── wechat.ts     # WeChat
│   ├── opencode/         # OpenCode integration
│   │   └── client.ts     # OpenCode client
│   ├── types/            # Type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
├── examples/             # Configuration examples
└── tests/                # Test files
```

## Adding a New IM Adapter

1. Create a new file in `src/adapters/`, e.g., `telegram.ts`
2. Extend the `BaseAdapter` class
3. Implement required methods:
   - `connect()` - Establish connection
   - `disconnect()` - Close connection
   - `sendMessage()` - Send message
   - `onMessage()` - Message callback
4. Export from `src/adapters/index.ts`
5. Add configuration types to `src/types/index.ts`

## Code Style

- Use TypeScript strict mode
- All public APIs should have JSDoc comments
- Follow existing code style
- Run `pnpm typecheck` before committing

## Commit Convention

Use Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Test-related
- `chore:` Other changes

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Create a Pull Request

## Reporting Issues

Please search [Issues](https://github.com/baidong0228/opencode-im-bridge/issues) first. If you don't find a related issue, feel free to create a new one.

Please include:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment info (Node.js version, OS, etc.)

## Security

⚠️ **Important**:

- Never commit `.env` files or files containing sensitive information
- Use environment variables for secrets
- Report security vulnerabilities privately

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
