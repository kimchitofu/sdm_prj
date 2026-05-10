import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'fundbridge-dev-secret-change-in-production'
export const COOKIE_NAME = 'auth-token'

export type SessionUser = {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  iat?: number
  exp?: number
}

function b64url(str: string): string {
  return Buffer.from(str).toString('base64url')
}

function decode64url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8')
}

export function signToken(payload: Omit<SessionUser, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const full = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 }
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(full))
  const sig = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
    if (sig !== expected) return null
    const payload = JSON.parse(decode64url(body)) as SessionUser
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
