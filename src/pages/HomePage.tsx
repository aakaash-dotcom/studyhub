import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CLASSES, getPublishedRecords, getRecordsByClass } from '../data/catalogue'
import { trackPageView } from '../lib/events'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const catalogue = getPublishedRecords()

  useEffect(() => {
    trackPageView('/', 'Home - Ravi\'s Tuition')
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full opacity-10 animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">Ravi's Tuition · Madurai · Since 1999</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              TN State Board
              <span className="block mt-1" style={{ color: '#FCD34D' }}>
                Free Study Materials
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto mb-6 px-2">
              Quarterly important questions, model papers & answer keys for Classes 8–12.
              Typeset, branded & watermarked in-house.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-6">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center bg-white rounded-2xl shadow-2xl p-1.5 sm:p-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 ml-3" style={{ color: '#595959' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search study materials..."
                  className="flex-1 px-3 py-2 sm:py-3 text-sm sm:text-base bg-transparent outline-none"
                  style={{ color: '#1A1A1A', fontSize: '16px' }}
                />
                <button className="text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}>
                  Search
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xl sm:text-2xl font-bold text-white">5</p>
                <p className="text-[10px] sm:text-xs text-blue-200">Classes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xl sm:text-2xl font-bold text-white">{catalogue.length}+</p>
                <p className="text-[10px] sm:text-xs text-blue-200">Materials</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-xl sm:text-2xl font-bold text-white">Free</p>
                <p className="text-[10px] sm:text-xs text-blue-200">Download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="py-8 sm:py-12" style={{ backgroundColor: '#F5F8FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A1A1A' }}>Select Your Class</h2>
            <p className="text-sm mt-1" style={{ color: '#595959' }}>Tap a class to see study materials</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CLASSES.map((cls) => {
              const count = getRecordsByClass(cls.id).length
              return (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className="relative z-10 text-center">
                    <div className="text-3xl sm:text-4xl mb-2">{cls.icon}</div>
                    <h3 className="font-bold text-sm sm:text-base group-hover:text-blue-700 transition-colors" style={{ color: '#1A1A1A' }}>
                      {cls.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: '#595959' }}>
                      {count} materials
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Materials */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>📚 Latest Materials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalogue.slice(0, 4).map((resource) => {
              const classData = CLASSES.find(c => c.id === resource.class)
              return (
                <Link
                  key={resource.id}
                  to={`/resource/${resource.id}`}
                  className="group flex items-center gap-3 bg-white hover:bg-blue-50 rounded-xl p-4 border transition-all shadow-sm hover:shadow-md"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate group-hover:text-blue-700" style={{ color: '#1A1A1A' }}>
                      {resource.title_en}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: '#595959' }}>
                      {classData?.name} · {resource.subject} · {resource.resource_type}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: resource.price_inr === 0 ? '#DCFCE7' : '#FEF3C7', color: resource.price_inr === 0 ? '#15803D' : '#B45309' }}>
                    {resource.price_inr === 0 ? 'FREE' : `₹${resource.price_inr}`}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
