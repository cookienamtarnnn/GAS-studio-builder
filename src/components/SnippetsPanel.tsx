import { useState } from 'react'
import { snippets, categories } from '../data/snippets'

interface SnippetsPanelProps {
  onInsertSnippet: (code: string) => void
}

export default function SnippetsPanel({ onInsertSnippet }: SnippetsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = searchQuery === '' || 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === null || snippet.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const groupedSnippets = categories.map(cat => ({
    ...cat,
    snippets: filteredSnippets.filter(s => s.category === cat.id)
  })).filter(cat => cat.snippets.length > 0)

  return (
    <div 
      className="h-full flex flex-col"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      {/* Header */}
      <div 
        className="p-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Code Snippets
        </h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            borderWidth: '1px',
            borderColor: 'var(--color-border-medium)',
            outline: 'none'
          }}
        />
      </div>

      {/* Category filter */}
      <div 
        className="px-3 py-2 border-b flex gap-1 overflow-x-auto flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className="px-2 py-1 text-xs rounded whitespace-nowrap"
          style={{
            background: selectedCategory === null ? 'var(--color-bg-elevated)' : 'transparent',
            color: selectedCategory === null ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            borderWidth: '1px',
            borderColor: selectedCategory === null ? 'var(--color-border-medium)' : 'transparent'
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="px-2 py-1 text-xs rounded whitespace-nowrap"
            style={{
              background: selectedCategory === cat.id ? 'var(--color-bg-elevated)' : 'transparent',
              color: selectedCategory === cat.id ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              borderWidth: '1px',
              borderColor: selectedCategory === cat.id ? 'var(--color-border-medium)' : 'transparent'
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto">
        {groupedSnippets.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No snippets found
            </p>
          </div>
        ) : (
          groupedSnippets.map(cat => (
            <div key={cat.id} className="mb-4">
              {/* Category header */}
              <div 
                className="px-3 py-2 sticky top-0 z-10"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <h4 
                  className="text-xs font-medium flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </h4>
              </div>

              {/* Snippets */}
              <div className="space-y-1 px-2">
                {cat.snippets.map(snippet => (
                  <button
                    key={snippet.id}
                    onClick={() => onInsertSnippet(snippet.code)}
                    className="w-full text-left p-2 rounded transition-all"
                    style={{
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-elevated)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div 
                      className="text-xs font-medium mb-0.5"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {snippet.title}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {snippet.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div 
        className="p-2 border-t text-xs flex-shrink-0"
        style={{ 
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-tertiary)'
        }}
      >
        💡 Click to insert snippet at cursor
      </div>
    </div>
  )
}
