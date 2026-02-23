# Security Policy

## Reporting a Vulnerability

We take the security of opencode-im-bridge seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisory** (Preferred)
   - Go to the [Security tab](https://github.com/baidong0228/opencode-im-bridge/security)
   - Click "Report a vulnerability"
   - Fill in the details

2. **Email** (Alternative)
   - Send an email to the maintainer with details about the vulnerability

### What to Include

Please include the following information:

- Type of vulnerability (e.g., injection, authentication bypass, etc.)
- Full path of the affected file(s)
- Steps to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Any possible mitigations

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 7 days
  - Medium: 14 days
  - Low: Next release

## Security Best Practices

When using opencode-im-bridge, please follow these security guidelines:

### 1. Protect Your Credentials

```bash
# NEVER commit .env files to version control
# .env is already in .gitignore, but double-check

# Use environment variables in production
export QQ_APP_SECRET="your-secret-here"
```

### 2. Limit Access

```bash
# Restrict who can use the bot
QQ_ALLOWED_USERS=123456789,987654321
QQ_ALLOWED_GROUPS=123456789
```

### 3. Network Security

- Run behind a reverse proxy (nginx, caddy) in production
- Use HTTPS for all external communications
- Don't expose ports publicly unless necessary

### 4. Keep Updated

- Regularly update dependencies: `pnpm update`
- Watch for security advisories on GitHub
- Update to the latest stable release

### 5. Docker Security

```yaml
# Run as non-root user in Docker
# Already configured in Dockerfile
USER node

# Use read-only filesystem where possible
# Limit container capabilities
```

## Known Security Considerations

1. **QQ Official API Tokens**: Stored in environment variables, never logged
2. **User Messages**: Processed in memory, not persisted by default
3. **OpenCode Communication**: Runs locally, no external API calls except QQ

## Security Audit

This project has not undergone a formal security audit. If you're interested in conducting one, please reach out.

---

Thank you for helping keep opencode-im-bridge secure!
