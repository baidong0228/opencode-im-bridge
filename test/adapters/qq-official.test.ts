import { describe, it, expect } from 'vitest'
import { QQOfficialAdapter } from '../../src/adapters/qq-official.js'

describe('QQOfficialAdapter', () => {
  it('should have correct name and platform', () => {
    const adapter = new QQOfficialAdapter({
      enabled: true,
      appId: 'test-app-id',
      appSecret: 'test-secret',
    })

    expect(adapter.name).toBe('QQ-Official')
    expect(adapter.platform).toBe('qq')
  })

  it('should throw error when connecting without credentials', async () => {
    const adapter = new QQOfficialAdapter({
      enabled: true,
    })

    await expect(adapter.connect()).rejects.toThrow('QQ 官方机器人需要配置')
  })

  it('should handle webhook events correctly', () => {
    const adapter = new QQOfficialAdapter({
      enabled: true,
      appId: 'test-app-id',
      appSecret: 'test-secret',
    })

    let receivedMessage: unknown = null
    adapter.onMessage((msg) => {
      receivedMessage = msg
    })

    // Simulate webhook event
    adapter.handleWebhookEvent({
      id: 'msg-123',
      timestamp: 1708700000,
      author: {
        id: 'user-123',
        username: 'testuser',
        avatar: '',
        bot: false,
      },
      content: 'Hello World',
    })

    expect(receivedMessage).not.toBeNull()
    expect((receivedMessage as { content: string }).content).toBe('Hello World')
    expect((receivedMessage as { userId: string }).userId).toBe('user-123')
  })

  it('should ignore bot messages', () => {
    const adapter = new QQOfficialAdapter({
      enabled: true,
      appId: 'test-app-id',
      appSecret: 'test-secret',
    })

    let receivedMessage: unknown = null
    adapter.onMessage((msg) => {
      receivedMessage = msg
    })

    // Simulate bot message
    adapter.handleWebhookEvent({
      id: 'msg-123',
      timestamp: 1708700000,
      author: {
        id: 'bot-123',
        username: 'testbot',
        avatar: '',
        bot: true,
      },
      content: 'Bot message',
    })

    expect(receivedMessage).toBeNull()
  })

  it('should respect allowlist', () => {
    const adapter = new QQOfficialAdapter({
      enabled: true,
      appId: 'test-app-id',
      appSecret: 'test-secret',
      allowedUsers: [123456789],
    })

    let receivedMessage: unknown = null
    adapter.onMessage((msg) => {
      receivedMessage = msg
    })

    // User not in allowlist
    adapter.handleWebhookEvent({
      id: 'msg-123',
      timestamp: 1708700000,
      author: {
        id: '999999999',
        username: 'unknown',
        avatar: '',
        bot: false,
      },
      content: 'Hello',
    })

    expect(receivedMessage).toBeNull()
  })
})
