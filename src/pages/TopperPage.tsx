import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { CLASSES, SUBJECTS } from '../data/catalogue'
import { usePrefs } from '../context/PrefsContext'
import { t } from '../lib/translations'
import { useState, useEffect } from 'react'
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

export default function TopperPage() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { prefs } = usePrefs()
  const classData = CLASSES.find(c => c.id === classId)
  const lang = prefs?.lang || 'en'
  
  // Check if user has pro plan
  const hasProPlan = (() => {
    try {
      const plan = localStorage.getItem('ravi_plan')
      if (plan) {
        const planData = JSON.parse(plan)
        return planData.plan === 'pro' && planData.valid_until > Date.now()
      }
    } catch (e) {
      // Ignore parse errors
    }
    return false
  })()
  
  // Timer state for free users
  const [showLockModal, setShowLockModal] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)
  
  useEffect(() => {
    if (!hasProPlan) {
      const timer = setTimeout(() => {
        setIsBlurred(true)
        setShowLockModal(true)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [hasProPlan])

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

      {/* Topper Boxes - 2×2 Grid */}
      <div 
        className="max-w-md mx-auto px-4 py-6 transition-all duration-500"
        style={{ 
          filter: isBlurred ? 'blur(8px)' : 'none',
          pointerEvents: isBlurred ? 'none' : 'auto'
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {TOPPER_BOXES.map((box) => (
            <Link
              key={box.id}
              to={`/class/${classId}/topper/${box.id}`}
              className="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1e3a5f', 
                borderColor: '#D4AF37',
                aspectRatio: '1'
              }}
            >
              <div className="p-4 h-full flex flex-col justify-center">
                <div className="text-2xl mb-2">
                  {box.id === 'one-word' ? '📝' : box.id === 'slow-learners' ? '🐢' : '📚'}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {lang === 'ta' ? box.title_ta : box.title}
                </h3>
                <div className="mt-2 inline-block px-2 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                  {lang === 'ta' ? 'பார்க்க' : 'View'}
                </div>
              </div>
            </Link>
          ))}
          {/* 4th Empty Slot */}
          <div 
            className="rounded-xl border-2 border-dashed flex items-center justify-center"
            style={{ 
              borderColor: '#C0C8D9',
              aspectRatio: '1',
              backgroundColor: '#F9FAFB'
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📦</div>
              <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Coming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Modal for free users after 5s */}
      <LockModal 
        isOpen={showLockModal} 
        onClose={() => {
          setShowLockModal(false)
          navigate('/plans')
        }} 
      />
    </div>
  )
}
