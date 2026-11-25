import { useState, useEffect } from 'react'
import ChatPane from './components/ChatPane'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import DeployPanel from './components/DeployPanel'
import AILoginModal from './components/AILoginModal'

function App() {
  const [codeFiles, setCodeFiles] = useState({
    'Code.gs': '// Your Apps Script code here\nfunction doGet() {\n  return HtmlService.createHtmlOutputFromFile(\'index\');\n}\n',
    'index.html': '<!DOCTYPE html>\n<html>\n  <head>\n    <base target="_top">\n  </head>\n  <body>\n    <h1>Hello from Google Apps Script!</h1>\n  </body>\n</html>'
  })
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'index.html'>('Code.gs')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
  // Panel state
  const [panels, setPanels] = useState({
    chat: { isOpen: false, width: 320 },
    preview: { isOpen: false, width: 384 }
  })
  
  // Responsive: auto-open panels on desktop
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024
      if (isDesktop && !panels.chat.isOpen && !panels.preview.isOpen) {
        setPanels(prev => ({
          chat: { ...prev.chat, isOpen: true },
          preview: { ...prev.preview, isOpen: true }
        }))
      }
    }
    
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // AI authentication state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('gas-studio-auth')
    if (auth) {
      const authData = JSON.parse(auth)
      const providers = Object.keys(authData)
      if (providers.length > 0) {
        const lastProvider = localStorage.getItem('gas-studio-last-provider')
        setAiProvider(lastProvider || providers[0])
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleCodeChange = (filename: 'Code.gs' | 'index.html', content: string) => {
    setCodeFiles(prev => ({ ...prev, [filename]: content }))
  }

  const togglePanel = (panel: 'chat' | 'preview') => {
    setPanels(prev => ({
      ...prev,
      [panel]: { ...prev[panel], isOpen: !prev[panel].isOpen }
    }))
  }

  const handleAILogin = (provider: string, credentials: any, authMethod: string) => {
    setAiProvider(provider)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('gas-studio-auth')
    setAiProvider(null)
    setIsAuthenticated(false)
  }

  const closeAllPanels = () => {
    setPanels({
      chat: { ...panels.chat, isOpen: false },
      preview: { ...panels.preview, isOpen: false }
    })
  }

  const isAnyPanelOpen = panels.chat.isOpen || panels.preview.isOpen

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 gradient-accent rounded flex-shrink-0" />
          <h1 className="text-base font-medium tracking-tight whitespace-nowrap hidden sm:block">
            GAS Studio
          </h1>
          <h1 className="text-base font-medium tracking-tight whitespace-nowrap sm:hidden">
            GAS
          </h1>
        </div>
        
        {/* Panel toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePanel('chat')}
            className="px-2 py-1 text-xs rounded transition-colors"
            style={{
              background: panels.chat.isOpen ? 'var(--color-bg-elevated)' : 'transparent',
              color: panels.chat.isOpen ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              borderWidth: '1px',
              borderColor: panels.chat.isOpen ? 'var(--color-border-medium)' : 'transparent'
            }}
            title="Toggle Chat (⌘B)"
          >
            <span className="hidden sm:inline">Chat</span>
            <span className="sm:hidden">💬</span>
          </button>
          <button
            onClick={() => togglePanel('preview')}
            className="px-2 py-1 text-xs rounded transition-colors"
            style={{
              background: panels.preview.isOpen ? 'var(--color-bg-elevated)' : 'transparent',
              color: panels.preview.isOpen ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              borderWidth: '1px',
              borderColor: panels.preview.isOpen ? 'var(--color-border-medium)' : 'transparent'
            }}
            title="Toggle Preview (⌘P)"
          >
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">👁</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          {/* AI Provider Status */}
          {isAuthenticated && aiProvider && (
            <div className="flex items-center gap-2 text-xs flex-shrink-0">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ 
                  background: aiProvider === 'openai' ? '#10a37f' : 
                              aiProvider === 'anthropic' ? '#8b5cf6' : '#ea4335' 
                }}
              />
              <span className="hidden md:inline" style={{ color: 'var(--color-text-tertiary)' }}>
                {aiProvider === 'openai' ? 'OpenAI' : 
                 aiProvider === 'anthropic' ? 'Anthropic' : 'Google'}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                ✕
              </button>
            </div>
          )}
          
          {/* AI Login Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded transition-all flex-shrink-0"
            style={{
              background: isAuthenticated 
                ? 'var(--color-bg-tertiary)' 
                : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              color: 'var(--color-text-primary)',
              borderWidth: '1px',
              borderColor: isAuthenticated ? 'var(--color-border-subtle)' : 'transparent'
            }}
          >
            <span className="hidden sm:inline">{isAuthenticated ? 'Switch AI' : 'AI Login'}</span>
            <span className="sm:hidden">🤖</span>
          </button>
          
          {/* Command Palette Hint - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-mono flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
            <kbd className="px-2 py-1 rounded" style={{ background: 'var(--color-bg-tertiary)', borderWidth: '1px', borderColor: 'var(--color-border-subtle)' }}>⌘K</kbd>
            <span className="hidden xl:inline">Command Palette</span>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div 
        className={`mobile-overlay ${isAnyPanelOpen ? 'active' : ''}`}
        onClick={closeAllPanels}
      />

      {/* Main Content: Responsive layout */}
      <div className="app-main">
        {/* Left: Chat Pane (Sliding/Overlay) */}
        <div 
          className={`panel-sliding panel-left border-r ${panels.chat.isOpen ? 'panel-open' : ''}`}
          style={{ 
            width: window.innerWidth >= 1024 
              ? (panels.chat.isOpen ? `${panels.chat.width}px` : '0px')
              : (panels.chat.isOpen ? '85vw' : '0px'),
            maxWidth: 'var(--panel-max-width)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div style={{ width: window.innerWidth >= 1024 ? `${panels.chat.width}px` : '85vw', maxWidth: 'var(--panel-max-width)', height: '100%' }}>
            <ChatPane 
              codeFiles={codeFiles} 
              onCodeUpdate={handleCodeChange}
              isAuthenticated={isAuthenticated}
              aiProvider={aiProvider}
            />
          </div>
        </div>

        {/* Middle: Editor Pane (Always visible) */}
        <div className="editor-pane border-r" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <EditorPane
            codeFiles={codeFiles}
            activeFile={activeFile}
            onFileChange={setActiveFile}
            onCodeChange={handleCodeChange}
          />
        </div>

        {/* Right: Preview Pane (Sliding/Overlay) */}
        <div 
          className={`panel-sliding panel-right ${panels.preview.isOpen ? 'panel-open' : ''}`}
          style={{ 
            width: window.innerWidth >= 1024 
              ? (panels.preview.isOpen ? `${panels.preview.width}px` : '0px')
              : (panels.preview.isOpen ? '90vw' : '0px'),
            maxWidth: 'var(--panel-max-width)'
          }}
        >
          <div style={{ width: window.innerWidth >= 1024 ? `${panels.preview.width}px` : '90vw', maxWidth: 'var(--panel-max-width)', height: '100%' }}>
            <PreviewPane previewUrl={previewUrl} />
          </div>
        </div>
      </div>

      {/* Bottom: Deploy Panel */}
      <div className="deploy-panel">
        <DeployPanel
          codeFiles={codeFiles}
          onPreviewUpdate={setPreviewUrl}
        />
      </div>

      {/* AI Login Modal */}
      <AILoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleAILogin}
      />
    </div>
  )
}

export default App
