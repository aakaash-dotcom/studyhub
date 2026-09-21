import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { CLASSES } from '../data/catalogue'
import { trackPageView } from '../lib/events'

export default function HomePage() {
  useEffect(() => {
    trackPageView('/', 'Home')
  }, [])

  return (
    <div style={{ backgroundColor: '#F5F8FC' }}>
      {/* Class Blocks - First Section */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CLASSES.map((cls) => (
              <Link
                key={cls.id}
                to={`/class/${cls.id}`}
                className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border"
                style={{ borderColor: '#C0C8D9' }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{cls.icon}</div>
                  <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                    {cls.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Thin Plans Strip */}
      <section className="py-6 bg-white border-t" style={{ borderColor: '#C0C8D9' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              to="/plans"
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all"
              style={{ borderColor: '#C0C8D9' }}
            >
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>FREE</h3>
                <p className="text-xs" style={{ color: '#595959' }}>Old question papers</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#EFF6FF', color: '#17528C' }}>
                ₹0
              </span>
            </Link>

            <Link
              to="/plans"
              className="flex items-center justify-between p-3 rounded-lg border-2 hover:shadow-sm transition-all"
              style={{ borderColor: '#D4AF37', backgroundColor: '#FFFBEB' }}
            >
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>PRO</h3>
                <p className="text-xs" style={{ color: '#595959' }}>ImpQ, models, keys</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded text-white" style={{ backgroundColor: '#D4AF37' }}>
                ₹499/year
              </span>
            </Link>

            <a
              href="https://wa.me/918610653352"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all"
              style={{ borderColor: '#C0C8D9' }}
            >
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>CENTUM</h3>
                <p className="text-xs" style={{ color: '#595959' }}>Recordings + WhatsApp</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded text-white" style={{ backgroundColor: '#25D366' }}>
                Opening soon
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
