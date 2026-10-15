import { useState } from 'react'
import { usePrefs, UserPrefs } from '../context/PrefsContext'
import { CLASSES } from '../data/catalogue'

export default function FirstOpenWizard() {
  const { setPrefs } = usePrefs()
  const [step, setStep] = useState(1)
  const [prefs, setLocalPrefs] = useState<Partial<UserPrefs>>({
    lang: 'en',
    board: 'tn',
    classId: '',
    medium: 'English'
  })

  const handleNext = () => {
    if (step === 1) {
      setLocalPrefs({ ...prefs, medium: prefs.lang === 'ta' ? 'Tamil' : 'English' })
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setPrefs(prefs as UserPrefs)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F8FC' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        {/* Step 1: Language */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1A1A1A' }}>
              {prefs.lang === 'ta' ? 'மொழியைத் தேர்ந்தெடுக்கவும்' : 'Select Language'}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setLocalPrefs({ ...prefs, lang: 'ta', medium: 'Tamil' })}
                className="w-full p-4 rounded-xl border-2 text-left font-medium transition-all"
                style={{
                  borderColor: prefs.lang === 'ta' ? '#17528C' : '#C0C8D9',
                  backgroundColor: prefs.lang === 'ta' ? '#EFF6FF' : 'white',
                  color: '#1A1A1A'
                }}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLocalPrefs({ ...prefs, lang: 'en', medium: 'English' })}
                className="w-full p-4 rounded-xl border-2 text-left font-medium transition-all"
                style={{
                  borderColor: prefs.lang === 'en' ? '#17528C' : '#C0C8D9',
                  backgroundColor: prefs.lang === 'en' ? '#EFF6FF' : 'white',
                  color: '#1A1A1A'
                }}
              >
                English
              </button>
            </div>
          </>
        )}

        {/* Step 2: Board */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1A1A1A' }}>
              {prefs.lang === 'ta' ? 'பலகையைத் தேர்ந்தெடுக்கவும்' : 'Select Board'}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setLocalPrefs({ ...prefs, board: 'tn' })}
                className="w-full p-4 rounded-xl border-2 text-left font-medium transition-all"
                style={{
                  borderColor: prefs.board === 'tn' ? '#17528C' : '#C0C8D9',
                  backgroundColor: prefs.board === 'tn' ? '#EFF6FF' : 'white',
                  color: '#1A1A1A'
                }}
              >
                {prefs.lang === 'ta' ? 'தமிழ்நாடு மாநில வாரியம்' : 'TN State Board'}
              </button>
              <button
                disabled
                className="w-full p-4 rounded-xl border-2 text-left font-medium opacity-50 cursor-not-allowed"
                style={{
                  borderColor: '#C0C8D9',
                  backgroundColor: '#F5F8FC',
                  color: '#595959'
                }}
              >
                CBSE {prefs.lang === 'ta' ? '(விரைவில்)' : '(Coming soon)'}
              </button>
            </div>
            <p className="text-xs text-center mt-4" style={{ color: '#595959' }}>
              {prefs.lang === 'ta' 
                ? 'CBSEக்காக WhatsApp 8610653352' 
                : 'For CBSE, WhatsApp 8610653352'}
            </p>
          </>
        )}

        {/* Step 3: Class */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1A1A1A' }}>
              {prefs.lang === 'ta' ? 'வகுப்பைத் தேர்ந்தெடுக்கவும்' : 'Select Class'}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((classNum) => {
                const classId = classNum.toString()
                const isEnabled = ['8', '9', '10', '11', '12'].includes(classId)
                const isSelected = prefs.classId === classId
                
                return (
                  <button
                    key={classId}
                    onClick={() => isEnabled && setLocalPrefs({ ...prefs, classId })}
                    disabled={!isEnabled}
                    className="p-3 rounded-xl border-2 text-center font-medium transition-all"
                    style={{
                      borderColor: isSelected ? '#17528C' : isEnabled ? '#C0C8D9' : '#E5E7EB',
                      backgroundColor: isSelected ? '#EFF6FF' : isEnabled ? 'white' : '#F5F8FC',
                      color: isSelected ? '#17528C' : isEnabled ? '#1A1A1A' : '#9CA3AF',
                      cursor: isEnabled ? 'pointer' : 'not-allowed',
                      opacity: isEnabled ? 1 : 0.5
                    }}
                  >
                    {classNum}
                    {!isEnabled && (
                      <div className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                        {prefs.lang === 'ta' ? 'விரைவில்' : 'Coming soon'}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border-2 font-medium"
              style={{ borderColor: '#C0C8D9', color: '#595959' }}
            >
              {prefs.lang === 'ta' ? 'பின்' : 'Back'}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !prefs.lang) ||
              (step === 2 && !prefs.board) ||
              (step === 3 && !prefs.classId)
            }
            className="flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#17528C' }}
          >
            {step === 3 
              ? (prefs.lang === 'ta' ? 'தொடங்கு' : 'Start')
              : (prefs.lang === 'ta' ? 'தொடர்' : 'Continue')
            }
          </button>
        </div>
      </div>
    </div>
  )
}
