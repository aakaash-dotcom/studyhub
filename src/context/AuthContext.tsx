import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Progressive profiling stages
export type ProfileStage = 'phone' | 'name_class' | 'school_medium' | 'district_intent' | 'complete'

export interface ConsentRecord {
  purpose: string
  granted: boolean
  timestamp: number
  source: string
}

export interface UserProfile {
  phone: string
  name?: string
  class?: string
  school?: string
  medium?: string
  district?: string
  after12thIntent?: string
  profileStage: ProfileStage
  consents: ConsentRecord[]
  createdAt: number
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  profileStage: ProfileStage
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>
  verifyOtp: (phone: string, otp: string) => Promise<boolean>
  updateProfile: (data: Partial<UserProfile>) => void
  addConsent: (consent: Omit<ConsentRecord, 'timestamp'>) => void
  logout: () => void
  exportUserData: () => string
  deleteUserData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulated OTP store (in production, this is Supabase Auth)
const OTP_STORE_KEY = 'rt_otp_store'

function storeOtp(phone: string, otp: string) {
  const store = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}')
  store[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 } // 5 min
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store))
}

function verifyStoredOtp(phone: string, otp: string): boolean {
  const store = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}')
  const entry = store[phone]
  if (!entry) return false
  if (Date.now() > entry.expires) return false
  return entry.otp === otp
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('rt_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  // Step 1: Send OTP to phone
  const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    if (!/^\d{10}$/.test(phone)) {
      return { success: false, message: 'Please enter a valid 10-digit phone number' }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    storeOtp(phone, otp)

    // In production: Supabase auth.signInWithOtp({ phone })
    // For demo: show OTP in console/alert
    console.log(`[DEMO] OTP for ${phone}: ${otp}`)

    return {
      success: true,
      message: `OTP sent to ${phone}. For demo, OTP is: ${otp}`
    }
  }

  // Step 2: Verify OTP and create/load user
  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const valid = verifyStoredOtp(phone, otp)
    if (!valid) return false

    // Load existing user or create new
    const stored = localStorage.getItem('rt_user')
    let profile: UserProfile

    if (stored) {
      profile = JSON.parse(stored)
      profile.phone = phone
    } else {
      profile = {
        phone,
        profileStage: 'name_class',
        consents: [{
          purpose: 'otp_authentication',
          granted: true,
          timestamp: Date.now(),
          source: 'login_flow'
        }],
        createdAt: Date.now()
      }
    }

    setUser(profile)
    localStorage.setItem('rt_user', JSON.stringify(profile))
    localStorage.setItem('rt_user_id', phone)

    return true
  }

  // Progressive profiling update
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return

    const updated = { ...user, ...data }

    // Advance profile stage based on what's filled
    if (updated.name && updated.class) {
      updated.profileStage = 'school_medium'
    }
    if (updated.school && updated.medium) {
      updated.profileStage = 'district_intent'
    }
    if (updated.district) {
      updated.profileStage = 'complete'
    }

    setUser(updated)
    localStorage.setItem('rt_user', JSON.stringify(updated))
  }

  // DPDP consent management
  const addConsent = (consent: Omit<ConsentRecord, 'timestamp'>) => {
    if (!user) return
    const updated = {
      ...user,
      consents: [...user.consents, { ...consent, timestamp: Date.now() }]
    }
    setUser(updated)
    localStorage.setItem('rt_user', JSON.stringify(updated))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_user_id')
  }

  // DPDP: Export user data
  const exportUserData = (): string => {
    if (!user) return '{}'
    return JSON.stringify(user, null, 2)
  }

  // DPDP: Delete user data
  const deleteUserData = () => {
    localStorage.removeItem('rt_user')
    localStorage.removeItem('rt_user_id')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      profileStage: user?.profileStage || 'phone',
      sendOtp,
      verifyOtp,
      updateProfile,
      addConsent,
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
