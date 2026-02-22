/**
 * opencode-im-bridge
 * IM bridge plugin for OpenCode
 */

import type { Plugin } from "@opencode-ai/plugin"

export const OpenCodeIMBridge: Plugin = async ({ client }) => {
  console.log("[opencode-im-bridge] Plugin loaded")

  return {
    // Hooks will be implemented here
  }
}

export default OpenCodeIMBridge
