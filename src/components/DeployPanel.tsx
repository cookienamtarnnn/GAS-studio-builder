import { useState } from 'react'

interface DeployPanelProps {
  codeFiles: Record<string, string>
  onPreviewUpdate: (url: string) => void
}

export default function DeployPanel({ codeFiles, onPreviewUpdate }: DeployPanelProps) {
  const [status, setStatus] = useState<string>('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployDescription, setDeployDescription] = useState('')
  const [projectId, setProjectId] = useState('')

  const handlePull = async () => {
    setStatus('Pulling from Apps Script...')
    try {
      const response = await fetch('/api/clasp/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      const data = await response.json()
      setStatus(data.success ? '✓ Pulled successfully' : '✕ Pull failed')
    } catch (error) {
      setStatus('✕ Error pulling from Apps Script')
    }
  }

  const handlePush = async () => {
    setStatus('Pushing to Apps Script...')
    try {
      const response = await fetch('/api/clasp/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeFiles, projectId })
      })
      const data = await response.json()
      setStatus(data.success ? '✓ Pushed successfully' : '✕ Push failed')
    } catch (error) {
      setStatus('✕ Error pushing to Apps Script')
    }
  }

  const handleTestDeploy = async () => {
    setStatus('Creating test deployment...')
    setIsDeploying(true)
    try {
      const response = await fetch('/api/clasp/test-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeFiles, projectId })
      })
      const data = await response.json()
      if (data.success && data.url) {
        onPreviewUpdate(data.url)
        setStatus('✓ Test deployment ready')
      } else {
        setStatus('✕ Test deployment failed')
      }
    } catch (error) {
      setStatus('✕ Error creating test deployment')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDeploy = async () => {
    if (!deployDescription.trim()) {
      setStatus('✕ Please enter a deployment description')
      return
    }

    setStatus('Validating and deploying...')
    setIsDeploying(true)
    try {
      // First validate that local matches remote
      const validateResponse = await fetch('/api/clasp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeFiles, projectId })
      })
      const validateData = await validateResponse.json()

      if (!validateData.valid) {
        setStatus('✕ Local code differs from remote. Pull first!')
        setIsDeploying(false)
        return
      }

      // Deploy
      const response = await fetch('/api/clasp/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeFiles,
          projectId,
          description: deployDescription
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setStatus(`✓ Deployed version ${data.version}`)
        setDeployDescription('')
      } else {
        setStatus('✕ Deployment failed')
      }
    } catch (error) {
      setStatus('✕ Error during deployment')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="deploy-panel-content" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Project ID */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Apps Script Project ID"
            className="w-full px-3 py-2 text-sm text-mono rounded outline-none transition-colors"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              borderWidth: '1px',
              borderColor: 'var(--color-border-subtle)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
          />
        </div>

        {/* Actions Row 1 */}
        <div className="flex gap-2">
          <button
            onClick={handlePull}
            className="btn btn-sm transition-colors"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              borderWidth: '1px',
              borderColor: 'var(--color-border-subtle)'
            }}
          >
            Pull
          </button>
          <button
            onClick={handlePush}
            className="btn btn-sm transition-colors"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              borderWidth: '1px',
              borderColor: 'var(--color-border-subtle)'
            }}
          >
            Push
          </button>
          <button
            onClick={handleTestDeploy}
            disabled={isDeploying}
            className="btn btn-sm transition-all disabled:opacity-30"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-warning)',
              borderWidth: '1px',
              borderColor: 'var(--color-warning)'
            }}
          >
            Test
          </button>
        </div>
      </div>

      {/* Deploy Row */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Deploy Description */}
        <input
          type="text"
          value={deployDescription}
          onChange={(e) => setDeployDescription(e.target.value)}
          placeholder="Deployment description..."
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded outline-none transition-colors"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            borderWidth: '1px',
            borderColor: 'var(--color-border-subtle)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border-subtle)'}
        />

        <button
          onClick={handleDeploy}
          disabled={isDeploying || !deployDescription.trim()}
          className="btn transition-all disabled:opacity-30 w-full sm:w-auto"
          style={{
            background: isDeploying || !deployDescription.trim() ? 'var(--color-bg-tertiary)' : 'var(--color-success)',
            color: 'var(--color-text-primary)'
          }}
        >
          Deploy
        </button>
      </div>

      {/* Status */}
      {status && (
        <div 
          className="w-full text-sm text-mono"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {status}
        </div>
      )}
    </div>
  )
}
