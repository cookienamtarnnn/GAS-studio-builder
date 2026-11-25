import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPaneProps {
  codeFiles: Record<string, string>
  onCodeUpdate: (filename: 'Code.gs' | 'index.html', content: string) => void
  isAuthenticated: boolean
  aiProvider: string | null
}

export default function ChatPane({ codeFiles, onCodeUpdate, isAuthenticated, aiProvider }: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'openai' | 'claude' | 'gemini'>('claude')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !isAuthenticated) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get auth credentials from localStorage
      const auth = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
      let providerAuth = auth[aiProvider || selectedModel]
      
      if (!providerAuth) {
        throw new Error('No authentication credentials found')
      }

      const authMethod = providerAuth.method || 'apikey'
      
      // Check if OAuth token needs refresh
      if (authMethod === 'oauth' && providerAuth.expiresAt) {
        const isExpired = Date.now() >= providerAuth.expiresAt - 60000 // Refresh 1 min before expiry
        
        if (isExpired && providerAuth.refreshToken) {
          // Refresh OAuth token
          const refreshResponse = await fetch('/api/oauth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              refreshToken: providerAuth.refreshToken,
              oauthProvider: providerAuth.oauthProvider
            })
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            
            // Update stored tokens
            providerAuth.accessToken = refreshData.access_token
            providerAuth.refreshToken = refreshData.refresh_token
            providerAuth.expiresAt = Date.now() + (refreshData.expires_in * 1000)
            
            auth[aiProvider || selectedModel] = providerAuth
            localStorage.setItem('gas-studio-auth', JSON.stringify(auth))
          }
        }
      }
      
      // Build headers based on auth method
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Provider': aiProvider || selectedModel,
        'X-Auth-Method': authMethod
      }

      // Add auth credentials to headers
      switch (authMethod) {
        case 'oauth':
          headers['Authorization'] = `Bearer ${providerAuth.accessToken}`
          break
          
        case 'apikey':
          headers['X-API-Key'] = providerAuth.apikey
          break
          
        case 'token':
          headers['Authorization'] = `Bearer ${providerAuth.token}`
          break
      }

      // Send to backend API with credentials
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          codeFiles,
          model: selectedModel,
          provider: aiProvider || selectedModel
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])

      // If AI suggests code changes, apply them
      if (data.codeUpdates) {
        Object.entries(data.codeUpdates).forEach(([filename, content]) => {
          onCodeUpdate(filename as 'Code.gs' | 'index.html', content as string)
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI provider. Check your API key.'}`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Model Selector */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as any)}
          className="w-full px-3 py-2 text-sm rounded outline-none transition-colors"
          style={{ 
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            borderWidth: '1px',
            borderColor: 'var(--color-border-subtle)'
          }}
        >
          <option value="openai">GPT-4</option>
          <option value="claude">Claude Sonnet</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isAuthenticated ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div 
                className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <svg 
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Login with AI provider to start
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Ask about your code, request improvements, or get help with Apps Script.
          </div>
        ) : (
          messages.map((msg, idx) => (
          <div key={idx} className="space-y-1">
            {/* Role label */}
            <div 
              className="text-xs font-medium tracking-wide text-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {msg.role === 'user' ? 'YOU' : selectedModel.toUpperCase()}
            </div>
            
            {/* Message content */}
            <div
              className="text-sm leading-relaxed"
              style={{ 
                color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                borderLeftWidth: '2px',
                borderColor: msg.role === 'user' ? 'var(--color-accent-start)' : 'var(--color-border-medium)',
                paddingLeft: '12px'
              }}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))
        )}
        {isLoading && (
          <div className="space-y-1">
            <div 
              className="text-xs font-medium tracking-wide text-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {selectedModel.toUpperCase()}
            </div>
            <div className="flex gap-1" style={{ paddingLeft: '12px' }}>
              <div 
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ background: 'var(--color-text-tertiary)' }}
              />
              <div 
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ background: 'var(--color-text-tertiary)', animationDelay: '150ms' }}
              />
              <div 
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ background: 'var(--color-text-tertiary)', animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 text-sm rounded outline-none transition-all"
            style={{ 
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              borderWidth: '1px',
              borderColor: 'var(--color-border-subtle)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !isAuthenticated}
            className="px-4 py-2 text-sm font-medium rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ 
              background: (isLoading || !input.trim() || !isAuthenticated) ? 'var(--color-bg-tertiary)' : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              color: 'var(--color-text-primary)'
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
