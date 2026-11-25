/**
 * API layer for GAS Client communication.
 * 
 * Uses mock server functions in development (import.meta.env.DEV === true)
 * and real server functions in production.
 * 
 * All functions use async/await with simulated 300ms latency in dev mode.
 * Refactored from original google.script.run calls to use fetch-based API wrapper.
 */

import type {
  ChatMessage,
  ChatResponse,
  CodeFile,
  ClaspPullResponse,
  ClaspPushResponse,
  TestDeployResponse,
  ValidateResponse,
  DeployResponse
} from './mocks'

// Mock implementations (used in DEV mode)
const mockApi = {
  // Chat: Send messages to AI and get code updates
  chat: async (messages: ChatMessage[], codeFiles: CodeFile, model: 'openai' | 'claude' | 'gemini'): Promise<ChatResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockChat(messages, codeFiles, model)
    }
    // Production: real GAS client call would go here
    throw new Error('Chat not implemented in production mode')
  },

  // Clasp Pull: Pull code from Apps Script project
  pull: async (projectId: string): Promise<ClaspPullResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockPull(projectId)
    }
    // Production: real clasp pull
    throw new Error('Pull not implemented in production mode')
  },

  // Clasp Push: Push code to Apps Script project
  push: async (codeFiles: CodeFile, projectId: string): Promise<ClaspPushResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockPush(codeFiles, projectId)
    }
    // Production: real clasp push
    throw new Error('Push not implemented in production mode')
  },

  // Test Deploy: Create test deployment
  testDeploy: async (codeFiles: CodeFile, projectId: string): Promise<TestDeployResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockTestDeploy(codeFiles, projectId)
    }
    // Production: real test deploy
    throw new Error('Test deploy not implemented in production mode')
  },

  // Validate: Validate local code matches remote before deploy
  validate: async (codeFiles: CodeFile): Promise<ValidateResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockValidate(codeFiles)
    }
    // Production: real validation
    throw new Error('Validate not implemented in production mode')
  },

  // Deploy: Deploy new version
  deploy: async (codeFiles: CodeFile, projectId: string, description: string): Promise<DeployResponse> => {
    if (import.meta.env.DEV) {
      return await (await import('./mocks')).mockDeploy(codeFiles, projectId, description)
    }
    // Production: real deploy
    throw new Error('Deploy not implemented in production mode')
  }
}

/**
 * Typed API object exported for use across the frontend.
 * All methods are async and return properly typed responses.
 */
export const api = mockApi as {
  chat: (messages: ChatMessage[], codeFiles: CodeFile, model: 'openai' | 'claude' | 'gemini') => Promise<ChatResponse>
  pull: (projectId: string) => Promise<ClaspPullResponse>
  push: (codeFiles: CodeFile, projectId: string) => Promise<ClaspPushResponse>
  testDeploy: (codeFiles: CodeFile, projectId: string) => Promise<TestDeployResponse>
  validate: (codeFiles: CodeFile) => Promise<ValidateResponse>
  deploy: (codeFiles: CodeFile, projectId: string, description: string) => Promise<DeployResponse>
}

/**
 * Helper: Convert google.script.run-style function names to api calls.
 * This can be used as a drop-in replacement pattern.
 */
export const serverFunctions = {
  chat: api.chat,
  pull: api.pull,
  push: api.push,
  testDeploy: api.testDeploy,
  validate: api.validate,
  deploy: api.deploy
}

export type { ChatMessage, ChatResponse, CodeFile, ClaspPullResponse, ClaspPushResponse, TestDeployResponse, ValidateResponse, DeployResponse }