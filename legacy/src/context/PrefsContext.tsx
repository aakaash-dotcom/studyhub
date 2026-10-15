import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserPrefs {
  lang: 'ta' | 'en' | 'hi'
  board: 'tn' | 'cbse'
  classId: string
  medium: 'Tamil' | 'English' | 'Hindi'
}

interface PrefsContextType {
  prefs: UserPrefs | null
  setPrefs: (prefs: UserPrefs) => void
  clearPrefs: () => void
  showWizard: boolean
  setShowWizard: (show: boolean) => void
}

const PrefsContext = createContext<PrefsContextType | undefined>(undefined)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<UserPrefs | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ravi_prefs')
    if (stored) {
      setPrefsState(JSON.parse(stored))
    } else {
      setShowWizard(true)
    }
  }, [])

  const setPrefs = (newPrefs: UserPrefs) => {
    setPrefsState(newPrefs)
    localStorage.setItem('ravi_prefs', JSON.stringify(newPrefs))
    setShowWizard(false)
  }

  const clearPrefs = () => {
    setPrefsState(null)
    localStorage.removeItem('ravi_prefs')
    setShowWizard(true)
  }

  return (
    <PrefsContext.Provider value={{ prefs, setPrefs, clearPrefs, showWizard, setShowWizard }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs() {
  const context = useContext(PrefsContext)
  if (!context) throw new Error('usePrefs must be used within PrefsProvider')
  return context
}
