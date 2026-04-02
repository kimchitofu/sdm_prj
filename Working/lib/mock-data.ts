import type {
  User,
  Campaign,
  Category,
  Donation,
  Favourite,
  Notification,
  CampaignAnalytics,
  DailyStats,
  PlatformStats,
  ReportSummary,
} from './types'


export const serviceTypes = [
  "Medical",
  "Education",
  "Emergency Relief",
  "Community Support",
  "Animal Welfare",
  "Disaster Recovery",
  "Memorial",
  "Sports",
  "Arts & Culture",
  "Environment",
  "Others"
]

// Categories
export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Medical & Health',
    description: 'Medical treatments, surgeries, and health-related expenses',
    icon: 'Heart',
    color: '#ef4444',
    campaignCount: 156,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Education',
    description: 'Scholarships, tuition fees, and educational resources',
    icon: 'GraduationCap',
    color: '#3b82f6',
    campaignCount: 89,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Emergency Relief',
    description: 'Urgent assistance for disasters and emergencies',
    icon: 'AlertTriangle',
    color: '#f59e0b',
    campaignCount: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Community Projects',
    description: 'Local community initiatives and improvements',
    icon: 'Users',
    color: '#10b981',
    campaignCount: 78,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Environment',
    description: 'Environmental conservation and sustainability',
    icon: 'Leaf',
    color: '#22c55e',
    campaignCount: 34,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Animals',
    description: 'Animal rescue, shelters, and welfare',
    icon: 'PawPrint',
    color: '#8b5cf6',
    campaignCount: 67,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-7',
    name: 'Creative Arts',
    description: 'Art projects, music, film, and creative endeavors',
    icon: 'Palette',
    color: '#ec4899',
    campaignCount: 42,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-8',
    name: 'Sports & Recreation',
    description: 'Sports teams, equipment, and recreational facilities',
    icon: 'Trophy',
    color: '#06b6d4',
    campaignCount: 28,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// Users
export const users: User[] = [
  {
    id: 'user-1',
    email: 'sarah.chen@email.com',
    displayName: 'Sarah Chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'fund_raiser',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'Passionate about making a difference in my community through fundraising.',
    isVerified: true,
    status: 'active',
    createdAt: '2024-03-15T10:00:00Z',
    lastLoginAt: '2026-04-01T14:30:00Z',
  },
  {
    id: 'user-2',
    email: 'michael.johnson@email.com',
    displayName: 'Michael Johnson',
    firstName: 'Michael',
    lastName: 'Johnson',
    role: 'donee',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Believer in the power of collective giving.',
    isVerified: true,
    status: 'active',
    createdAt: '2024-06-20T08:00:00Z',
    lastLoginAt: '2026-04-02T09:15:00Z',
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
    createdAt: '2024-02-10T12:00:00Z',
    lastLoginAt: '2026-04-01T16:45:00Z',
  },
  {
    id: 'user-4',
    email: 'admin@fundbridge.com',
    displayName: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'user_admin',
    location: 'Remote',
    isVerified: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'user-5',
    email: 'platform@fundbridge.com',
    displayName: 'Platform Manager',
    firstName: 'Platform',
    lastName: 'Manager',
    role: 'platform_management',
    location: 'Remote',
    isVerified: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2026-04-02T11:00:00Z',
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
    createdAt: '2024-08-05T14:00:00Z',
    lastLoginAt: '2026-04-01T20:30:00Z',
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
    createdAt: '2024-04-12T09:00:00Z',
    lastLoginAt: '2026-04-02T08:00:00Z',
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
    createdAt: '2025-01-20T11:00:00Z',
    lastLoginAt: '2026-03-28T15:00:00Z',
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
    createdAt: '2024-11-10T10:00:00Z',
    lastLoginAt: '2025-12-15T12:00:00Z',
  },
]

// Campaigns
export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Help Maya Get Her Life-Saving Surgery',
    summary: 'Maya needs urgent heart surgery that her family cannot afford. Every donation brings her closer to a healthy future.',
    description: `Maya Chen is a bright 8-year-old girl who loves drawing butterflies and dreams of becoming a veterinarian. Last month, she was diagnosed with a congenital heart defect that requires immediate surgical intervention.

The surgery she needs costs $75,000, which is far beyond what her family can afford. Her parents, both teachers, have exhausted their savings on initial treatments and diagnostic tests.

Without this surgery, Maya's condition will worsen, affecting her quality of life and potentially becoming life-threatening. The surgical team at Children's Hospital has confirmed that with timely intervention, Maya has an excellent prognosis for a full recovery.

Your donation will help cover:
- Surgical procedure costs
- Hospital stay and post-operative care
- Rehabilitation and follow-up appointments
- Medications and medical supplies

Every contribution, no matter the size, brings Maya one step closer to the healthy childhood she deserves. Thank you for being part of her journey to recovery.`,
    category: 'Medical & Health',
    serviceType: 'medical',
    status: 'active',
    targetAmount: 75000,
    raisedAmount: 52340,
    donorCount: 423,
    views: 8542,
    favouriteCount: 312,
    startDate: '2026-02-15T00:00:00Z',
    endDate: '2026-05-15T00:00:00Z',
    organiser: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 5,
      totalRaised: 125000,
    },
    beneficiary: {
      name: 'Maya Chen',
      relationship: 'Daughter',
      description: '8-year-old girl needing heart surgery',
    },
    coverImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    ],
    updates: [
      {
        id: 'update-1',
        campaignId: 'camp-1',
        title: 'Surgery Date Confirmed!',
        content: 'Great news! The hospital has confirmed Maya\'s surgery date for April 20th. Thank you all for your incredible support!',
        createdAt: '2026-03-28T10:00:00Z',
      },
      {
        id: 'update-2',
        campaignId: 'camp-1',
        title: 'Halfway There!',
        content: 'We\'ve reached 50% of our goal! Maya and her family are overwhelmed with gratitude.',
        createdAt: '2026-03-15T14:00:00Z',
      },
    ],
    createdAt: '2026-02-14T08:00:00Z',
    location: 'San Francisco, CA',
    tags: ['medical', 'children', 'surgery', 'urgent'],
  },
  {
    id: 'camp-2',
    title: 'Rebuild Riverside Community Center After Fire',
    summary: 'Our beloved community center was destroyed by fire. Help us rebuild this vital hub for families and youth programs.',
    description: `The Riverside Community Center has been the heart of our neighborhood for over 40 years. Last month, a devastating fire destroyed the building, leaving hundreds of families without access to essential programs.

The center provided:
- After-school tutoring for 200+ children
- Senior citizen activities and meals
- Youth basketball leagues
- Job training workshops
- Community meeting space

We need your help to rebuild and make the new center even better. The reconstruction will include modern facilities, improved accessibility, and expanded program space.

Join us in restoring this cornerstone of our community. Together, we can rise from the ashes and create an even brighter future for Riverside.`,
    category: 'Community Projects',
    serviceType: 'community',
    status: 'active',
    targetAmount: 250000,
    raisedAmount: 178500,
    donorCount: 892,
    views: 12340,
    favouriteCount: 567,
    startDate: '2026-01-10T00:00:00Z',
    endDate: '2026-07-10T00:00:00Z',
    organiser: {
      id: 'user-3',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 12,
      totalRaised: 450000,
    },
    beneficiary: {
      name: 'Riverside Community',
      description: 'Local families and youth',
    },
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop',
    gallery: [],
    updates: [
      {
        id: 'update-3',
        campaignId: 'camp-2',
        title: 'Construction Begins Next Month',
        content: 'Thanks to your generosity, we can begin construction in April! The new center will be better than ever.',
        createdAt: '2026-03-20T09:00:00Z',
      },
    ],
    createdAt: '2026-01-09T12:00:00Z',
    location: 'Chicago, IL',
    tags: ['community', 'rebuild', 'youth'],
  },
  {
    id: 'camp-3',
    title: 'Scholarships for Underprivileged STEM Students',
    summary: 'Help bright students from low-income families pursue their dreams in science and technology.',
    description: `Education is the key to breaking the cycle of poverty. Our STEM scholarship program identifies talented students from underprivileged backgrounds and provides them with the resources they need to succeed.

Each $5,000 scholarship covers:
- Tuition and fees
- Books and supplies
- Laptop or tablet
- Mentorship program access
- Internship placement support

Last year, 15 of our scholarship recipients graduated with honors, and 12 secured positions at leading tech companies. Your donation directly impacts these young minds and helps build a more diverse, equitable tech industry.`,
    category: 'Education',
    serviceType: 'education',
    status: 'active',
    targetAmount: 100000,
    raisedAmount: 67800,
    donorCount: 234,
    views: 5621,
    favouriteCount: 189,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-09-01T00:00:00Z',
    organiser: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 5,
      totalRaised: 125000,
    },
    beneficiary: {
      name: 'STEM Scholars Program',
      description: '20 students per year',
    },
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-02-28T10:00:00Z',
    location: 'National',
    tags: ['education', 'stem', 'scholarships', 'students'],
  },
  {
    id: 'camp-4',
    title: 'Save the Ocean Ridge Wildlife Sanctuary',
    summary: 'Our sanctuary cares for injured wildlife but faces closure due to funding cuts. Help us keep our doors open.',
    description: `Ocean Ridge Wildlife Sanctuary has rescued and rehabilitated over 3,000 animals in the past decade. From injured sea birds to orphaned deer, we provide medical care and safe haven for wildlife in need.

Recent government funding cuts threaten to close our doors forever. We need community support to continue our vital work.

Your donation helps provide:
- Medical supplies and veterinary care
- Food for 200+ animals in our care
- Habitat maintenance and improvements
- Educational programs for local schools
- Staff salaries for trained animal care specialists

Without your help, hundreds of animals will have nowhere to go. Please join us in protecting our local wildlife.`,
    category: 'Animals',
    serviceType: 'animals',
    status: 'active',
    targetAmount: 85000,
    raisedAmount: 41200,
    donorCount: 567,
    views: 7823,
    favouriteCount: 423,
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-06-01T00:00:00Z',
    organiser: {
      id: 'user-7',
      name: 'Lisa Martinez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 8,
      totalRaised: 95000,
    },
    beneficiary: {
      name: 'Ocean Ridge Wildlife Sanctuary',
      description: 'Non-profit wildlife rescue organization',
    },
    coverImage: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-01-30T08:00:00Z',
    location: 'Miami, FL',
    tags: ['animals', 'wildlife', 'sanctuary', 'conservation'],
  },
  {
    id: 'camp-5',
    title: 'Emergency Food Relief for Flood Victims',
    summary: 'Families displaced by severe flooding need immediate food assistance. Your donation provides meals for those in crisis.',
    description: `Severe flooding has devastated communities across the region, leaving thousands of families without homes, food, or clean water. Our emergency response team is on the ground providing immediate relief.

Each $25 donation provides:
- 3 days of meals for a family of four
- Clean drinking water
- Essential hygiene supplies

We've already distributed 10,000 meals but the need continues to grow. With your support, we can expand our reach and help more families survive this crisis.`,
    category: 'Emergency Relief',
    serviceType: 'emergency',
    status: 'active',
    targetAmount: 50000,
    raisedAmount: 48750,
    donorCount: 1234,
    views: 15678,
    favouriteCount: 234,
    startDate: '2026-03-20T00:00:00Z',
    endDate: '2026-04-20T00:00:00Z',
    organiser: {
      id: 'user-3',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 12,
      totalRaised: 450000,
    },
    beneficiary: {
      name: 'Regional Flood Victims',
      description: 'Displaced families needing food assistance',
    },
    coverImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=400&fit=crop',
    gallery: [],
    updates: [
      {
        id: 'update-4',
        campaignId: 'camp-5',
        title: '10,000 Meals Distributed!',
        content: 'Thanks to your incredible generosity, we\'ve provided 10,000 meals to families in need. The response has been overwhelming.',
        createdAt: '2026-03-28T16:00:00Z',
      },
    ],
    createdAt: '2026-03-19T14:00:00Z',
    location: 'Regional',
    tags: ['emergency', 'food', 'flood', 'relief'],
  },
  {
    id: 'camp-6',
    title: 'Youth Soccer League Equipment Fund',
    summary: 'Help our inner-city youth soccer league get proper equipment so every kid can play safely.',
    description: `The Eastside Youth Soccer League provides a safe, positive environment for over 300 kids from underserved neighborhoods. Many of our players come from families who cannot afford proper equipment.

We need funding for:
- 50 sets of shin guards and cleats
- 30 soccer balls
- Goal nets and field equipment
- Team jerseys for 15 teams
- First aid supplies

Soccer teaches our kids teamwork, discipline, and gives them a healthy outlet. Help us ensure every child has the gear they need to participate fully.`,
    category: 'Sports & Recreation',
    serviceType: 'sports',
    status: 'active',
    targetAmount: 15000,
    raisedAmount: 8900,
    donorCount: 156,
    views: 2341,
    favouriteCount: 87,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-05-01T00:00:00Z',
    organiser: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 5,
      totalRaised: 125000,
    },
    beneficiary: {
      name: 'Eastside Youth Soccer League',
      description: 'Youth sports organization',
    },
    coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-02-28T09:00:00Z',
    location: 'San Francisco, CA',
    tags: ['sports', 'youth', 'soccer', 'equipment'],
  },
  {
    id: 'camp-7',
    title: 'Community Garden Revitalization Project',
    summary: 'Transform an abandoned lot into a thriving community garden providing fresh produce for local families.',
    description: `The vacant lot on Oak Street has been an eyesore for years. We're turning it into a vibrant community garden that will provide fresh vegetables, herbs, and flowers for our neighborhood.

The garden will feature:
- 40 individual plots for families
- Shared herb and flower gardens
- Composting station
- Tool shed and water access
- Accessible raised beds for seniors and disabled gardeners
- Children's learning garden

This project brings neighbors together, provides healthy food options in our food desert, and beautifies our community.`,
    category: 'Environment',
    serviceType: 'environment',
    status: 'active',
    targetAmount: 25000,
    raisedAmount: 18750,
    donorCount: 234,
    views: 3456,
    favouriteCount: 156,
    startDate: '2026-02-15T00:00:00Z',
    endDate: '2026-05-15T00:00:00Z',
    organiser: {
      id: 'user-7',
      name: 'Lisa Martinez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 8,
      totalRaised: 95000,
    },
    beneficiary: {
      name: 'Oak Street Neighborhood',
      description: 'Local community members',
    },
    coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-02-14T11:00:00Z',
    location: 'Los Angeles, CA',
    tags: ['environment', 'garden', 'community', 'sustainability'],
  },
  {
    id: 'camp-8',
    title: 'Independent Film: Stories of Resilience',
    summary: 'Help us complete our documentary showcasing incredible stories of community resilience and hope.',
    description: `"Stories of Resilience" is a documentary film that follows five ordinary people who have overcome extraordinary challenges. From a refugee who became a successful entrepreneur to a cancer survivor who now runs marathons, these stories inspire and uplift.

We've completed filming and need funding for:
- Post-production editing
- Music licensing
- Color grading
- Sound mixing
- Festival submission fees
- Marketing materials

This film has the potential to reach millions and spread a message of hope. Help us share these powerful stories with the world.`,
    category: 'Creative Arts',
    serviceType: 'creative',
    status: 'active',
    targetAmount: 35000,
    raisedAmount: 21500,
    donorCount: 189,
    views: 4521,
    favouriteCount: 234,
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-04-20T00:00:00Z',
    organiser: {
      id: 'user-3',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 12,
      totalRaised: 450000,
    },
    beneficiary: {
      name: 'Resilience Films LLC',
      description: 'Independent documentary production',
    },
    coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-01-19T10:00:00Z',
    location: 'New York, NY',
    tags: ['film', 'documentary', 'creative', 'stories'],
  },
  {
    id: 'camp-9',
    title: 'Memorial Fund for Officer James Patterson',
    summary: 'Supporting the family of Officer Patterson who gave his life protecting our community.',
    description: `Officer James Patterson served our community with honor and dedication for 15 years. He was tragically killed in the line of duty on February 10th, leaving behind his wife Maria and three children.

This fund will support:
- Mortgage payments for the family home
- Education fund for the three children
- Daily living expenses during this difficult transition
- Counseling and support services

Officer Patterson touched countless lives through his service. Let's come together to support the family he loved so dearly.`,
    category: 'Community Projects',
    serviceType: 'memorial',
    status: 'completed',
    targetAmount: 150000,
    raisedAmount: 187500,
    donorCount: 2341,
    views: 25678,
    favouriteCount: 876,
    startDate: '2026-02-12T00:00:00Z',
    endDate: '2026-03-12T00:00:00Z',
    organiser: {
      id: 'user-3',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 12,
      totalRaised: 450000,
    },
    beneficiary: {
      name: 'Patterson Family',
      description: 'Maria Patterson and children',
    },
    coverImage: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop',
    gallery: [],
    updates: [
      {
        id: 'update-5',
        campaignId: 'camp-9',
        title: 'Goal Exceeded - Thank You!',
        content: 'The community\'s response has been overwhelming. We\'ve exceeded our goal, ensuring the Patterson family is well supported.',
        createdAt: '2026-03-10T12:00:00Z',
      },
    ],
    createdAt: '2026-02-11T20:00:00Z',
    completedAt: '2026-03-12T00:00:00Z',
    location: 'Chicago, IL',
    tags: ['memorial', 'family', 'community', 'support'],
  },
  {
    id: 'camp-10',
    title: 'Rural Clinic Medical Equipment Drive',
    summary: 'Our rural clinic serves 5,000 patients but desperately needs updated medical equipment.',
    description: `Valley Health Clinic is the only medical facility within 50 miles for our rural community. We serve over 5,000 patients annually but are operating with outdated equipment that limits our ability to provide quality care.

We urgently need:
- New ultrasound machine ($45,000)
- Digital X-ray system ($35,000)
- Patient monitoring equipment ($15,000)
- Sterilization equipment ($5,000)

With modern equipment, we can diagnose conditions earlier, reduce patient transfers to distant hospitals, and provide better care for our community.`,
    category: 'Medical & Health',
    serviceType: 'medical',
    status: 'active',
    targetAmount: 100000,
    raisedAmount: 34200,
    donorCount: 287,
    views: 4123,
    favouriteCount: 198,
    startDate: '2026-03-05T00:00:00Z',
    endDate: '2026-08-05T00:00:00Z',
    organiser: {
      id: 'user-7',
      name: 'Lisa Martinez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 8,
      totalRaised: 95000,
    },
    beneficiary: {
      name: 'Valley Health Clinic',
      description: 'Non-profit rural medical facility',
    },
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-03-04T14:00:00Z',
    location: 'Rural Montana',
    tags: ['medical', 'equipment', 'clinic', 'rural'],
  },
  {
    id: 'camp-11',
    title: 'School Library Renovation Project',
    summary: 'Help us transform an outdated school library into a modern learning hub for 800 students.',
    description: `Lincoln Elementary School's library hasn't been updated since 1985. Our 800 students deserve a modern, inspiring space to develop their love of reading.

The renovation will include:
- New bookshelves and 5,000 new books
- Computer stations with internet access
- Comfortable reading nooks
- Updated lighting and paint
- Maker space for STEM activities
- Accessible design for all students

A great library can spark a lifelong love of learning. Help us give our students the resources they need to succeed.`,
    category: 'Education',
    serviceType: 'education',
    status: 'draft',
    targetAmount: 45000,
    raisedAmount: 0,
    donorCount: 0,
    views: 0,
    favouriteCount: 0,
    startDate: '2026-04-15T00:00:00Z',
    endDate: '2026-08-15T00:00:00Z',
    organiser: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 5,
      totalRaised: 125000,
    },
    beneficiary: {
      name: 'Lincoln Elementary School',
      description: 'Public elementary school',
    },
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2026-04-01T09:00:00Z',
    location: 'San Francisco, CA',
    tags: ['education', 'library', 'school', 'children'],
  },
  {
    id: 'camp-12',
    title: 'Homeless Veterans Support Program',
    summary: 'Providing housing assistance and job training to veterans experiencing homelessness.',
    description: `Too many of our heroes who served this country are now living on the streets. Our program provides comprehensive support to help homeless veterans rebuild their lives.

Services include:
- Temporary housing assistance
- Job training and placement
- Mental health counseling
- Substance abuse treatment
- Benefits navigation assistance
- Life skills workshops

Last year, we helped 45 veterans find stable housing and employment. With your support, we can expand our program and help even more.`,
    category: 'Community Projects',
    serviceType: 'community',
    status: 'completed',
    targetAmount: 75000,
    raisedAmount: 82340,
    donorCount: 567,
    views: 8934,
    favouriteCount: 345,
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2026-01-01T00:00:00Z',
    organiser: {
      id: 'user-3',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isVerified: true,
      totalCampaigns: 12,
      totalRaised: 450000,
    },
    beneficiary: {
      name: 'Veterans First Initiative',
      description: 'Veteran support non-profit',
    },
    coverImage: 'https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=800&h=400&fit=crop',
    gallery: [],
    updates: [],
    createdAt: '2025-09-28T10:00:00Z',
    completedAt: '2026-01-01T00:00:00Z',
    location: 'National',
    tags: ['veterans', 'homeless', 'housing', 'support'],
  },
]

// Donations
export const donations: Donation[] = [
  {
    id: 'don-1',
    campaignId: 'camp-1',
    campaignTitle: 'Help Maya Get Her Life-Saving Surgery',
    campaignImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop',
    category: 'Medical & Health',
    donorId: 'user-2',
    donorName: 'Michael Johnson',
    amount: 500,
    message: 'Wishing Maya a speedy recovery. Stay strong!',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-28T14:30:00Z',
  },
  {
    id: 'don-2',
    campaignId: 'camp-2',
    campaignTitle: 'Rebuild Riverside Community Center After Fire',
    campaignImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop',
    category: 'Community Projects',
    donorId: 'user-2',
    donorName: 'Michael Johnson',
    amount: 250,
    message: 'The community center was such an important part of my childhood.',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-25T10:15:00Z',
  },
  {
    id: 'don-3',
    campaignId: 'camp-3',
    campaignTitle: 'Scholarships for Underprivileged STEM Students',
    campaignImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
    category: 'Education',
    donorId: 'user-6',
    donorName: 'James Wilson',
    amount: 1000,
    message: 'Education changed my life. Happy to help others.',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-20T16:45:00Z',
  },
  {
    id: 'don-4',
    campaignId: 'camp-4',
    campaignTitle: 'Save the Ocean Ridge Wildlife Sanctuary',
    campaignImage: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop',
    category: 'Animals',
    donorId: 'user-2',
    donorName: 'Michael Johnson',
    amount: 150,
    message: '',
    isAnonymous: true,
    status: 'completed',
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'don-5',
    campaignId: 'camp-5',
    campaignTitle: 'Emergency Food Relief for Flood Victims',
    campaignImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=400&fit=crop',
    category: 'Emergency Relief',
    donorId: 'user-6',
    donorName: 'James Wilson',
    amount: 200,
    message: 'Every family deserves food security.',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-22T11:30:00Z',
  },
  {
    id: 'don-6',
    campaignId: 'camp-1',
    campaignTitle: 'Help Maya Get Her Life-Saving Surgery',
    campaignImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop',
    category: 'Medical & Health',
    donorId: 'user-6',
    donorName: 'James Wilson',
    amount: 750,
    message: 'For Maya - you\'ve got this!',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-27T13:00:00Z',
  },
  {
    id: 'don-7',
    campaignId: 'camp-7',
    campaignTitle: 'Community Garden Revitalization Project',
    campaignImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
    category: 'Environment',
    donorId: 'user-2',
    donorName: 'Michael Johnson',
    amount: 100,
    message: 'Love this initiative!',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-10T15:20:00Z',
  },
  {
    id: 'don-8',
    campaignId: 'camp-9',
    campaignTitle: 'Memorial Fund for Officer James Patterson',
    campaignImage: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop',
    category: 'Community Projects',
    donorId: 'user-6',
    donorName: 'James Wilson',
    amount: 300,
    message: 'Thank you for your service, Officer Patterson.',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-02-20T08:45:00Z',
  },
  {
    id: 'don-9',
    campaignId: 'camp-6',
    campaignTitle: 'Youth Soccer League Equipment Fund',
    campaignImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
    category: 'Sports & Recreation',
    donorId: 'user-2',
    donorName: 'Michael Johnson',
    amount: 75,
    message: 'Sports changed my life. Hope it changes theirs too.',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-18T17:00:00Z',
  },
  {
    id: 'don-10',
    campaignId: 'camp-8',
    campaignTitle: 'Independent Film: Stories of Resilience',
    campaignImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop',
    category: 'Creative Arts',
    donorId: 'user-6',
    donorName: 'James Wilson',
    amount: 150,
    message: 'Can\'t wait to see this film!',
    isAnonymous: false,
    status: 'completed',
    createdAt: '2026-03-05T12:30:00Z',
  },
]

// Favourites for user-2 (Michael Johnson)
export const favourites: Favourite[] = [
  {
    id: 'fav-1',
    userId: 'user-2',
    campaignId: 'camp-1',
    campaign: campaigns.find(c => c.id === 'camp-1')!,
    createdAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'fav-2',
    userId: 'user-2',
    campaignId: 'camp-3',
    campaign: campaigns.find(c => c.id === 'camp-3')!,
    createdAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'fav-3',
    userId: 'user-2',
    campaignId: 'camp-5',
    campaign: campaigns.find(c => c.id === 'camp-5')!,
    createdAt: '2026-03-22T09:00:00Z',
  },
  {
    id: 'fav-4',
    userId: 'user-2',
    campaignId: 'camp-7',
    campaign: campaigns.find(c => c.id === 'camp-7')!,
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 'fav-5',
    userId: 'user-6',
    campaignId: 'camp-1',
    campaign: campaigns.find(c => c.id === 'camp-1')!,
    createdAt: '2026-03-26T16:00:00Z',
  },
  {
    id: 'fav-6',
    userId: 'user-6',
    campaignId: 'camp-2',
    campaign: campaigns.find(c => c.id === 'camp-2')!,
    createdAt: '2026-03-20T10:00:00Z',
  },
]

// Notifications
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'donation_received',
    title: 'New Donation Received',
    message: 'Michael Johnson donated $500 to "Help Maya Get Her Life-Saving Surgery"',
    isRead: false,
    link: '/dashboard/fund-raiser/campaigns/camp-1',
    createdAt: '2026-03-28T14:30:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'campaign_milestone',
    title: 'Milestone Reached!',
    message: 'Your campaign "Help Maya Get Her Life-Saving Surgery" has reached 70% of its goal!',
    isRead: false,
    link: '/dashboard/fund-raiser/campaigns/camp-1',
    createdAt: '2026-03-27T16:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-2',
    type: 'campaign_update',
    title: 'Campaign Update',
    message: 'Sarah Chen posted an update on "Help Maya Get Her Life-Saving Surgery"',
    isRead: true,
    link: '/campaign/camp-1',
    createdAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'new_favourite',
    title: 'New Favourite',
    message: 'Someone saved your campaign "Scholarships for STEM Students" to their favourites',
    isRead: true,
    link: '/dashboard/fund-raiser/analytics',
    createdAt: '2026-03-25T12:00:00Z',
  },
]

// Campaign Analytics (for Fund Raiser dashboard)
export const campaignAnalytics: CampaignAnalytics[] = [
  { campaignId: 'camp-1', date: '2026-03-23', views: 245, favourites: 12, donations: 15, amount: 2340 },
  { campaignId: 'camp-1', date: '2026-03-24', views: 312, favourites: 18, donations: 22, amount: 3560 },
  { campaignId: 'camp-1', date: '2026-03-25', views: 287, favourites: 15, donations: 18, amount: 2890 },
  { campaignId: 'camp-1', date: '2026-03-26', views: 356, favourites: 23, donations: 28, amount: 4120 },
  { campaignId: 'camp-1', date: '2026-03-27', views: 423, favourites: 31, donations: 35, amount: 5670 },
  { campaignId: 'camp-1', date: '2026-03-28', views: 389, favourites: 25, donations: 30, amount: 4890 },
  { campaignId: 'camp-1', date: '2026-03-29', views: 445, favourites: 28, donations: 32, amount: 5230 },
]

// Daily Stats (for Platform Management)
export const dailyStats: DailyStats[] = [
  { date: '2026-03-23', users: 45, campaigns: 3, donations: 156, amount: 23400, views: 12500 },
  { date: '2026-03-24', users: 52, campaigns: 5, donations: 189, amount: 28900, views: 14200 },
  { date: '2026-03-25', users: 38, campaigns: 2, donations: 145, amount: 21500, views: 11800 },
  { date: '2026-03-26', users: 61, campaigns: 4, donations: 201, amount: 32100, views: 15600 },
  { date: '2026-03-27', users: 73, campaigns: 6, donations: 234, amount: 38500, views: 18200 },
  { date: '2026-03-28', users: 58, campaigns: 4, donations: 198, amount: 29800, views: 16400 },
  { date: '2026-03-29', users: 67, campaigns: 5, donations: 212, amount: 34200, views: 17800 },
  { date: '2026-03-30', users: 71, campaigns: 7, donations: 245, amount: 41200, views: 19500 },
  { date: '2026-03-31', users: 84, campaigns: 8, donations: 278, amount: 45600, views: 21300 },
  { date: '2026-04-01', users: 79, campaigns: 6, donations: 256, amount: 42100, views: 20100 },
]

export const analyticsData = {
  viewsTrend: campaignAnalytics.map((item) => ({
    date: item.date,
    views: item.views,
    favourites: item.favourites,
    donations: item.donations,
    amount: item.amount,
  })),

  donationTrend: dailyStats.map((item) => ({
    date: item.date,
    amount: item.amount,
    donations: item.donations,
  })),

  userGrowth: dailyStats.map((item) => ({
    date: item.date,
    users: item.users,
  })),
}

// Platform Stats
export const platformStats: PlatformStats = {
  totalUsers: 12847,
  activeUsers: 11234,
  suspendedUsers: 156,
  totalFundRaisers: 2341,
  totalDonees: 10506,
  totalCampaigns: 1567,
  activeCampaigns: 423,
  completedCampaigns: 1089,
  totalDonations: 45678,
  totalDonationAmount: 4567800,
  averageDonation: 100,
}

// Report Summary
export const reportSummary: ReportSummary = {
  period: 'monthly',
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  stats: platformStats,
  topCampaigns: campaigns.filter(c => c.status === 'active').slice(0, 5),
  topCategories: [
    { category: 'Medical & Health', count: 156, amount: 1245000 },
    { category: 'Education', count: 89, amount: 678000 },
    { category: 'Community Projects', count: 78, amount: 534000 },
    { category: 'Animals', count: 67, amount: 423000 },
    { category: 'Emergency Relief', count: 45, amount: 567000 },
  ],
  insights: [
    'Medical campaigns continue to be the most popular category with 156 active campaigns',
    'Average donation amount increased by 12% compared to last month',
    'User signups are up 23% week over week',
    'Emergency relief campaigns have the highest completion rate at 94%',
    'Mobile donations now account for 67% of all transactions',
  ],
}

// Helper functions
export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find(c => c.id === id)
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id)
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getCampaignsByOrganiser(organiserId: string): Campaign[] {
  return campaigns.filter(c => c.organiser.id === organiserId)
}

export function getDonationsByDonor(donorId: string): Donation[] {
  return donations.filter(d => d.donorId === donorId)
}

export function getFavouritesByUser(userId: string): Favourite[] {
  return favourites.filter(f => f.userId === userId)
}

export function getActiveCampaigns(): Campaign[] {
  return campaigns.filter(c => c.status === 'active')
}

export function getFeaturedCampaigns(): Campaign[] {
  return campaigns
    .filter(c => c.status === 'active')
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 6)
}

export function calculateProgress(raised: number, target: number): number {
  return Math.min(Math.round((raised / target) * 100), 100)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'suspended':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
