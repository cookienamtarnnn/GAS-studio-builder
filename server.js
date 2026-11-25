import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fetch from 'node-fetch'

dotenv.config()
const execAsync = promisify(exec)

const app = express()
app.use(cors())
app.use(express.json())

// OAuth Providers Configuration
const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user'
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
  }
}

// OAuth Token Exchange Endpoint
app.post('/api/oauth/token', async (req, res) => {
  try {
    const { code, codeVerifier, oauthProvider, redirectUri } = req.body
    
    if (!code || !codeVerifier || !oauthProvider) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }
    
    const provider = oauthConfig[oauthProvider]
    if (!provider) {
      return res.status(400).json({ error: 'Invalid OAuth provider' })
    }
    
    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    })
    
    const tokenResponse = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return res.status(500).json({ error: 'Token exchange failed' })
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user profile
    let profile = {}
    try {
      const userInfoResponse = await fetch(provider.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json'
        }
      })
      
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        
        // Normalize profile across providers
        profile = {
          id: userInfo.id || userInfo.sub,
          name: userInfo.name || userInfo.login,
          email: userInfo.email,
          picture: userInfo.picture || userInfo.avatar_url || userInfo.photo
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
    
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in || 3600,
      profile
    })
    
  } catch (error) {
    console.error('OAuth token exchange error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// OAuth Token Refresh Endpoint
app.post('/api/oauth/refresh', async (req, res) => {
  try {
    const { refreshToken, oauthProvider } = req.body
    
    const provider = oauthConfig[oauthProvider]
    if (!provider) {
      return res.status(400).json({ error: 'Invalid OAuth provider' })
    }
    
    const tokenParams = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
    
    const tokenResponse = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams
    })
    
    if (!tokenResponse.ok) {
      return res.status(500).json({ error: 'Token refresh failed' })
    }
    
    const tokens = await tokenResponse.json()
    
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refreshToken, // Some providers don't return new refresh token
      expires_in: tokens.expires_in || 3600
    })
    
  } catch (error) {
    console.error('OAuth token refresh error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// Extract credentials from request headers based on auth method
function extractCredentials(req) {
  const authMethod = req.headers['x-auth-method'] || 'apikey'
  const provider = req.headers['x-provider']
  
  let credentials = null
  
  switch (authMethod) {
    case 'oauth':
      // OAuth: "Authorization: Bearer <access_token>"
      const oauthHeader = req.headers['authorization']
      if (oauthHeader && oauthHeader.startsWith('Bearer ')) {
        const accessToken = oauthHeader.split(' ')[1]
        credentials = { accessToken, type: 'oauth' }
      }
      break
      
    case 'apikey':
      // API Key: "X-API-Key: sk-..."
      const apiKey = req.headers['x-api-key']
      if (apiKey) {
        credentials = { apiKey, type: 'apikey' }
      }
      break
      
    case 'token':
      // Bearer Token: "Authorization: Bearer eyJhbGc..."
      const tokenHeader = req.headers['authorization']
      if (tokenHeader && tokenHeader.startsWith('Bearer ')) {
        const token = tokenHeader.split(' ')[1]
        credentials = { token, type: 'token' }
      }
      break
  }
  
  return { credentials, provider, authMethod }
}

// Get API key/token for AI provider based on auth method
function getProviderKey(credentials, provider) {
  if (!credentials) return null
  
  switch (credentials.type) {
    case 'oauth':
      // For OAuth, access token IS the credential
      return credentials.accessToken
      
    case 'apikey':
      return credentials.apiKey
      
    case 'token':
      return credentials.token
      
    default:
      return null
  }
}

// Chat endpoint with multi-auth support
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, codeFiles, model } = req.body
    const { credentials, provider, authMethod } = extractCredentials(req)
    
    if (!credentials) {
      return res.status(401).json({ 
        error: 'Authentication required',
        authMethod: authMethod || 'unknown'
      })
    }
    
    const apiKey = getProviderKey(credentials, provider)
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Invalid credentials format',
        authMethod 
      })
    }

    const systemPrompt = `You are an expert Google Apps Script developer. Help review, improve, and debug code.
Current files:
Code.gs:
${codeFiles['Code.gs']}

index.html:
${codeFiles['index.html']}

Provide helpful suggestions and code improvements. If you want to update code, respond with JSON in this format:
{
  "message": "Your explanation",
  "codeUpdates": {
    "Code.gs": "updated code",
    "index.html": "updated html"
  }
}
`

    let responseMessage = ''

    // Route to appropriate AI provider
    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey })
      
      const completion = await openai.chat.completions.create({
        model: model === 'claude' ? 'gpt-4' : (model === 'gemini' ? 'gpt-4' : model),
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      })

      responseMessage = completion.choices[0]?.message?.content || 'No response'

    } else if (provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey })

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })

      responseMessage = message.content[0]?.text || 'No response'

    } else if (provider === 'google') {
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      })

      const result = await chat.sendMessage(messages[messages.length - 1].content)
      responseMessage = result.response.text()

    } else {
      return res.status(400).json({ error: 'Invalid provider' })
    }

    // Try to parse JSON response for code updates
    let codeUpdates = null
    try {
      const parsed = JSON.parse(responseMessage)
      if (parsed.codeUpdates) {
        codeUpdates = parsed.codeUpdates
        responseMessage = parsed.message
      }
    } catch (e) {
      // Not JSON, use as plain text
    }

    res.json({ 
      message: responseMessage, 
      codeUpdates,
      authMethod // Echo back for debugging
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.response?.data || error.toString()
    })
  }
})

// Clasp endpoints (unchanged)
app.post('/api/clasp/pull', async (req, res) => {
  try {
    const { projectId } = req.body
    const { stdout } = await execAsync(`clasp pull --project ${projectId}`)
    res.json({ success: true, output: stdout })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/clasp/push', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/clasp/test-deploy', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    res.json({ success: true, url: 'https://script.google.com/...' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/clasp/validate', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    res.json({ valid: true })
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message })
  }
})

app.post('/api/clasp/deploy', async (req, res) => {
  try {
    const { codeFiles, projectId, description } = req.body
    res.json({ success: true, version: 1 })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Supported auth methods: oauth, apikey, token')
  console.log('\nOAuth Providers configured:')
  console.log('- Google:', oauthConfig.google.clientId !== 'YOUR_GOOGLE_CLIENT_ID' ? '✓' : '✗ (not configured)')
  console.log('- GitHub:', oauthConfig.github.clientId !== 'YOUR_GITHUB_CLIENT_ID' ? '✓' : '✗ (not configured)')
  console.log('- Microsoft:', oauthConfig.microsoft.clientId !== 'YOUR_MICROSOFT_CLIENT_ID' ? '✓' : '✗ (not configured)')
})
