import Editor from '@monaco-editor/react'

interface EditorPaneProps {
  codeFiles: Record<string, string>
  activeFile: 'Code.gs' | 'index.html'
  onFileChange: (file: 'Code.gs' | 'index.html') => void
  onCodeChange: (filename: 'Code.gs' | 'index.html', content: string) => void
}

export default function EditorPane({
  codeFiles,
  activeFile,
  onFileChange,
  onCodeChange
}: EditorPaneProps) {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onCodeChange(activeFile, value)
    }
  }

  const getLanguage = () => {
    return activeFile === 'index.html' ? 'html' : 'javascript'
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      {/* File Tabs */}
      <div className="flex border-b" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)' }}>
        {(['Code.gs', 'index.html'] as const).map(file => (
          <button
            key={file}
            onClick={() => onFileChange(file)}
            className="px-4 py-3 text-sm font-medium transition-colors relative"
            style={{
              color: activeFile === file ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              background: activeFile === file ? 'var(--color-bg-primary)' : 'transparent'
            }}
          >
            <span className="text-mono">{file}</span>
            {activeFile === file && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 gradient-accent"
                style={{ height: '2px' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage()}
          value={codeFiles[activeFile]}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineHeight: 20,
            letterSpacing: -0.3,
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )
}
