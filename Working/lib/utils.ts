import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface StoredUser {
  id?: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  role?: string
  avatar?: string
  isVerified?: boolean
  status?: string
  createdAt?: string
}

export function getCurrentUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('currentUser')
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

export function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('registeredUsers')
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

export function saveCurrentUser(user: StoredUser): void {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } catch {
    // ignore storage errors
  }
}

export function saveRegisteredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem('registeredUsers', JSON.stringify(users))
  } catch {
    // ignore storage errors
  }
}
