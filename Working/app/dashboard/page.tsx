'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/session-provider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    async function resolveRole() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const data = userDoc.exists() ? userDoc.data() : null
        const role = (data?.role || 'donee').toString().toUpperCase()

        switch (role) {
          case 'ADMIN':
            router.push('/dashboard/admin/users')
            break
          case 'PLATFORM_MANAGER':
            router.push('/dashboard/platform')
            break
          case 'FUND_RAISER':
          case 'FUNDRAISER':
            router.push('/dashboard/fund-raiser')
            break
          case 'DONEE':
          default:
            router.push('/dashboard/donee')
            break
        }
      } catch (e) {
        // Fallback: don't redirect back to this same page (would cause loop)
        router.push('/auth/sign-in')
      }
    }

    void resolveRole()
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  )
}