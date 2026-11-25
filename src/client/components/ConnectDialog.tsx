import { useState } from 'react'

interface ConnectDialogProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (provider: 'openai' | 'claude' | 'gemini', apiKey: string) => void
}

export default function ConnectDialog({ isOpen, onClose, onConnect }: ConnectDialogProps) {
  const [provider, setProvider] = useState<'openai' | 'claude' | 'gemini'>('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    // Basic validation - check for common prefixes
    let valid = false
    if (provider === 'openai' && apiKey.startsWith('sk-')) {
      valid = true
    } else if (provider === 'claude' && apiKey.startsWith('sk-ant-')) {
      valid = true
    } else if (provider === 'gemini' && apiKey.startsWith('AIza')) {
      valid = true
    }

    if (!valid) {
      setError('Please enter a valid API key for the selected provider')
      return
    }

    setError(null)
    onConnect(provider, apiKey)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Connect AI</h2>
        
        {/* Provider Selection */}
        <div className="mb-6">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'openai' | 'claude' | 'gemini')}
            className="w-full bg-gray-700 text-white rounded px-4 py-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI (GPT-4)</option>
            <option value="claude">Anthropic (Claude 3.5 Sonnet)</option>
            <option value="gemini">Google Gemini</option>
          </select>
          <p className="text-xs text-gray-400 text-center">
            Select your AI provider
          </p>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'openai' ? 'sk-...' : provider === 'claude' ? 'sk-ant-...' : 'AIza...'}
              className="w-full bg-gray-700 text-white rounded px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="key-toggle"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              id="key-toggle"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {/* Show key format hint */}
          <p className="text-xs text-gray-500 mt-1">
            {provider === 'openai' ? 'Starts with sk-' : provider === 'claude' ? 'Starts with sk-ant-' : 'Starts with AIza'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Connect Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded px-4 py-2 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!apiKey.trim()}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}