import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { CLASSES, SUBJECTS } from '../data/catalogue'
import { usePrefs } from '../context/PrefsContext'
import { t } from '../lib/translations'

const TOPPER_BOXES = [
  {
    id: 'one-word',
    title: 'One-word question bank',
    title_ta: 'ஒருசொல் வினா வங்கி',
    layout: 'wide'
  },
  {
    id: 'slow-learners',
    title: 'Slow learners',
    title_ta: 'மெதுவாகப் படிப்போர்',
    layout: 'tile'
  },
  {
    id: 'qbank',
    title: 'Question bank',
    title_ta: 'வினா வங்கி',
    layout: 'tile'
  }
]

export default function TopperPage() {
  const { classId } = useParams()
  const { prefs } = usePrefs()
  const classData = CLASSES.find(c => c.id === classId)
  const lang = prefs?.lang || 'en'

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
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> {t('home', lang)}
            </Link>
            <span className="mx-1">/</span>
            <Link to={`/class/${classId}`} className="hover:text-white">{classData.name}</Link>
            <span className="mx-1">/</span>
            <span className="text-white font-medium">{t('topperMaterial', lang)}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">👑</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t('topperPack', lang)}</h1>
              <p className="text-white/80 text-sm mt-1">{classData.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topper Boxes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {TOPPER_BOXES.map((box) => (
            <Link
              key={box.id}
              to={`/class/${classId}/topper/${box.id}`}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                box.layout === 'wide' ? 'md:col-span-2' : ''
              }`}
              style={{ backgroundColor: '#1e3a5f', borderColor: '#D4AF37' }}
            >
              <div className="p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl mb-3">
                  {box.id === 'one-word' ? '📝' : box.id === 'slow-learners' ? '🐢' : '📚'}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {lang === 'ta' ? box.title_ta : box.title}
                </h3>
                <div className="mt-4 inline-block px-4 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                  {lang === 'ta' ? 'பார்க்க' : 'View'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
