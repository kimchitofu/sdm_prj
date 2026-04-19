import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export type UserRole = 'donee' | 'fund_raiser' | 'admin' | 'platform' | string

export type UserProfile = {
  firstName?: string
  lastName?: string
  email?: string
  role?: UserRole
  [key: string]: any
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null
  try {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as UserProfile
  } catch (err) {
    // swallow here; caller can handle null
    return null
  }
}

export function getRedirectForRole(role?: UserRole) {
  switch ((role || '').toString()) {
    case 'fund_raiser':
      return '/dashboard/fund-raiser'
    case 'donee':
      return '/dashboard/donee'
    case 'admin':
      return '/dashboard/admin/users'
    case 'platform':
      return '/dashboard/platform'
    default:
      return '/dashboard'
  }
}

export default { getUserProfile, getRedirectForRole }
