/**
 * Imports demo campaigns under Kim's fund raiser account.
 *
 * Run after creating the fund raiser account:
 *   node scripts/create_kim_fundraiser_account.js
 *   node scripts/import_campaigns_kimsspamv2.js
 *
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const FUNDRAISER_EMAIL = 'kimsspamv2@gmail.com'

const mockCampaigns = [
  {
    "title": "Help Maya Get Her Life-Saving Surgery",
    "summary": "Maya needs urgent heart surgery that her family cannot afford. Every donation brings her closer to a healthy future.",
    "description": "Maya Chen is a bright 8-year-old girl who loves drawing butterflies and dreams of becoming a veterinarian. She was diagnosed with a congenital heart defect and requires urgent surgery. Funds raised will assist with the surgical procedure, hospital stay, post-operative care, medication, and follow-up appointments.",
    "category": "Medical & Health",
    "serviceType": "medical",
    "status": "active",
    "targetAmount": 75000,
    "raisedAmount": 52340,
    "donorCount": 423,
    "views": 8542,
    "favouriteCount": 312,
    "startDate": "2026-04-01T00:00:00Z",
    "endDate": "2026-09-30T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop",
    "beneficiaryName": "Maya Chen",
    "beneficiaryRelationship": "Daughter",
    "beneficiaryDescription": "8-year-old girl needing heart surgery"
  },
  {
    "title": "Rebuild Riverside Community Center After Fire",
    "summary": "Our beloved community center was damaged by fire. Help us restore this vital hub for families and youth programs.",
    "description": "The Riverside Community Center has supported the neighbourhood for decades through tutoring, senior activities, sports programs, job training, and community events. A recent fire damaged key facilities and disrupted these services. Donations will help restore the building, replace damaged equipment, and reopen the centre safely.",
    "category": "Community Projects",
    "serviceType": "community",
    "status": "active",
    "targetAmount": 250000,
    "raisedAmount": 178500,
    "donorCount": 892,
    "views": 12340,
    "favouriteCount": 567,
    "startDate": "2026-03-15T00:00:00Z",
    "endDate": "2026-10-15T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    "beneficiaryName": "Riverside Community",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Local families and youth programme users"
  },
  {
    "title": "Scholarships for Underprivileged STEM Students",
    "summary": "Help bright students from low-income families pursue their dreams in science and technology.",
    "description": "This STEM scholarship fund supports students who have strong academic potential but limited financial resources. Contributions will help cover tuition, books, laptops, mentoring support, and internship preparation so students can continue their studies with fewer barriers.",
    "category": "Education",
    "serviceType": "education",
    "status": "active",
    "targetAmount": 100000,
    "raisedAmount": 67800,
    "donorCount": 234,
    "views": 5621,
    "favouriteCount": 189,
    "startDate": "2026-04-10T00:00:00Z",
    "endDate": "2026-11-10T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    "beneficiaryName": "STEM Scholars Program",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Students from low-income families"
  },
  {
    "title": "Save the Ocean Ridge Wildlife Sanctuary",
    "summary": "The sanctuary cares for injured wildlife but faces a funding shortage. Help keep its doors open.",
    "description": "Ocean Ridge Wildlife Sanctuary rescues and rehabilitates injured animals, including sea birds, small mammals, and orphaned wildlife. Funding will assist with veterinary care, food supplies, habitat maintenance, educational programs, and daily animal care operations.",
    "category": "Animals",
    "serviceType": "animals",
    "status": "active",
    "targetAmount": 85000,
    "raisedAmount": 41200,
    "donorCount": 567,
    "views": 7823,
    "favouriteCount": 423,
    "startDate": "2026-03-25T00:00:00Z",
    "endDate": "2026-08-25T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop",
    "beneficiaryName": "Ocean Ridge Wildlife Sanctuary",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Non-profit wildlife rescue organisation"
  },
  {
    "title": "Emergency Food Relief for Flood Victims",
    "summary": "Families displaced by severe flooding need immediate food and hygiene supplies.",
    "description": "Severe flooding has displaced families and affected access to food, clean water, and essential supplies. This campaign provides emergency meals, drinking water, hygiene kits, and temporary support for affected households while recovery works continue.",
    "category": "Emergency Relief",
    "serviceType": "emergency",
    "status": "active",
    "targetAmount": 50000,
    "raisedAmount": 0,
    "donorCount": 0,
    "views": 15678,
    "favouriteCount": 234,
    "startDate": "2026-04-20T00:00:00Z",
    "endDate": "2026-08-20T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=400&fit=crop",
    "beneficiaryName": "Regional Flood Victims",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Displaced families needing food assistance"
  },
  {
    "title": "Youth Soccer League Equipment Fund",
    "summary": "Help our youth soccer league buy safe equipment so every child can participate.",
    "description": "The Eastside Youth Soccer League provides a safe and positive space for children from underserved neighbourhoods. Donations will fund shin guards, cleats, soccer balls, goal nets, team jerseys, and first aid supplies.",
    "category": "Sports & Recreation",
    "serviceType": "sports",
    "status": "active",
    "targetAmount": 15000,
    "raisedAmount": 8900,
    "donorCount": 156,
    "views": 2341,
    "favouriteCount": 87,
    "startDate": "2026-04-01T00:00:00Z",
    "endDate": "2026-07-01T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop",
    "beneficiaryName": "Eastside Youth Soccer League",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Youth sports organisation"
  },
  {
    "title": "Community Garden Revitalization Project",
    "summary": "Transform an abandoned lot into a community garden providing fresh produce for local families.",
    "description": "This project will convert a vacant lot into a shared community garden with family plots, raised beds, composting facilities, a tool shed, and a children's learning area. The space will support healthier food access and stronger community connection.",
    "category": "Environment",
    "serviceType": "environment",
    "status": "active",
    "targetAmount": 25000,
    "raisedAmount": 18750,
    "donorCount": 234,
    "views": 3456,
    "favouriteCount": 156,
    "startDate": "2026-04-05T00:00:00Z",
    "endDate": "2026-09-05T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    "beneficiaryName": "Oak Street Neighborhood",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Families and residents in the local neighbourhood"
  },
  {
    "title": "Independent Film: Stories of Resilience",
    "summary": "Support a local documentary sharing real stories of recovery, care, and community resilience.",
    "description": "This independent film project documents stories from individuals and communities rebuilding after personal and social challenges. Donations will support filming, editing, sound production, community screenings, and accessibility captions.",
    "category": "Creative Arts",
    "serviceType": "arts",
    "status": "active",
    "targetAmount": 35000,
    "raisedAmount": 21400,
    "donorCount": 98,
    "views": 4120,
    "favouriteCount": 76,
    "startDate": "2026-04-12T00:00:00Z",
    "endDate": "2026-10-12T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    "beneficiaryName": "Stories of Resilience Film Team",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Local documentary production team"
  },
  {
    "title": "Memorial Fund for Officer James Patterson",
    "summary": "Support the family of Officer Patterson and honour his years of public service.",
    "description": "This memorial fund provides practical support to Officer James Patterson's family following his passing. Donations will assist with family expenses, education support for his children, and a community memorial recognising his service.",
    "category": "Memorial",
    "serviceType": "memorial",
    "status": "active",
    "targetAmount": 120000,
    "raisedAmount": 95400,
    "donorCount": 711,
    "views": 10210,
    "favouriteCount": 420,
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-07-31T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=400&fit=crop",
    "beneficiaryName": "Patterson Family",
    "beneficiaryRelationship": "Family",
    "beneficiaryDescription": "Family of Officer James Patterson"
  },
  {
    "title": "Rural Clinic Medical Equipment Drive",
    "summary": "Help a rural clinic purchase essential diagnostic equipment for patients with limited healthcare access.",
    "description": "The Green Valley Rural Clinic serves families who travel long distances for medical care. Donations will help purchase diagnostic equipment, patient monitors, examination supplies, and basic treatment equipment so more patients can be assessed locally.",
    "category": "Medical & Health",
    "serviceType": "medical",
    "status": "active",
    "targetAmount": 65000,
    "raisedAmount": 0,
    "donorCount": 0,
    "views": 5122,
    "favouriteCount": 201,
    "startDate": "2026-04-15T00:00:00Z",
    "endDate": "2026-09-15T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&h=400&fit=crop",
    "beneficiaryName": "Green Valley Rural Clinic",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Rural clinic serving low-access communities"
  },
  {
    "title": "School Library Renovation Project",
    "summary": "Help transform an outdated school library into a modern learning hub for 800 students.",
    "description": "Lincoln Elementary School's library needs new shelving, updated books, computer stations, study spaces, lighting, and accessible reading areas. This campaign will create a safer and more engaging learning environment for students.",
    "category": "Education",
    "serviceType": "education",
    "status": "draft",
    "targetAmount": 45000,
    "raisedAmount": 0,
    "donorCount": 0,
    "views": 0,
    "favouriteCount": 0,
    "startDate": "2026-05-15T00:00:00Z",
    "endDate": "2026-11-15T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
    "beneficiaryName": "Lincoln Elementary School",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Public elementary school"
  },
  {
    "title": "Homeless Veterans Support Program",
    "summary": "Providing housing assistance, counselling support, and job training to veterans experiencing homelessness.",
    "description": "This support program assists veterans through temporary housing, job training, mental health support, benefits navigation, life skills workshops, and employment placement. Donations will help expand the number of veterans supported this year.",
    "category": "Community Projects",
    "serviceType": "community",
    "status": "completed",
    "targetAmount": 75000,
    "raisedAmount": 82340,
    "donorCount": 567,
    "views": 8934,
    "favouriteCount": 345,
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2026-01-01T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=800&h=400&fit=crop",
    "beneficiaryName": "Veterans First Initiative",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Veteran support non-profit"
  },
  {
    "title": "Clean Water Filters for Remote Villages",
    "summary": "Provide household water filters and safe water education to remote communities.",
    "description": "Remote families are facing unsafe drinking water due to ageing infrastructure and poor filtration access. Donations will fund household water filters, replacement cartridges, testing kits, and hygiene education sessions for village volunteers.",
    "category": "Emergency Relief",
    "serviceType": "emergency",
    "status": "active",
    "targetAmount": 40000,
    "raisedAmount": 16450,
    "donorCount": 142,
    "views": 3901,
    "favouriteCount": 99,
    "startDate": "2026-04-25T00:00:00Z",
    "endDate": "2026-10-25T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop",
    "beneficiaryName": "Remote Village Water Project",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Remote families needing clean water access"
  },
  {
    "title": "Accessible Playground for Maple Park",
    "summary": "Build an inclusive playground where children of all abilities can play safely together.",
    "description": "Maple Park needs accessible play equipment, rubber safety flooring, wheelchair-friendly pathways, shaded seating, and sensory play panels. This campaign will help create an inclusive space for families and children of all abilities.",
    "category": "Community Projects",
    "serviceType": "community",
    "status": "active",
    "targetAmount": 90000,
    "raisedAmount": 38200,
    "donorCount": 260,
    "views": 6210,
    "favouriteCount": 186,
    "startDate": "2026-05-01T00:00:00Z",
    "endDate": "2026-12-01T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=400&fit=crop",
    "beneficiaryName": "Maple Park Families",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Children and families using Maple Park"
  },
  {
    "title": "Emergency Vet Care for Rescued Shelter Pets",
    "summary": "Help rescued cats and dogs receive urgent veterinary treatment before adoption.",
    "description": "The shelter has taken in several injured and neglected pets requiring urgent veterinary care. Donations will cover surgery, vaccinations, medication, food, microchipping, and recovery support before the animals are placed in adoptive homes.",
    "category": "Animals",
    "serviceType": "animals",
    "status": "active",
    "targetAmount": 30000,
    "raisedAmount": 11875,
    "donorCount": 121,
    "views": 2845,
    "favouriteCount": 144,
    "startDate": "2026-05-03T00:00:00Z",
    "endDate": "2026-09-03T00:00:00Z",
    "coverImage": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=400&fit=crop",
    "beneficiaryName": "Happy Paws Animal Shelter",
    "beneficiaryRelationship": null,
    "beneficiaryDescription": "Rescued cats and dogs needing medical care"
  }
]

async function main() {
  const fundraiser = await prisma.user.findUnique({
    where: { email: FUNDRAISER_EMAIL },
  })

  if (!fundraiser) {
    throw new Error(
      `Fund raiser account not found: ${FUNDRAISER_EMAIL}. Run scripts/create_kim_fundraiser_account.js first.`
    )
  }

  if (fundraiser.role !== 'fund_raiser') {
    throw new Error(
      `Account ${FUNDRAISER_EMAIL} exists, but its role is "${fundraiser.role}" instead of "fund_raiser".`
    )
  }

  let inserted = 0
  let skipped = 0

  for (const campaign of mockCampaigns) {
    const existing = await prisma.campaign.findFirst({
      where: {
        organiserId: fundraiser.id,
        title: campaign.title,
      },
    })

    if (existing) {
      skipped += 1
      console.log(`Skipping existing campaign: ${campaign.title}`)
      continue
    }

    await prisma.campaign.create({
      data: {
        title: campaign.title,
        summary: campaign.summary,
        description: campaign.description,
        category: campaign.category,
        serviceType: campaign.serviceType,
        status: campaign.status,
        targetAmount: campaign.targetAmount,
        raisedAmount: campaign.raisedAmount,
        donorCount: campaign.donorCount,
        views: campaign.views,
        favouriteCount: campaign.favouriteCount,
        startDate: String(campaign.startDate).slice(0, 10),
        endDate: String(campaign.endDate).slice(0, 10),
        coverImage: campaign.coverImage,
        beneficiaryName: campaign.beneficiaryName,
        beneficiaryRelationship: campaign.beneficiaryRelationship || null,
        beneficiaryDescription: campaign.beneficiaryDescription || null,
        organiserId: fundraiser.id,
      },
    })

    inserted += 1
    console.log(`Inserted: ${campaign.title}`)
  }

  const totalForFundraiser = await prisma.campaign.count({
    where: { organiserId: fundraiser.id },
  })

  console.log('\nDone.')
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Total campaigns for ${FUNDRAISER_EMAIL}: ${totalForFundraiser}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
