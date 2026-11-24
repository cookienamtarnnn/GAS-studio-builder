import { useState } from 'react'
import ChatPane from './components/ChatPane'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import DeployPanel from './components/DeployPanel'

function App() {
  const [codeFiles, setCodeFiles] = useState({
    'Code.gs': '// Your Apps Script code here\nfunction doGet() {\n  return HtmlService.createHtmlOutputFromFile(\'index\');\n}\n',
    'index.html': '<!DOCTYPE html>\n<html>\n  <head>\n    <base target="_top">\n  </head>\n  <body>\n    <h1>Hello from Google Apps Script!</h1>\n  </body>\n</html>'
  })
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'index.html'>('Code.gs')
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleCodeChange = (filename: 'Code.gs' | 'index.html', content: string) => {
    setCodeFiles(prev => ({ ...prev, [filename]: content }))
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold">GAS Studio Builder</h1>
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
        />
      </div>
    </div>
  )
}

export default App
