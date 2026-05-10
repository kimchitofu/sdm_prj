'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type SessionUser = {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
}

type AuthContextValue = {
  user: SessionUser | null
  loading: boolean
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, refresh: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
