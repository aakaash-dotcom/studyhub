import { Link, useParams } from 'react-router-dom'
import { CLASSES, RESOURCE_TYPES, SUBJECTS, getRecordsByClassAndType } from '../data/catalogue'

export default function CategoryPage() {
  const { classId, category } = useParams()
  const classData = CLASSES.find(c => c.id === classId)
  const categoryData = RESOURCE_TYPES.find(c => c.id === category)

  if (!classData || !categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Page not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  const subjects = SUBJECTS[classId!] || []
  const classResources = getRecordsByClassAndType(classId!, category!)

  return (
    <div style={{ backgroundColor: '#F5F8FC' }} className="min-h-screen">
      <div style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)', color: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm opacity-80 mb-4 flex-wrap">
            <Link to="/" className="hover:opacity-100">← Home</Link>
            <span>/</span>
            <Link to={`/class/${classId}`} className="hover:opacity-100">{classData.name}</Link>
            <span>/</span>
            <span className="font-medium text-white">{categoryData.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-4xl">{categoryData.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">{classData.name} - {categoryData.name}</h1>
              <p className="opacity-80 text-sm mt-1">Select a subject to view materials</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>📚 Select Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {subjects.map((subject) => {
            const count = classResources.filter(r => r.subject === subject.name).length
            return (
              <Link
                key={subject.name}
                to={`/class/${classId}/${category}/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-xl p-5 border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{subject.icon}</span>
                  {count > 0 && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#F5F8FC', color: '#17528C' }}>
                      {count}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>{subject.name}</h3>
                <p className="text-xs mt-1" style={{ color: '#595959' }}>{count > 0 ? `${count} files` : 'Coming soon'}</p>
              </Link>
            )
          })}
        </div>

        {classResources.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>📄 All {categoryData.name} ({classResources.length})</h2>
            <div className="space-y-3">
              {classResources.map((resource) => (
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
                    <h4 className="font-medium truncate" style={{ color: '#1A1A1A' }}>{resource.title_en}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: '#595959' }}>{resource.subject}</span>
                      <span className="text-xs" style={{ color: '#C0C8D9' }}>•</span>
                      <span className="text-xs" style={{ color: '#595959' }}>{resource.pages} pages</span>
                      <span className="text-xs" style={{ color: '#C0C8D9' }}>•</span>
                      <span className="text-xs font-medium" style={{ color: resource.price_inr === 0 ? '#15803D' : '#B45309' }}>
                        {resource.price_inr === 0 ? 'FREE' : `₹${resource.price_inr}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
