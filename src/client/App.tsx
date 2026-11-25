import { useState } from 'react'
import ChatPane from './components/ChatPane'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import DeployPanel from './components/DeployPanel'
import ConnectDialog from './components/ConnectDialog'

function App() {
  const [codeFiles, setCodeFiles] = useState({
    'Code.gs': '// Your Apps Script code here\\nfunction doGet() {\\n  return HtmlService.createHtmlOutputFromFile(\\'index\\');\\n}\\n',
    'index.html': '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <base target=\"_top\">\\n  </head>\\n  <body>\\n    <h1>Hello from Google Apps Script!</h1>\\n  </body>\\n</html>'
  })
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'index.html'>('Code.gs')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [authMode, setAuthMode] = useState<'api_key' | 'oauth'>('api_key')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectedProvider, setConnectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai')
  const [connectedApiKey, setConnectedApiKey] = useState('')

  const handleCodeChange = (filename: 'Code.gs' | 'index.html', content: string) => {
    setCodeFiles(prev => ({ ...prev, [filename]: content }))
  }

  const handleConnect = (provider: 'openai' | 'claude' | 'gemini', apiKey: string) => {
    setConnectedProvider(provider)
    setConnectedApiKey(apiKey)
    // In a real app, you'd validate the key with the API
    // For now, just close the dialog and store the selection
    setShowConnectDialog(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">GAS Studio Builder</h1>
          {/* Auth Mode Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={authMode}
              onChange={(e) => setAuthMode(e.target.value as 'api_key' | 'oauth')}
              className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="api_key">API Key</option>
              <option value="oauth">Google Sign-In</option>
            </select>
            {isSignedIn && (
              <span className="text-green-400 text-xs">✓ Signed in</span>
            )}
          </div>
        </div>
        
        {/* Connect AI Button */}
        <button
          onClick={() => setShowConnectDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-4 py-2 text-sm transition-colors"
        >
          {connectedApiKey ? 'AI Connected' : 'Connect AI'}
        </button>
      </header>

      {/* Main Content: 3-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Pane */}
        <div className="w-1/4 border-r border-gray-700">
          <ChatPane codeFiles={codeFiles} onCodeUpdate={handleCodeChange} />
        </div>

        {/* Middle: Editor Pane */}
        <div className="w-1/2 border-r border-gray-700">
          <EditorPane
            codeFiles={codeFiles}
            activeFile={activeFile}
            onFileChange={setActiveFile}
            onCodeChange={handleCodeChange}
          />
        </div>

        {/* Right: Preview Pane */}
        <div className="w-1/4">
          <PreviewPane previewUrl={previewUrl} />
        </div>
      </div>

      {/* Bottom: Deploy Panel */}
      <div className="border-t border-gray-700">
        <DeployPanel
          codeFiles={codeFiles}
          onPreviewUpdate={setPreviewUrl}
          authMode={authMode}
          isSignedIn={isSignedIn}
        />
      </div>

      {/* Connect AI Dialog */}
      <ConnectDialog
        isOpen={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        onConnect={handleConnect}
      />
    </div>
  )
}

export default App