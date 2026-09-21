import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ConsentRecord {
  purpose: string
  granted: boolean
  timestamp: number
  source: string
}

export interface UserProfile {
  name: string
  phone: string
  class: string
  district: string
  whatsappConsent: boolean
  consents: ConsentRecord[]
  createdAt: number
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (data: { name: string; phone: string; class: string; district: string; whatsappConsent: boolean }) => void
  logout: () => void
  exportUserData: () => string
  deleteUserData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('rt_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = (data: { name: string; phone: string; class: string; district: string; whatsappConsent: boolean }) => {
    const profile: UserProfile = {
      name: data.name,
      phone: data.phone,
      class: data.class,
      district: data.district,
      whatsappConsent: data.whatsappConsent,
      consents: [
        {
          purpose: 'whatsapp_contact',
          granted: data.whatsappConsent,
          timestamp: Date.now(),
          source: 'login_form'
        }
      ],
      createdAt: Date.now()
    }

    setUser(profile)
    localStorage.setItem('rt_user', JSON.stringify(profile))
    localStorage.setItem('rt_user_phone', data.phone)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_user_phone')
  }

  const exportUserData = (): string => {
    if (!user) return '{}'
    return JSON.stringify(user, null, 2)
  }

  const deleteUserData = () => {
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_user_phone')
    localStorage.removeItem('rt_download_events')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      exportUserData,
      deleteUserData,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
