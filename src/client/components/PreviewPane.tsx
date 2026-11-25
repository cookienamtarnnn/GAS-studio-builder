interface PreviewPaneProps {
  previewUrl: string
}

export default function PreviewPane({ previewUrl }: PreviewPaneProps) {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <h3 className="text-sm font-medium">Preview</h3>
        {previewUrl && (
          <div className="text-xs text-gray-400 mt-1 truncate">
            {previewUrl}
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-white">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Apps Script Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Deploy to see preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}