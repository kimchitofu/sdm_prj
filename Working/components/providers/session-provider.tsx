'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, saveCurrentUser, type StoredUser } from '@/lib/utils'

type AuthContextValue = {
  user: StoredUser | null
  loading: boolean
  setUser: (user: StoredUser | null) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getCurrentUser()
    setUserState(stored)
    setLoading(false)
  }, [])

  const setUser = (u: StoredUser | null) => {
    if (u) {
      saveCurrentUser(u)
    } else {
      try {
        localStorage.removeItem('currentUser')
      } catch {}
    }
    setUserState(u)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
