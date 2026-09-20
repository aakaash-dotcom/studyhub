import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  name: string
  email: string
  phone: string
  class?: string
  board?: string
  avatar?: string
  joinedAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  class?: string
  board?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('studyhub_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const storedUsers = JSON.parse(localStorage.getItem('studyhub_users') || '[]')
    const found = storedUsers.find((u: any) => u.email === email && u.password === password)
    
    if (found) {
      const { password: _, ...userData } = found
      setUser(userData)
      localStorage.setItem('studyhub_user', JSON.stringify(userData))
      return true
    }
    
    // Demo login
    if (email === 'demo@studyhub.com' && password === 'demo123') {
      const demoUser: User = {
        name: 'Demo Student',
        email: 'demo@studyhub.com',
        phone: '9876543210',
        class: 'Class 12',
        board: 'CBSE',
        joinedAt: new Date().toISOString()
      }
      setUser(demoUser)
      localStorage.setItem('studyhub_user', JSON.stringify(demoUser))
      return true
    }
    
    return false
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const storedUsers = JSON.parse(localStorage.getItem('studyhub_users') || '[]')
    
    if (storedUsers.find((u: any) => u.email === data.email)) {
      return false
    }
    
    const newUser = {
      ...data,
      joinedAt: new Date().toISOString()
    }
    
    storedUsers.push(newUser)
    localStorage.setItem('studyhub_users', JSON.stringify(storedUsers))
    
    const { password: _, ...userData } = newUser
    setUser(userData)
    localStorage.setItem('studyhub_user', JSON.stringify(userData))
    
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('studyhub_user')
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem('studyhub_user', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
