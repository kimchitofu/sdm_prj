export type UserRole = 'donee' | 'fund_raiser' | 'admin' | 'platform_manager' | 'campaign_admin' | 'donor' | string

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
    case 'donor':
      return '/dashboard/donee'
    case 'admin':
      return '/dashboard/admin/users'

    case 'campaign_admin':
      return '/dashboard/admin/campaign-dashboard'
    case 'platform_manager':
      return '/dashboard/platform'
    default:
      return '/dashboard'
  }
}

export default { getRedirectForRole }
