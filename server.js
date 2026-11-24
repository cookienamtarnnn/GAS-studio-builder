import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'

dotenv.config()
const execAsync = promisify(exec)

const app = express()
app.use(cors())
app.use(express.json())

// Initialize AI clients (with fallbacks for missing keys)
const openai = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const genAI = process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes('placeholder')
  ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  : null

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, codeFiles, model } = req.body

    let response = ''
    let codeUpdates = null

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
}`

    if (model === 'openai') {
      if (!openai) {
        return res.status(400).json({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env file' })
      }
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
      response = completion.choices[0].message.content || ''
    } else if (model === 'claude') {
      if (!anthropic) {
        return res.status(400).json({ error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to .env file' })
      }
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
      response = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else if (model === 'gemini') {
      if (!genAI) {
        return res.status(400).json({ error: 'Google API key not configured. Please add GOOGLE_API_KEY to .env file' })
      }
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      })
      const result = await chat.sendMessage(messages[messages.length - 1].content)
      response = result.response.text()
    }

    // Try to parse code updates if present
    try {
      const jsonMatch = response.match(/\{[\s\S]*"codeUpdates"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        codeUpdates = parsed.codeUpdates
        response = parsed.message || response
      }
    } catch (e) {
      // Not JSON, that's fine
    }

    res.json({ message: response, codeUpdates })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process chat' })
  }
})

// Clasp pull
app.post('/api/clasp/pull', async (req, res) => {
  try {
    const { projectId } = req.body
    // TODO: Implement clasp pull with OAuth
    res.json({ success: true, files: {} })
  } catch (error) {
    res.status(500).json({ error: 'Failed to pull' })
  }
})

// Clasp push
app.post('/api/clasp/push', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    // TODO: Implement clasp push with OAuth
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to push' })
  }
})

// Test deploy
app.post('/api/clasp/test-deploy', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    // TODO: Implement test deployment
    // For now, return a placeholder URL
    res.json({ success: true, url: `https://script.google.com/macros/s/${projectId}/exec` })
  } catch (error) {
    res.status(500).json({ error: 'Failed to test deploy' })
  }
})

// Validate before deploy
app.post('/api/clasp/validate', async (req, res) => {
  try {
    const { codeFiles, projectId } = req.body
    // TODO: Implement validation logic
    res.json({ valid: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate' })
  }
})

// Deploy
app.post('/api/clasp/deploy', async (req, res) => {
  try {
    const { codeFiles, projectId, description } = req.body
    // TODO: Implement clasp deploy with OAuth
    res.json({ success: true, version: '1' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
