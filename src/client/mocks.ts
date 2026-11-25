/**
 * Mock server functions for GAS Client simulation.
 * Provides realistic mock data with 300ms simulated async latency
 * for every server function detected in the GAS Studio Builder repo.
 *
 * In development, api.ts will use these mocks instead of real server calls.
 * In production, api.ts uses real GAS client functions.
 */

// Simulate async latency
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

export interface CodeFile {
  'Code.gs': string
  'index.html': string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  message: string
  codeUpdates?: CodeFile
}

export interface ClaspPullResponse {
  success: boolean
  files: CodeFile
}

export interface ClaspPushResponse {
  success: boolean
}

export interface TestDeployResponse {
  success: boolean
  url: string
}

export interface ValidateResponse {
  valid: boolean
}

export interface DeployResponse {
  success: boolean
  version: string
}

// Mock chat function
export const mockChat = async (messages: ChatMessage[], codeFiles: CodeFile, model: 'openai' | 'claude' | 'gemini'): Promise<ChatResponse> => {
  await delay(300)

  // Generate a realistic response based on the code context
  const codeContent = codeFiles['Code.gs'] || ''
  const hasDoGet = codeContent.includes('doGet')
  const hasHtmlOutput = codeContent.includes('HtmlService')

  let explanation = ''
  let codeUpdates: CodeFile | undefined

  if (model === 'openai') {
    explanation = `I analyzed your Apps Script code. ${hasDoGet ? 'Your doGet function is configured correctly.' : 'Consider adding a doGet function.'}

${hasHtmlOutput ? 'Your HTML output setup is correct.' : 'You may want to add HtmlService.createHtmlOutputFromFile()}`

    // Simulate code suggestions
    if (!hasDoGet) {
      codeUpdates = {
        'Code.gs': `function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
}`
      }
    }

    if (codeContent.includes('')) {
      // Minor formatting improvement suggestion
      codeUpdates = codeUpdates || {}
      codeUpdates['Code.gs'] = codeContent.replace(/\\n\\n\\n+/g, '\\n\\n') + '\\n'
    }
  } else if (model === 'claude') {
    explanation = 'Your code looks well-structured. Consider adding better error handling to your doGet function and validating user inputs.'

    if (!hasDoGet) {
      codeUpdates = {
        'Code.gs': `function doGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index')
  } catch (error) {
    return HtmlService.createHtmlOutput('Error: ' + error.message)
  }
}`
      }
    }
  } else {
    // gemini
    explanation = 'Good setup! Consider adding type annotations and improving the loading state for the preview pane.'

    if (!hasDoGet) {
      codeUpdates = {
        'Code.gs': `function doGet() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('index')
  htmlOutput.setTitle('GAS Studio Builder')
  return htmlOutput
}`
      }
    }
  }

  return {
    message: explanation,
    codeUpdates
  }
}

// Mock clasp pull function
export const mockPull = async (projectId: string): Promise<ClaspPullResponse> => {
  await delay(300)
  return {
    success: true,
    files: {
      'Code.gs': '// Pulled from Apps Script\\nfunction doGet() {\\n  return HtmlService.createHtmlOutputFromFile(\\'index\\');\\n}\\n',
      'index.html': '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <base target=\\'_top\\'>\\n  </head>\\n  <body>\\n    <h1>Hello from Google Apps Script!</h1>\\n  </body>\\n</html>'
    }
  }
}

// Mock clasp push function
export const mockPush = async (codeFiles: CodeFile, projectId: string): Promise<ClaspPushResponse> => {
  await delay(300)
  // Simulate successful push
  return { success: true }
}

// Mock test deploy function
export const mockTestDeploy = async (codeFiles: CodeFile, projectId: string): Promise<TestDeployResponse> => {
  await delay(300)
  return {
    success: true,
    url: `https://script.google.com/macros/s/${projectId}/exec`
  }
}

// Mock validate function
export const mockValidate = async (codeFiles: CodeFile): Promise<ValidateResponse> => {
  await delay(300)
  // Simulate that local code matches remote (valid)
  return { valid: true }
}

// Mock deploy function
export const mockDeploy = async (codeFiles: CodeFile, projectId: string, description: string): Promise<DeployResponse> => {
  await delay(300)
  return {
    success: true,
    version: '1'
  }
}