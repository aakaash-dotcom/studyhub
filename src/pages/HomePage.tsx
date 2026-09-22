import { Link, useNavigate } from 'react-router-dom'
import { usePrefs } from '../context/PrefsContext'
import { CLASSES } from '../data/catalogue'
import { useState } from 'react'

export default function HomePage() {
  const { prefs, setPrefs } = usePrefs()
  const navigate = useNavigate()
  const [tempPrefs, setTempPrefs] = useState({
    board: prefs?.board || null as 'tn' | 'cbse' | null,
    lang: prefs?.lang || null as 'en' | 'ta' | 'hi' | null,
    medium: prefs?.medium || null as 'English' | 'Tamil' | 'Hindi' | null
  })

  const handleBoardSelect = (board: 'tn' | 'cbse') => {
    setTempPrefs({ ...tempPrefs, board, lang: null, medium: null })
  }

  const handleLanguageSelect = (lang: 'en' | 'ta' | 'hi') => {
    const medium = lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English'
    setTempPrefs({ ...tempPrefs, lang, medium })
  }

  const handleClassSelect = (classId: string) => {
    if (!tempPrefs.board || !tempPrefs.lang || !tempPrefs.medium) {
      // Pulse the board/language rows
      return
    }
    
    // Save all prefs
    setPrefs({
      board: tempPrefs.board,
      lang: tempPrefs.lang,
      medium: tempPrefs.medium,
      classId
    })
    
    // Navigate to class page
    navigate(`/class/${classId}`)
  }

  // Check if class has content
  const hasContent = (classId: string) => {
    return ['8', '9', '10', '11', '12'].includes(classId)
  }

  // Pyramid layout
  const pyramidRows = [
    ['12', '11', '10', '9', '8'],
    ['7', '6', '5', '4'],
    ['3', '2'],
    ['1']
  ]

  // Check if language is disabled
  const isLanguageDisabled = (lang: 'en' | 'ta' | 'hi') => {
    if (!tempPrefs.board) return false
    if (tempPrefs.board === 'tn' && lang === 'hi') return true
    if (tempPrefs.board === 'cbse' && lang === 'ta') return true
    return false
  }

  const getLanguageDisabledReason = (lang: 'en' | 'ta' | 'hi') => {
    if (tempPrefs.board === 'tn' && lang === 'hi') return 'No Hindi medium'
    if (tempPrefs.board === 'cbse' && lang === 'ta') return 'No Tamil medium'
    return ''
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Board Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Select Board
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleBoardSelect('tn')}
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg"
              style={{
                borderColor: tempPrefs.board === 'tn' ? '#17528C' : '#C0C8D9',
                backgroundColor: tempPrefs.board === 'tn' ? '#EFF6FF' : 'white'
              }}
            >
              <div className="text-3xl mb-2">📘</div>
              <h3 className="font-bold text-lg mb-1" style={{ color: '#1A1A1A' }}>
                TN State Board
              </h3>
              <p className="text-xs" style={{ color: '#595959' }}>
                Samacheer Kalvi
              </p>
            </button>
            <button
              onClick={() => handleBoardSelect('cbse')}
              className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg"
              style={{
                borderColor: tempPrefs.board === 'cbse' ? '#17528C' : '#C0C8D9',
                backgroundColor: tempPrefs.board === 'cbse' ? '#EFF6FF' : 'white'
              }}
            >
              <div className="text-3xl mb-2">📗</div>
              <h3 className="font-bold text-lg mb-1" style={{ color: '#1A1A1A' }}>
                CBSE
              </h3>
              <p className="text-xs" style={{ color: '#595959' }}>
                Central Board
              </p>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Select Language
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(['hi', 'ta', 'en'] as const).map((lang) => {
              const disabled = isLanguageDisabled(lang)
              const isSelected = tempPrefs.lang === lang
              const label = lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English'
              
              return (
                <button
                  key={lang}
                  onClick={() => !disabled && handleLanguageSelect(lang)}
                  disabled={disabled}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSelected ? '#17528C' : disabled ? '#E5E7EB' : '#C0C8D9',
                    backgroundColor: isSelected ? '#EFF6FF' : disabled ? '#F9FAFB' : 'white',
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="text-2xl mb-1">
                    {lang === 'ta' ? 'த' : lang === 'hi' ? 'हि' : 'E'}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: disabled ? '#9CA3AF' : '#1A1A1A' }}>
                    {label}
                  </h3>
                  {disabled && (
                    <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                      {getLanguageDisabledReason(lang)}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Class Pyramid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Select Class
          </h2>
          <div className="flex flex-col items-center gap-3">
            {pyramidRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 justify-center">
                {row.map((classId) => {
                  const hasClassContent = hasContent(classId)
                  const canSelect = tempPrefs.board && tempPrefs.lang && hasClassContent
                  const classData = CLASSES.find(c => c.id === classId)
                  
                  return (
                    <button
                      key={classId}
                      onClick={() => canSelect && handleClassSelect(classId)}
                      disabled={!hasClassContent || !canSelect}
                      className="w-14 h-14 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-sm"
                      style={{
                        borderColor: !hasClassContent ? '#E5E7EB' : canSelect ? '#C0C8D9' : '#E5E7EB',
                        backgroundColor: !hasClassContent ? '#F9FAFB' : canSelect ? 'white' : '#F9FAFB',
                        color: !hasClassContent ? '#9CA3AF' : canSelect ? '#1A1A1A' : '#9CA3AF',
                        cursor: canSelect ? 'pointer' : 'not-allowed',
                        opacity: canSelect ? 1 : 0.6
                      }}
                      title={!hasClassContent ? 'Coming soon - WhatsApp 8610653352' : !canSelect ? 'Select board and language first' : classData?.name}
                    >
                      {classId}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-4" style={{ color: '#595959' }}>
            Classes 1-7 coming soon. WhatsApp: 8610653352
          </p>
        </div>

        {/* Plans Strip */}
        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: '#C0C8D9' }}>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/plans" className="text-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-1">📚</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>FREE</h3>
              <p className="text-xs" style={{ color: '#595959' }}>PYQ + model papers + keys</p>
            </Link>
            <Link to="/plans" className="text-center p-3 rounded-xl border-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#D4AF37' }}>
              <div className="text-2xl mb-1">⭐</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>PRO</h3>
              <p className="text-xs" style={{ color: '#595959' }}>Topper boxes · one-word</p>
            </Link>
            <a href="https://wa.me/918610653352" target="_blank" rel="noopener noreferrer" className="text-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-1">🎓</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>CENTUM</h3>
              <p className="text-xs" style={{ color: '#595959' }}>Opening soon</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
