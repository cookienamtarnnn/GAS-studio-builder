import { useState, useRef, useEffect } from 'react'
import { api, type CodeFile, type ChatMessage, type ChatResponse } from './api'

interface ChatPaneProps {
  codeFiles: CodeFile
  onCodeUpdate: (filename: 'Code.gs' | 'index.html', content: string) => void
}

export default function ChatPane({ codeFiles, onCodeUpdate }: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'openai' | 'claude' | 'gemini'>('openai')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Send to backend API using new api wrapper
      const response = await api.chat(
        [...messages, userMessage],
        codeFiles,
        selectedModel
      )

      const assistantMessage: Message = { role: 'assistant', content: response.message }
      setMessages(prev => [...prev, assistantMessage])

      // If AI suggests code changes, apply them
      if (response.codeUpdates) {
        Object.entries(response.codeUpdates).forEach(([filename, content]) => {
          onCodeUpdate(filename as 'Code.gs' | 'index.html', content as string)
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Model Selector */}
      <div className="p-3 border-b border-gray-700">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as any)}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
        >
          <option value="openai">OpenAI GPT-4</option>
          <option value="claude">Claude 3.5 Sonnet</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm">
            💬 Ask me to review your code, suggest improvements, or help with Apps Script development.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 ml-8' : 'bg-gray-700 mr-8'}`}
          >
            <div className="text-xs text-gray-300 mb-1">
              {msg.role === 'user' ? 'You' : selectedModel.toUpperCase()}
            </div>
            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-700 mr-8 p-3 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for code review, improvements..."
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}