import { X, Copy, CheckCircle, ExternalLink, FolderOpen, Link2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface GoogleDriveGuideProps {
  onClose: () => void
}

export default function GoogleDriveGuide({ onClose }: GoogleDriveGuideProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [driveConfig, setDriveConfig] = useState('')

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const generateDriveEmbedUrl = (folderUrl: string) => {
    // Extract folder ID from Google Drive URL
    const match = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (match) {
      const folderId = match[1]
      return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`
    }
    return ''
  }

  const handleGenerateConfig = () => {
    const embedUrl = generateDriveEmbedUrl(driveUrl)
    if (embedUrl) {
      setDriveConfig(JSON.stringify({
        folderUrl: driveUrl,
        embedUrl: embedUrl,
        lastUpdated: new Date().toISOString()
      }, null, 2))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Connect Your Google Drive</h2>
              <p className="text-sm text-gray-500">Set up your study materials link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Step 1 */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="font-semibold text-gray-800">Create a Google Drive Folder</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Organize your study materials into a Google Drive folder. Create sub-folders for each class or subject.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">Suggested folder structure:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`📁 Study Materials/
  ├── 📁 Class 12/
  │   ├── 📁 Physics/
  │   ├── 📁 Chemistry/
  │   └── 📁 Mathematics/
  ├── 📁 Class 11/
  ├── 📁 Class 10/
  └── 📁 Entrance Exams/`}
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="font-semibold text-gray-800">Share Folder Publicly</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Make your folder accessible to anyone with the link:
            </p>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">a.</span>
                Right-click your folder → Share
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">b.</span>
                Under "General access", select "Anyone with the link"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">c.</span>
                Set role to "Viewer" (recommended)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">d.</span>
                Copy the link
              </li>
            </ol>
          </div>

          {/* Step 3 - URL Input */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="font-semibold text-gray-800">Paste Your Drive Link</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Enter your Google Drive folder URL to generate the embed configuration:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Link2 className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                />
              </div>
              <button
                onClick={handleGenerateConfig}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Generate
              </button>
            </div>
            {driveConfig && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Configuration Generated!</span>
                </div>
                <pre className="text-xs text-green-800 bg-white rounded-lg p-3 overflow-x-auto border border-green-100">
                  {driveConfig}
                </pre>
              </div>
            )}
            {driveUrl && !driveConfig && driveUrl.includes('drive.google.com') === false && (
              <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Please enter a valid Google Drive URL
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <h3 className="font-semibold text-gray-800">Embed in Your Website</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Use this iframe code to embed your Drive folder directly in any page:
            </p>
            <div className="bg-gray-900 rounded-xl p-4 relative">
              <button
                onClick={() => copyToClipboard('<iframe src="https://drive.google.com/embeddedfolderview?id=YOUR_FOLDER_ID#grid" width="100%" height="600px"></iframe>', 4)}
                className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedStep === 4 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-300" />
                )}
              </button>
              <code className="text-xs text-green-400 block overflow-x-auto">
                {'<iframe src="https://drive.google.com/embeddedfolderview?id=YOUR_FOLDER_ID#grid" width="100%" height="600px"></iframe>'}
              </code>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 bg-white rounded-lg px-3 py-2 border border-blue-100"
              >
                Open Google Drive →
              </a>
              <a
                href="https://developers.google.com/drive/api/guides/about-files"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 bg-white rounded-lg px-3 py-2 border border-blue-100"
              >
                Drive API Docs →
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
