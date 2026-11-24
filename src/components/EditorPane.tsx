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
    <div className="h-full flex flex-col bg-gray-900">
      {/* File Tabs */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        {(['Code.gs', 'index.html'] as const).map(file => (
          <button
            key={file}
            onClick={() => onFileChange(file)}
            className={`px-4 py-2 text-sm font-medium border-r border-gray-700 ${
              activeFile === file
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {file}
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
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
