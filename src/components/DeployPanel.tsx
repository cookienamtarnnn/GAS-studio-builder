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
      setStatus(data.success ? '✅ Pulled successfully' : '❌ Pull failed')
    } catch (error) {
      setStatus('❌ Error pulling from Apps Script')
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
      setStatus(data.success ? '✅ Pushed successfully' : '❌ Push failed')
    } catch (error) {
      setStatus('❌ Error pushing to Apps Script')
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
        setStatus('✅ Test deployment ready')
      } else {
        setStatus('❌ Test deployment failed')
      }
    } catch (error) {
      setStatus('❌ Error creating test deployment')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDeploy = async () => {
    if (!deployDescription.trim()) {
      setStatus('❌ Please enter a deployment description')
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
        setStatus('❌ Local code differs from remote. Pull first!')
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
        setStatus(`✅ Deployed version ${data.version}`)
        setDeployDescription('')
      } else {
        setStatus('❌ Deployment failed')
      }
    } catch (error) {
      setStatus('❌ Error during deployment')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4">
      <div className="flex items-center space-x-4">
        {/* Project ID */}
        <div className="flex-1">
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Apps Script Project ID"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <button
          onClick={handlePull}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium"
        >
          Pull
        </button>
        <button
          onClick={handlePush}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium"
        >
          Push
        </button>
        <button
          onClick={handleTestDeploy}
          disabled={isDeploying}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-medium"
        >
          Test Deploy
        </button>

        {/* Deploy Description */}
        <input
          type="text"
          value={deployDescription}
          onChange={(e) => setDeployDescription(e.target.value)}
          placeholder="Deployment description..."
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleDeploy}
          disabled={isDeploying || !deployDescription.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-medium"
        >
          Deploy
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className="mt-3 text-sm text-gray-300">
          {status}
        </div>
      )}
    </div>
  )
}
