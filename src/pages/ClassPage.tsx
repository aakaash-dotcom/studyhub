import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import { CLASSES, RESOURCE_TYPES, getRecordsByClass, getRecordsByClassAndType } from '../data/catalogue'
import { useEffect } from 'react'
import { trackPageView } from '../lib/events'

export default function ClassPage() {
  const { classId } = useParams()
  const classData = CLASSES.find(c => c.id === classId)

  useEffect(() => {
    if (classData) {
      trackPageView(`/class/${classId}`, `${classData.name}`)
    }
  }, [classId, classData])

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Class not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      {/* Header */}
      <div className="text-white" style={{ background: `linear-gradient(135deg, ${classId === '12' ? '#059669, #0d9488' : classId === '11' ? '#7c3aed, #9333ea' : classId === '10' ? '#17528C, #0E3A66' : classId === '9' ? '#ea580c, #dc2626' : '#0d9488, #0891b2'})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{classData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl">{classData.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{classData.name}</h1>
              <p className="text-white/80 text-sm mt-1">Tamil Nadu State Board - Samacheer Kalvi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>📂 Browse by Category</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {RESOURCE_TYPES.map((cat) => {
            const count = getRecordsByClassAndType(classId!, cat.id).length
            return (
              <Link
                key={cat.id}
                to={`/class/${classId}/${cat.id}`}
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="text-3xl sm:text-4xl flex-shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#595959' }}>
                    {count > 0 ? `${count} materials available` : 'Materials coming soon'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ color: '#595959' }} />
              </Link>
            )
          })}
        </div>

        {/* Google Drive Folder Embed */}
        {classData.drive_folder_id && (
          <div className="bg-white rounded-2xl border p-4 sm:p-6 shadow-sm mb-8" style={{ borderColor: '#C0C8D9' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l16.75-28.95-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6z" fill="#0066DA"/>
                  <path d="m43.65 25-17.15-29.7c-1.35.8-2.5 1.9-3.3 3.3l-13.4 23.2c-.8 1.4-1.2 3-1.2 4.6 0 1.6.4 3.2 1.2 4.6l3.85 6.65z" fill="#00AC47" opacity=".7"/>
                  <path d="m73.55 77.15c1.35-.8 2.5-1.9 3.3-3.3l1.9-3.3-16.6-28.85-17.25 29.95c1.35.8 2.9 1.2 4.5 1.2s3.15-.45 4.5-1.2z" fill="#EA4335" opacity=".7"/>
                  <path d="m59.2 10.15-15.55-9.15c-1.35-.8-2.9-1.2-4.5-1.2s-3.15.45-4.5 1.2l-15.55 9.15 17.15 29.7z" fill="#00AC47"/>
                  <path d="m73.4 66.85 3.85-6.65c.8-1.4 1.2-3 1.2-4.6 0-1.6-.4-3.2-1.2-4.6l-13.4-23.2c-.8-1.4-1.95-2.5-3.3-3.3l-17.15 29.7 16.6 28.85c1.35-.8 2.5-1.9 3.3-3.3z" fill="#EA4335" opacity=".7"/>
                </svg>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: '#1A1A1A' }}>All {classData.name} Files</h3>
                  <p className="text-xs" style={{ color: '#595959' }}>Browse directly from Google Drive</p>
                </div>
              </div>
              <a
                href={`https://drive.google.com/drive/folders/${classData.drive_folder_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}
              >
                Open in Drive <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#C0C8D9' }}>
              <iframe
                src={`https://drive.google.com/embeddedfolderview?id=${classData.drive_folder_id}#grid`}
                className="w-full h-96 sm:h-[500px] border-0"
                title={`${classData.name} Google Drive Folder`}
              />
            </div>
          </div>
        )}

        {/* Recent Materials */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#1A1A1A' }}>🔥 Popular Materials</h2>
          <div className="space-y-3">
            {getRecordsByClass(classId!).slice(0, 5).map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="group flex items-center gap-3 sm:gap-4 bg-white hover:bg-blue-50 rounded-xl p-3 sm:p-4 border transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                  <span className="text-xl sm:text-2xl">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                    {resource.title_en}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.resource_type}</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#C0C8D9' }}>•</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
