import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { CLASSES, getRecordsByClass, getPublishedRecords } from '../data/catalogue'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const catalogue = getPublishedRecords()

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)', color: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Ravi's Tuition · Madurai · Since 1999</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            TN State Board
            <span className="block mt-2" style={{ color: '#FCD34D' }}>
              Free Study Materials
            </span>
          </h1>

          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Quarterly important questions, model papers & answer keys for Classes 8–12.
            Typeset, branded & watermarked in-house.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-xl shadow-lg p-2">
              <Search className="w-5 h-5 ml-3" style={{ color: '#595959' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study materials..."
                className="flex-1 px-3 py-2 text-gray-800 bg-transparent outline-none"
                style={{ fontSize: '16px' }}
              />
              <button 
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #17528C, #0E3A66)' }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold">5</p>
              <p className="text-xs opacity-80">Classes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold">{catalogue.length}+</p>
              <p className="text-xs opacity-80">Materials</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold">Free</p>
              <p className="text-xs opacity-80">Download</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section style={{ backgroundColor: '#F5F8FC' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Select Your Class
            </h2>
            <p style={{ color: '#595959' }}>Tap a class to see study materials</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CLASSES.map((cls) => {
              const count = getRecordsByClass(cls.id).length
              return (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border"
                  style={{ borderColor: '#C0C8D9' }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{cls.icon}</div>
                    <h3 className="font-bold text-base mb-1" style={{ color: '#1A1A1A' }}>
                      {cls.name}
                    </h3>
                    <p className="text-xs" style={{ color: '#595959' }}>
                      {count} materials
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest Materials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            📚 Latest Materials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogue.slice(0, 4).map((resource) => {
              const classData = CLASSES.find(c => c.id === resource.class)
              return (
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
                    <h4 className="font-medium text-sm truncate" style={{ color: '#1A1A1A' }}>
                      {resource.title_en}
                    </h4>
                    <p className="text-xs mt-1" style={{ color: '#595959' }}>
                      {classData?.name} · {resource.subject} · {resource.resource_type}
                    </p>
                  </div>
                  <span 
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: resource.price_inr === 0 ? '#DCFCE7' : '#FEF3C7',
                      color: resource.price_inr === 0 ? '#15803D' : '#B45309'
                    }}
                  >
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
