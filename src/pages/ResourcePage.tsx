import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Download, Eye, Lock, FileText, Clock, BookOpen, Share2, ChevronLeft } from 'lucide-react'
import { resources, tnClasses, categories } from '../data/resources'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function ResourcePage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showPreview, setShowPreview] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const resource = resources.find(r => r.id === resourceId)
  const classData = resource ? tnClasses.find(c => c.id === resource.class) : null
  const categoryData = resource ? categories.find(c => c.id === resource.category) : null

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Resource not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Go Home</Link>
      </div>
    )
  }

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/resource/${resource.id}` } })
      return
    }
    setDownloading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setDownloading(false)
    window.open(resource.driveLink, '_blank')
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Study Material': 'bg-blue-100 text-blue-700',
      'Question Paper': 'bg-red-100 text-red-700',
      'Model Paper': 'bg-green-100 text-green-700',
      'Important Questions': 'bg-yellow-100 text-yellow-700',
      'Notes': 'bg-purple-100 text-purple-700',
      'Solutions': 'bg-emerald-100 text-emerald-700',
      'Syllabus': 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const relatedResources = resources
    .filter(r => r.id !== resource.id && r.class === resource.class && r.subject === resource.subject)
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-blue-600 whitespace-nowrap">
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to="/" className="hover:text-blue-600 whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to={`/class/${resource.class}`} className="hover:text-blue-600 whitespace-nowrap">
          {classData?.name}
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <Link to={`/class/${resource.class}/${resource.category}`} className="hover:text-blue-600 whitespace-nowrap">
          {categoryData?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - PDF Preview */}
        <div className="lg:col-span-2">
          {/* PDF Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">PDF Preview</span>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
            
            {showPreview && (
              <div className="relative">
                <div className="aspect-[3/4] sm:aspect-video bg-gray-100">
                  <iframe
                    src={resource.previewLink}
                    className="w-full h-full border-0"
                    title={`Preview of ${resource.title}`}
                    allow="autoplay"
                  />
                </div>
                {/* Overlay for non-logged in users */}
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6 sm:pb-8">
                    <div className="text-center px-4">
                      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-sm mx-auto border border-gray-100">
                        <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1">Login to Download</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3">Create a free account to download this material</p>
                        <Link
                          to={`/login?from=/resource/${resource.id}`}
                          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                        >
                          Login / Register Free
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resource Info */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{resource.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                  <span className="text-xs text-gray-500">{resource.subject}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{classData?.name}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{resource.medium} Medium</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{resource.size}</p>
                <p className="text-[10px] text-gray-500">File Size</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{resource.pages}</p>
                <p className="text-[10px] text-gray-500">Pages</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{resource.downloads.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Downloads</p>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-4 space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all ${
                  isAuthenticated
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-[1.02]'
                } ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing Download...
                  </>
                ) : isAuthenticated ? (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF ({resource.size})
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Login to Download Free
                  </>
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-center text-xs text-gray-500">
                  🔒 Free registration required. Takes only 30 seconds!
                </p>
              )}

              <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                Share this Resource
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Related Materials
            </h3>
            <div className="space-y-3">
              {relatedResources.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/resource/${rel.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">
                      {rel.title}
                    </p>
                    <p className="text-[10px] text-gray-400">{rel.type} • {rel.size}</p>
                  </div>
                </Link>
              ))}
              {relatedResources.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No related materials yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
