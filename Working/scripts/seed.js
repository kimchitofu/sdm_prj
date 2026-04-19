/*
  Lightweight Firestore seed script for the Firebase emulator.
  - Intended to be run against the emulator only.
  - Requires firebase-admin package (install with `npm i firebase-admin`).

  Usage (from repo root):

  # start the emulator first (see instructions)
  # then run:
  FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 node Working/scripts/seed.js

  This script will create a small set of users, categories and one sample campaign.
*/

const admin = require('firebase-admin')

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-csit314'

// When running against the emulator no credentials are required.
admin.initializeApp({ projectId })

const db = admin.firestore()
const auth = admin.auth()

async function seed() {
  console.log('Seeding Firestore emulator...')

  // Users
  const users = [
    {
      id: 'user-demo-donee',
      email: 'donee@example.com',
      displayName: 'Demo Donee',
      firstName: 'Demo',
      lastName: 'Donee',
      role: 'donee',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-demo-fundraiser',
      email: 'fundraiser@example.com',
      displayName: 'Demo Fundraiser',
      firstName: 'Demo',
      lastName: 'Fundraiser',
      role: 'fund_raiser',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-demo-admin',
      email: 'admin@example.com',
      displayName: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ]

  for (const u of users) {
    await db.collection('users').doc(u.id).set(u)
    console.log('Wrote user', u.id)

    // Create Auth user
    try {
      await auth.createUser({
        uid: u.id,
        email: u.email,
        password: 'demo123',
        displayName: u.displayName,
      })
      console.log('Created auth user', u.id)
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        console.log('Auth user already exists', u.id)
      } else {
        console.error('Error creating auth user', u.id, error)
      }
    }
  }

  // Categories
  const categories = [
    { id: 'cat-1', name: 'Medical & Health', description: 'Medical and health related causes', color: '#ef4444', isActive: true, createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { id: 'cat-2', name: 'Education', description: 'Scholarships and education', color: '#3b82f6', isActive: true, createdAt: admin.firestore.FieldValue.serverTimestamp() },
  ]

  for (const c of categories) {
    await db.collection('categories').doc(c.id).set(c)
    console.log('Wrote category', c.id)
  }

  // Sample campaign
  const campaign = {
    id: 'camp-demo-1',
    title: 'Sample Campaign',
    summary: 'A sample campaign created by the seed script',
    description: 'This is a demo campaign',
    category: 'Medical & Health',
    serviceType: 'medical',
    status: 'active',
    targetAmount: 10000,
    raisedAmount: 2500,
    donorCount: 12,
    views: 120,
    favouriteCount: 5,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    organiser: { id: 'user-demo-2', name: 'Fundraiser Demo' },
    beneficiary: { name: 'Beneficiary' },
    coverImage: '',
    gallery: [],
    updates: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await db.collection('campaigns').doc(campaign.id).set(campaign)
  console.log('Wrote campaign', campaign.id)

  // Donations
  const donations = [
    {
      id: 'donation-1',
      userId: 'user-demo-donee',
      campaignId: 'camp-demo-1',
      amount: 500,
      message: 'Keep up the great work!',
      isAnonymous: false,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'donation-2',
      userId: 'user-demo-donee',
      campaignId: 'camp-demo-1',
      amount: 1000,
      message: 'Happy to help',
      isAnonymous: false,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ]

  for (const d of donations) {
    await db.collection('donations').doc(d.id).set(d)
    console.log('Wrote donation', d.id)
  }

  // Favourites
  const favourites = [
    {
      id: 'fav-1',
      userId: 'user-demo-donee',
      campaignId: 'camp-demo-1',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ]

  for (const f of favourites) {
    await db.collection('favourites').doc(f.id).set(f)
    console.log('Wrote favourite', f.id)
  }

  console.log('Seeding complete.')
}

seed().catch((err) => {
  console.error('Seed failed', err)
  process.exit(1)
})
