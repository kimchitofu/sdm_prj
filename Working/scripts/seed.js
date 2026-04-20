/*
  Lightweight Firestore seed script for the Firebase emulator.
  - Intended to be run against the emulator only.
  - Requires firebase-admin package (install with `npm i firebase-admin`).

  Usage (from repo root):

  # start the emulator first (see instructions)
  # then run:
  FIRESTORE_EMULATOR_HOST=localhost:8081 FIREBASE_AUTH_EMULATOR_HOST=localhost:9098 node Working/scripts/seed.js

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

  // Users from mock data
  const users = [
    {
      id: 'user-1',
      email: 'fundraiser@example.com',
      displayName: 'Fundraiser Demo',
      firstName: 'Fundraiser',
      lastName: 'Demo',
      role: 'fund_raiser',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      bio: 'Passionate about making a difference in my community through fundraising.',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-2',
      email: 'donee@example.com',
      displayName: 'Donee Demo',
      firstName: 'Donee',
      lastName: 'Demo',
      role: 'donee',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Believer in the power of collective giving.',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-3',
      email: 'emily.davis@email.com',
      displayName: 'Emily Davis',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'fund_raiser',
      phone: '+1 (555) 345-6789',
      location: 'Chicago, IL',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Nonprofit organizer with 10 years of experience.',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-4',
      email: 'admin@fundbridge.com',
      displayName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      location: 'Remote',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-super-admin',
      email: 'admin@gmail.com',
      displayName: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'user_admin',
      location: 'Remote',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-5',
      email: 'platform@fundbridge.com',
      displayName: 'Platform Manager',
      firstName: 'Platform',
      lastName: 'Manager',
      role: 'platform_manager',
      location: 'Remote',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-6',
      email: 'james.wilson@email.com',
      displayName: 'James Wilson',
      firstName: 'James',
      lastName: 'Wilson',
      role: 'donee',
      phone: '+1 (555) 456-7890',
      location: 'Los Angeles, CA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      bio: 'Tech professional who loves supporting education initiatives.',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-7',
      email: 'lisa.martinez@email.com',
      displayName: 'Lisa Martinez',
      firstName: 'Lisa',
      lastName: 'Martinez',
      role: 'fund_raiser',
      phone: '+1 (555) 567-8901',
      location: 'Miami, FL',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      bio: 'Animal rescue volunteer and advocate.',
      isVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-8',
      email: 'david.brown@email.com',
      displayName: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      role: 'donee',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isVerified: false,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'user-9',
      email: 'suspended.user@email.com',
      displayName: 'Suspended User',
      firstName: 'Suspended',
      lastName: 'User',
      role: 'fund_raiser',
      location: 'Unknown',
      isVerified: false,
      status: 'suspended',
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
    organiser: { id: 'user-1', name: 'Sarah Chen' },
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
      userId: 'user-2',
      campaignId: 'camp-demo-1',
      amount: 500,
      message: 'Keep up the great work!',
      isAnonymous: false,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'donation-2',
      userId: 'user-2',
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
      userId: 'user-2',
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
