# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- QQ Official API adapter (`src/adapters/qq-official.ts`)
- OneBot protocol adapter (`src/adapters/qq.ts`)
- Docker support with `docker-compose.yml`
- NapCatQQ integration (optional, via Docker profile)
- One-click startup scripts (`scripts/start.sh`, `scripts/start.bat`)
- Auto-detection of QQ mode (Official API vs OneBot)
- Bilingual documentation (English & Chinese)
- JSON Schema for configuration validation
- Environment variable support for all sensitive configs
- Permission control via user/group allowlists

### Changed
- Migrated from npm to pnpm
- Restructured project to follow industry best practices

## [0.1.0] - 2025-02-23

### Added
- Initial release
- Basic IM bridge architecture
- QQ adapter skeleton
- Fastify-based HTTP server
- Message router with session management
- OpenCode CLI client integration
- TypeScript configuration
- MIT License

[Unreleased]: https://github.com/baidong0228/opencode-im-bridge/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/baidong0228/opencode-im-bridge/releases/tag/v0.1.0
