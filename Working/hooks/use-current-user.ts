import { useState, useEffect } from 'react'
import { getCurrentUser, type StoredUser } from '@/lib/utils'

export function useCurrentUser(fallback: StoredUser): StoredUser {
  const [user, setUser] = useState<StoredUser>(fallback)

  useEffect(() => {
    const stored = getCurrentUser()
    if (stored) {
      setUser({ ...fallback, ...stored })
    }
  // fallback is a module-level constant in every caller — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return user
}
