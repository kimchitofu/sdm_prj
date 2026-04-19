import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
// Use local persistence by default for web
void setPersistence(auth, browserLocalPersistence)

export const db = getFirestore(app)

// If running locally against the Firebase emulators, enable connections when the
// NEXT_PUBLIC_USE_FIREBASE_EMULATOR env var is set to "true". This is a client-side
// flag so it will be inlined at build time for the browser bundle.
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Firestore emulator (default host: 127.0.0.1, port: 8080)
    const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1'
    const firestorePort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080')
    connectFirestoreEmulator(db, firestoreHost, firestorePort)

    // Auth emulator (only on client side)
    if (typeof window !== 'undefined') {
      const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099'
      connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true })
    }
  } catch (e) {
    // swallow — emulator not required in production
    // console.warn('Failed to connect to Firebase emulators', e)
  }
}

export async function createTestUser(email: string = 'admin@example.com', password: string = 'demo123') {
  const { createUserWithEmailAndPassword } = await import('firebase/auth')
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    console.log('Created user:', cred.user.uid)
    return cred.user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export default app
