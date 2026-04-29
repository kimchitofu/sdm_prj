export type UserRole = 'donee' | 'donor' | 'fund_raiser' | 'admin' | 'platform_manager' | string

export type UserProfile = {
  firstName?: string
  lastName?: string
  email?: string
  role?: UserRole
  [key: string]: any
}

export function getRedirectForRole(role?: UserRole) {
  switch ((role || '').toString()) {
    case 'fund_raiser':
      return '/dashboard/fund-raiser'
    case 'donee':
      return '/dashboard/donee'
    case 'donor':
      return '/dashboard/donor'
    case 'admin':
      return '/dashboard/admin/users'
    case 'platform_manager':
      return '/dashboard/platform'
    default:
      return '/dashboard'
  }
}

export default { getRedirectForRole }
