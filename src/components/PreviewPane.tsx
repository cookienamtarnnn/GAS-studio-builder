interface PreviewPaneProps {
  previewUrl: string
}

export default function PreviewPane({ previewUrl }: PreviewPaneProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="border-b p-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h3 className="text-sm font-medium">Preview</h3>
        {previewUrl && (
          <div 
            className="text-xs mt-1 truncate text-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {previewUrl}
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1" style={{ background: 'var(--color-bg-primary)' }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Apps Script Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Deploy to preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
