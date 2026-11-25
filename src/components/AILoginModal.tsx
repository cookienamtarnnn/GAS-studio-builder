import { useState, useEffect } from 'react'

interface AILoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (provider: string, credentials: any, authMethod: string) => void
}

const providers = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    models: ['GPT-4', 'GPT-4 Turbo'],
    color: '#10a37f',
    supportedAuth: ['apikey', 'token', 'oauth']
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus'],
    color: '#8b5cf6',
    supportedAuth: ['apikey', 'token', 'oauth']
  },
  { 
    id: 'google', 
    name: 'Google', 
    models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash'],
    color: '#ea4335',
    supportedAuth: ['apikey', 'token', 'oauth']
  }
]

const authMethods = [
  {
    id: 'oauth',
    name: 'OAuth 2.0 / OIDC',
    description: 'Social Login (Google, GitHub)',
    icon: '🔗',
    fields: []
  },
  {
    id: 'apikey',
    name: 'API Key',
    description: 'Single API key string',
    icon: '🔑',
    fields: ['apikey']
  },
  {
    id: 'token',
    name: 'Bearer Token',
    description: 'OAuth/JWT token (manual)',
    icon: '🎫',
    fields: ['token']
  }
]

const oauthProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    color: '#4285f4',
    scope: 'openid profile email',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: 'YOUR_GOOGLE_CLIENT_ID' // Will be from env
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '⚫',
    color: '#24292f',
    scope: 'read:user user:email',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientId: 'YOUR_GITHUB_CLIENT_ID'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '🟦',
    color: '#00a4ef',
    scope: 'openid profile email',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientId: 'YOUR_MICROSOFT_CLIENT_ID'
  }
]

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export default function AILoginModal({ isOpen, onClose, onLogin }: AILoginModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('anthropic')
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>('oauth')
  
  // Form fields
  const [credentials, setCredentials] = useState({
    apikey: '',
    token: ''
  })

  // OAuth state
  const [selectedOAuthProvider, setSelectedOAuthProvider] = useState<string>('google')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Load existing credentials when provider/auth method changes
  useEffect(() => {
    if (isOpen) {
      const authData = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
      const providerAuth = authData[selectedProvider]
      
      if (providerAuth) {
        setSelectedAuthMethod(providerAuth.method || 'oauth')
        setCredentials({
          apikey: providerAuth.apikey || '',
          token: providerAuth.token || ''
        })
        
        // Load OAuth profile if exists
        if (providerAuth.method === 'oauth' && providerAuth.oauthProfile) {
          setUserProfile(providerAuth.oauthProfile)
        }
      } else {
        setCredentials({ apikey: '', token: '' })
        setUserProfile(null)
      }
    }
  }, [selectedProvider, isOpen])

  // Listen for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = (event: MessageEvent) => {
      if (event.data.type === 'oauth-callback') {
        const { code, state } = event.data
        handleOAuthCode(code, state)
      }
    }

    window.addEventListener('message', handleOAuthCallback)
    return () => window.removeEventListener('message', handleOAuthCallback)
  }, [selectedOAuthProvider])

  if (!isOpen) return null

  const handleOAuthLogin = async (oauthProviderId: string) => {
    setIsAuthenticating(true)
    
    try {
      const oauthProvider = oauthProviders.find(p => p.id === oauthProviderId)!
      
      // Generate PKCE verifier and challenge
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      const state = generateCodeVerifier() // Random state for CSRF protection
      
      // Store PKCE verifier and state
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)
      sessionStorage.setItem('oauth_state', state)
      sessionStorage.setItem('oauth_provider', oauthProviderId)
      
      // Build authorization URL
      const redirectUri = `${window.location.origin}/oauth-callback`
      const params = new URLSearchParams({
        client_id: oauthProvider.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: oauthProvider.scope,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })
      
      // Open popup for OAuth flow
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const popup = window.open(
        `${oauthProvider.authUrl}?${params}`,
        'OAuth Login',
        `width=${width},height=${height},left=${left},top=${top}`
      )
      
      // Poll popup for closure
      const pollInterval = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollInterval)
          setIsAuthenticating(false)
        }
      }, 500)
      
    } catch (error) {
      console.error('OAuth login error:', error)
      setIsAuthenticating(false)
    }
  }

  const handleOAuthCode = async (code: string, state: string) => {
    try {
      const storedState = sessionStorage.getItem('oauth_state')
      if (state !== storedState) {
        throw new Error('Invalid state - possible CSRF attack')
      }
      
      const codeVerifier = sessionStorage.getItem('oauth_code_verifier')!
      const oauthProviderId = sessionStorage.getItem('oauth_provider')!
      
      // Exchange code for tokens
      const response = await fetch('/api/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          codeVerifier,
          oauthProvider: oauthProviderId,
          redirectUri: `${window.location.origin}/oauth-callback`
        })
      })
      
      if (!response.ok) {
        throw new Error('Token exchange failed')
      }
      
      const data = await response.json()
      
      // Store tokens and profile
      const authData = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
      authData[selectedProvider] = {
        method: 'oauth',
        oauthProvider: oauthProviderId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        oauthProfile: data.profile,
        apikey: '',
        token: ''
      }
      
      localStorage.setItem('gas-studio-auth', JSON.stringify(authData))
      setUserProfile(data.profile)
      
      // Clean up
      sessionStorage.removeItem('oauth_code_verifier')
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_provider')
      
      setIsAuthenticating(false)
      
      onLogin(selectedProvider, authData[selectedProvider], 'oauth')
      onClose()
      
    } catch (error) {
      console.error('OAuth callback error:', error)
      setIsAuthenticating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedAuthMethod === 'oauth') {
      // OAuth handled separately
      return
    }
    
    // Validate based on auth method
    const currentMethod = authMethods.find(m => m.id === selectedAuthMethod)!
    const isValid = currentMethod.fields.every(field => 
      credentials[field as keyof typeof credentials].trim().length > 0
    )
    
    if (!isValid) return

    // Store in localStorage
    const authData = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
    authData[selectedProvider] = {
      method: selectedAuthMethod,
      ...credentials
    }
    localStorage.setItem('gas-studio-auth', JSON.stringify(authData))
    localStorage.setItem('gas-studio-last-provider', selectedProvider)
    
    onLogin(selectedProvider, credentials, selectedAuthMethod)
    setCredentials({ apikey: '', token: '' })
    onClose()
  }

  const handleDelete = () => {
    const authData = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
    delete authData[selectedProvider]
    localStorage.setItem('gas-studio-auth', JSON.stringify(authData))
    setCredentials({ apikey: '', token: '' })
    setUserProfile(null)
  }

  const handleLogout = () => {
    handleDelete()
  }

  const selectedProviderData = providers.find(p => p.id === selectedProvider)!
  const currentAuthMethod = authMethods.find(m => m.id === selectedAuthMethod)!
  
  const authData = JSON.parse(localStorage.getItem('gas-studio-auth') || '{}')
  const hasExistingAuth = !!authData[selectedProvider]
  
  const isFormValid = selectedAuthMethod === 'oauth' 
    ? !!userProfile 
    : currentAuthMethod.fields.every(field => 
        credentials[field as keyof typeof credentials].trim().length > 0
      )

  return (
    <div 
      className="modal-overlay"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{ 
          background: 'var(--color-bg-secondary)',
          borderWidth: '1px',
          borderColor: 'var(--color-border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            AI Provider Authentication
          </h2>
          <button
            onClick={onClose}
            className="text-sm transition-colors"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Select AI Provider
            </label>
            <div className="space-y-2">
              {providers.map(provider => {
                const hasKey = !!authData[provider.id]
                
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className="w-full p-3 rounded flex items-center justify-between transition-all"
                    style={{
                      background: selectedProvider === provider.id 
                        ? 'var(--color-bg-elevated)' 
                        : 'var(--color-bg-tertiary)',
                      borderWidth: '1px',
                      borderColor: selectedProvider === provider.id 
                        ? provider.color 
                        : 'var(--color-border-subtle)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ background: provider.color }}
                      />
                      <div className="text-left">
                        <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                          {provider.name}
                          {hasKey && (
                            <span 
                              className="text-xs"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              ●
                            </span>
                          )}
                        </div>
                        <div 
                          className="text-xs text-mono"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {provider.models.join(', ')}
                        </div>
                      </div>
                    </div>
                    {selectedProvider === provider.id && (
                      <div className="text-xs font-medium" style={{ color: provider.color }}>
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Authentication Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Authentication Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {authMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedAuthMethod(method.id)}
                  className="p-3 rounded transition-all text-center"
                  style={{
                    background: selectedAuthMethod === method.id 
                      ? 'var(--color-bg-elevated)' 
                      : 'var(--color-bg-tertiary)',
                    borderWidth: '1px',
                    borderColor: selectedAuthMethod === method.id 
                      ? selectedProviderData.color 
                      : 'var(--color-border-subtle)'
                  }}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {method.name}
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {method.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Credential Fields (Dynamic based on auth method) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {selectedAuthMethod === 'oauth' ? 'Social Login' : 'Credentials'}
              </label>
              {hasExistingAuth && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs"
                  style={{ color: 'var(--color-error)' }}
                >
                  Logout / Delete
                </button>
              )}
            </div>

            {/* OAuth Social Login */}
            {selectedAuthMethod === 'oauth' && (
              <>
                {userProfile ? (
                  <div 
                    className="p-4 rounded"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      borderWidth: '1px',
                      borderColor: 'var(--color-border-medium)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {userProfile.picture && (
                        <img 
                          src={userProfile.picture} 
                          alt="Profile"
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {userProfile.name}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {userProfile.email}
                        </div>
                      </div>
                    </div>
                    <div 
                      className="text-xs flex items-center gap-2"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✓ Authenticated with {authData[selectedProvider]?.oauthProvider}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {oauthProviders.map(oauthProvider => (
                      <button
                        key={oauthProvider.id}
                        type="button"
                        onClick={() => handleOAuthLogin(oauthProvider.id)}
                        disabled={isAuthenticating}
                        className="w-full p-3 rounded flex items-center gap-3 transition-all disabled:opacity-50"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          borderWidth: '1px',
                          borderColor: oauthProvider.color
                        }}
                      >
                        <span className="text-2xl">{oauthProvider.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {isAuthenticating && selectedOAuthProvider === oauthProvider.id 
                              ? 'Authenticating...' 
                              : `Continue with ${oauthProvider.name}`}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          >
                            OAuth 2.0 + OpenID Connect
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <div 
                      className="text-xs p-3 rounded"
                      style={{ 
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-tertiary)' 
                      }}
                    >
                      🔒 Secure OAuth 2.0 flow with PKCE (Proof Key for Code Exchange). 
                      Tokens are stored locally and auto-refreshed.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* API Key Field */}
            {selectedAuthMethod === 'apikey' && (
              <>
                <input
                  type="password"
                  value={credentials.apikey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apikey: e.target.value }))}
                  placeholder={`sk-...${selectedProvider === 'anthropic' ? 'ant-' : ''}`}
                  className="w-full px-3 py-2 text-sm text-mono rounded outline-none transition-colors"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                    borderWidth: '1px',
                    borderColor: 'var(--color-border-subtle)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = selectedProviderData.color}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
                />
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Sent as "X-API-Key: {'{your-key}'}" header
                </div>
              </>
            )}

            {/* Bearer Token Field */}
            {selectedAuthMethod === 'token' && (
              <>
                <textarea
                  value={credentials.token}
                  onChange={(e) => setCredentials(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-mono rounded outline-none transition-colors resize-none"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                    borderWidth: '1px',
                    borderColor: 'var(--color-border-subtle)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = selectedProviderData.color}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
                />
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Sent as "Authorization: Bearer {'{your-token}'}" header
                </div>
              </>
            )}

            {selectedAuthMethod !== 'oauth' && (
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Stored locally in browser. Never sent to our servers.
              </div>
            )}
          </div>

          {/* Submit */}
          {selectedAuthMethod !== 'oauth' && (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className="flex-1 px-4 py-2 text-sm font-medium rounded transition-all disabled:opacity-30"
                style={{
                  background: !isFormValid 
                    ? 'var(--color-bg-tertiary)' 
                    : selectedProviderData.color,
                  color: 'var(--color-text-primary)'
                }}
              >
                {hasExistingAuth ? 'Update Credentials' : 'Save Credentials'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded transition-colors"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border-subtle)'
                }}
              >
                Cancel
              </button>
            </div>
          )}
          
          {selectedAuthMethod === 'oauth' && userProfile && (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium rounded transition-colors"
              style={{
                background: selectedProviderData.color,
                color: 'var(--color-text-primary)'
              }}
            >
              Continue
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
