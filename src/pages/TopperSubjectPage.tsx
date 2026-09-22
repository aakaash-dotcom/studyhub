import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { CLASSES, SUBJECTS } from '../data/catalogue'
import { usePrefs } from '../context/PrefsContext'
import { t } from '../lib/translations'
import { useState } from 'react'
import LockModal from '../components/LockModal'

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

export default function TopperSubjectPage() {
  const { classId, boxId } = useParams()
  const { prefs } = usePrefs()
  const classData = CLASSES.find(c => c.id === classId)
  const box = TOPPER_BOXES.find(b => b.id === boxId)
  const lang = prefs?.lang || 'en'
  const subjects = SUBJECTS[classId!] || []
  const [showLockModal, setShowLockModal] = useState(false)

  if (!classData || !box) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Page not found</h1>
        <Link to="/" className="text-sm" style={{ color: '#17528C' }}>← Go to Home</Link>
      </div>
    )
  }

  const handleTakeTest = () => {
    // Check if user has Centum plan (for now, just show lock modal)
    setShowLockModal(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      {/* Header */}
      <div className="text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f, #0E3A66)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 flex-wrap">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> {t('home', lang)}
            </Link>
            <span className="mx-1">/</span>
            <Link to={`/class/${classId}`} className="hover:text-white">{classData.name}</Link>
            <span className="mx-1">/</span>
            <Link to={`/class/${classId}/topper`} className="hover:text-white">{t('topperMaterial', lang)}</Link>
            <span className="mx-1">/</span>
            <span className="text-white font-medium">{lang === 'ta' ? box.title_ta : box.title}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl">
              {box.id === 'one-word' ? '📝' : box.id === 'slow-learners' ? '🐢' : '📚'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{lang === 'ta' ? box.title_ta : box.title}</h1>
              <p className="text-white/80 text-sm mt-1">{classData.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border-2 bg-white"
              style={{ borderColor: '#C0C8D9' }}
            >
              <div className="text-3xl sm:text-4xl mb-2">{subject.icon}</div>
              <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: '#1A1A1A' }}>
                {subject.name}
              </h3>
              <p className="text-xs" style={{ color: '#595959' }}>
                {t('sirAddingFiles', lang)}
              </p>
            </div>
          ))}
        </div>

        {/* One-word special button */}
        {box.id === 'one-word' && (
          <div className="mt-8 text-center">
            <button
              onClick={handleTakeTest}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: '#D4AF37' }}
            >
              {t('takeAsTest', lang)}
            </button>
          </div>
        )}
      </div>

      {/* Lock Modal */}
      <LockModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
    </div>
  )
}
