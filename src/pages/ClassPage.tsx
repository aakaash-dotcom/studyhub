import { Link, useParams } from 'react-router-dom'
import { CLASSES, RESOURCE_TYPES, getRecordsByClass, getRecordsByClassAndType } from '../data/catalogue'

export default function ClassPage() {
  const { classId } = useParams()
  const classData = CLASSES.find(c => c.id === classId)

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
    <div style={{ backgroundColor: '#F5F8FC' }} className="min-h-screen">
      <div style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)', color: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm opacity-80 mb-4">
            <Link to="/" className="hover:opacity-100">← Home</Link>
            <span>/</span>
            <span className="font-medium text-white">{classData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-5xl">{classData.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{classData.name}</h1>
              <p className="opacity-80 text-sm mt-1">Tamil Nadu State Board - Samacheer Kalvi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>📂 Browse by Category</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCE_TYPES.map((cat) => {
            const count = getRecordsByClassAndType(classId!, cat.id).length
            return (
              <Link
                key={cat.id}
                to={`/class/${classId}/${cat.id}`}
                className="flex items-center gap-4 p-5 rounded-xl border-2 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="text-4xl">{cat.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>
                    {cat.name}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#595959' }}>
                    {count > 0 ? `${count} materials available` : 'Materials coming soon'}
                  </p>
                </div>
                <span className="text-2xl" style={{ color: '#595959' }}>→</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>🔥 Popular Materials</h2>
          <div className="space-y-3">
            {getRecordsByClass(classId!).slice(0, 5).map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="flex items-center gap-4 bg-white hover:bg-blue-50 rounded-xl p-4 border transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                  <span className="text-2xl">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" style={{ color: '#1A1A1A' }}>
                    {resource.title_en}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: '#595959' }}>{resource.resource_type}</span>
                    <span className="text-xs" style={{ color: '#C0C8D9' }}>•</span>
                    <span className="text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
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
