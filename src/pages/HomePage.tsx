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
      return
    }
    
    setPrefs({
      board: tempPrefs.board,
      lang: tempPrefs.lang,
      medium: tempPrefs.medium,
      classId
    })
    
    navigate(`/class/${classId}`)
  }

  const hasContent = (classId: string) => {
    return ['8', '9', '10', '11', '12'].includes(classId)
  }

  // Reverse pyramid: 5-4-3 rows
  const pyramidRows = [
    ['12', '11', '10', '9', '8'],
    ['7', '6', '5', '4'],
    ['3', '2', '1']
  ]

  const isLanguageDisabled = (lang: 'en' | 'ta' | 'hi') => {
    if (!tempPrefs.board) return true // All inert until board picked
    if (tempPrefs.board === 'tn' && lang === 'hi') return true
    if (tempPrefs.board === 'cbse' && lang === 'ta') return true
    return false
  }

  const getLanguageDisabledReason = (lang: 'en' | 'ta' | 'hi') => {
    if (!tempPrefs.board) return ''
    if (tempPrefs.board === 'tn' && lang === 'hi') return 'No Hindi medium'
    if (tempPrefs.board === 'cbse' && lang === 'ta') return 'No Tamil medium'
    return ''
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8EEF5' }}>
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Board Selection */}
        <div className="mb-3">
          <p className="text-xs mb-1" style={{ color: '#595959' }}>Select Board</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBoardSelect('tn')}
              className="flex items-center gap-2 px-3 py-3 rounded-lg border transition-all"
              style={{
                height: '48px',
                borderColor: tempPrefs.board === 'tn' ? '#17528C' : '#C0C8D9',
                backgroundColor: tempPrefs.board === 'tn' ? '#EFF6FF' : 'white',
                borderWidth: tempPrefs.board === 'tn' ? '2px' : '1px'
              }}
            >
              <span style={{ fontSize: '18px' }}>📘</span>
              <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>TN State Board</span>
            </button>
            <button
              onClick={() => handleBoardSelect('cbse')}
              className="flex items-center gap-2 px-3 py-3 rounded-lg border transition-all"
              style={{
                height: '48px',
                borderColor: tempPrefs.board === 'cbse' ? '#17528C' : '#C0C8D9',
                backgroundColor: tempPrefs.board === 'cbse' ? '#EFF6FF' : 'white',
                borderWidth: tempPrefs.board === 'cbse' ? '2px' : '1px'
              }}
            >
              <span style={{ fontSize: '18px' }}>📗</span>
              <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>CBSE</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-3">
          <p className="text-xs mb-1" style={{ color: '#595959' }}>Select Language</p>
          <div className="grid grid-cols-3 gap-2">
            {(['ta', 'en', 'hi'] as const).map((lang) => {
              const disabled = isLanguageDisabled(lang)
              const isSelected = tempPrefs.lang === lang
              const label = lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English'
              
              return (
                <button
                  key={lang}
                  onClick={() => !disabled && handleLanguageSelect(lang)}
                  disabled={disabled}
                  className="flex flex-col items-center justify-center rounded-lg border transition-all"
                  style={{
                    height: '40px',
                    borderColor: isSelected ? '#17528C' : disabled ? '#E5E7EB' : '#C0C8D9',
                    backgroundColor: isSelected ? '#EFF6FF' : disabled ? '#F9FAFB' : 'white',
                    borderWidth: isSelected ? '2px' : '1px',
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: disabled ? '#9CA3AF' : '#1A1A1A' }}>
                    {label}
                  </span>
                  {disabled && getLanguageDisabledReason(lang) && (
                    <span className="text-[9px]" style={{ color: '#9CA3AF' }}>
                      {getLanguageDisabledReason(lang)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Class Pyramid */}
        <div className="mb-3">
          <p className="text-xs mb-1" style={{ color: '#595959' }}>Select Class</p>
          <div className="flex flex-col items-center gap-2">
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
                      className="rounded-lg border transition-all flex flex-col items-center justify-center"
                      style={{
                        width: '68px',
                        height: '68px',
                        borderColor: !hasClassContent ? '#E5E7EB' : canSelect ? '#C0C8D9' : '#E5E7EB',
                        backgroundColor: !hasClassContent ? '#F9FAFB' : canSelect ? 'white' : '#F9FAFB',
                        borderWidth: '1px',
                        cursor: canSelect ? 'pointer' : 'not-allowed',
                        opacity: canSelect ? 1 : 0.5
                      }}
                      title={!hasClassContent ? 'Coming soon' : !canSelect ? 'Select board and language first' : classData?.name}
                    >
                      <span style={{ fontSize: '20px' }}>{classData?.icon}</span>
                      <span className="text-xs font-medium mt-0.5" style={{ color: !hasClassContent ? '#9CA3AF' : canSelect ? '#1A1A1A' : '#9CA3AF' }}>
                        {classId}th
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Plans Strip */}
        <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#C0C8D9' }}>
          <div className="grid grid-cols-3 gap-2">
            <Link to="/plans" className="text-center p-2 rounded hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-0.5">📚</div>
              <h3 className="font-bold text-xs mb-0.5" style={{ color: '#1A1A1A' }}>FREE</h3>
              <p className="text-[10px]" style={{ color: '#595959' }}>PYQ + model + keys</p>
            </Link>
            <Link to="/plans" className="text-center p-2 rounded border-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#D4AF37' }}>
              <div className="text-lg mb-0.5">⭐</div>
              <h3 className="font-bold text-xs mb-0.5" style={{ color: '#1A1A1A' }}>PRO</h3>
              <p className="text-[10px]" style={{ color: '#595959' }}>Topper boxes</p>
            </Link>
            <a href="https://wa.me/918610653352" target="_blank" rel="noopener noreferrer" className="text-center p-2 rounded hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-0.5">🎓</div>
              <h3 className="font-bold text-xs mb-0.5" style={{ color: '#1A1A1A' }}>CENTUM</h3>
              <p className="text-[10px]" style={{ color: '#595959' }}>Soon</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
