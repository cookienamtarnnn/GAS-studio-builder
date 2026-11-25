import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import SnippetsPanel from './SnippetsPanel'
import type * as Monaco from 'monaco-editor'

interface EditorPaneProps {
  codeFiles: Record<string, string>
  activeFile: 'Code.gs' | 'index.html'
  onFileChange: (file: 'Code.gs' | 'index.html') => void
  onCodeChange: (filename: 'Code.gs' | 'index.html', content: string) => void
  theme?: 'dark' | 'light'
}

export default function EditorPane({
  codeFiles,
  activeFile,
  onFileChange,
  onCodeChange,
  theme = 'dark'
}: EditorPaneProps) {
  const [isSnippetsPanelOpen, setIsSnippetsPanelOpen] = useState(false)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorMount = (editor: Monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onCodeChange(activeFile, value)
    }
  }

  const getLanguage = () => {
    return activeFile === 'index.html' ? 'html' : 'javascript'
  }

  const handleInsertSnippet = (code: string) => {
    if (editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()
      
      if (selection) {
        const id = { major: 1, minor: 1 }
        const op = {
          identifier: id,
          range: selection,
          text: code,
          forceMoveMarkers: true
        }
        editor.executeEdits('snippet-insert', [op])
        editor.focus()
      }
    }
    setIsSnippetsPanelOpen(false)
  }

  return (
    <div className="h-full flex" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* File Tabs */}
        <div className="flex border-b items-center justify-between" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex">
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

          {/* Snippets toggle button */}
          <button
            onClick={() => setIsSnippetsPanelOpen(!isSnippetsPanelOpen)}
            className="px-3 py-1.5 text-xs rounded mr-2 transition-all"
            style={{
              background: isSnippetsPanelOpen ? 'var(--color-bg-elevated)' : 'transparent',
              color: isSnippetsPanelOpen ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              borderWidth: '1px',
              borderColor: isSnippetsPanelOpen ? 'var(--color-border-medium)' : 'transparent'
            }}
            title="Code Snippets (⌘⇧S)"
          >
            📝 Snippets
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={getLanguage()}
            value={codeFiles[activeFile]}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
              // Enable validation and linting
              automaticLayout: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              tabCompletion: 'on',
              wordBasedSuggestions: 'currentDocument',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>

      {/* Snippets Panel (Sliding) */}
      {isSnippetsPanelOpen && (
        <div 
          className="border-l"
          style={{ 
            width: '280px',
            borderColor: 'var(--color-border-subtle)'
          }}
        >
          <SnippetsPanel onInsertSnippet={handleInsertSnippet} />
        </div>
      )}
    </div>
  )
}
