const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Demo campaigns for the existing Kim Lee fundraiser account.
 *
 * These campaign titles were changed so they do not overlap with the
 * kimsspamv2@gmail.com test campaigns. The script also checks campaign titles
 * globally before inserting, because fundraiser campaigns are visible together
 * on the landing page.
 */
const mockCampaigns = [
  {
    title: "Sponsor Ava's Pediatric Kidney Treatment",
    summary:
      "Ava needs urgent kidney treatment and ongoing hospital care. Every donation helps her family manage the medical costs.",
    description:
      "Ava Lim is a cheerful 7-year-old who has been undergoing treatment for a serious kidney condition. Her doctors have recommended an urgent treatment plan involving specialist consultations, hospital monitoring, medication, and follow-up care.\n\nThe cost of care has placed significant pressure on her family, who have already used most of their savings for earlier tests and appointments.\n\nYour donation will help cover:\n- Specialist medical treatment\n- Hospital and consultation fees\n- Medication and medical supplies\n- Follow-up appointments and recovery support\n\nEvery contribution helps Ava continue receiving the care she needs.",
    category: "Medical & Health",
    serviceType: "medical",
    status: "active",
    targetAmount: 68000,
    raisedAmount: 42150,
    donorCount: 318,
    views: 7240,
    favouriteCount: 241,
    startDate: "2026-02-15T00:00:00Z",
    endDate: "2026-05-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop",
    beneficiaryName: "Ava Lim",
    beneficiaryRelationship: "Daughter",
    beneficiaryDescription: "7-year-old child needing kidney treatment",
  },
  {
    title: "Restore Northside Family Hub After Fire",
    summary:
      "The Northside Family Hub was damaged by fire. Help restore a safe space for after-school care, family support, and community programmes.",
    description:
      "The Northside Family Hub has supported local families for many years through after-school care, family activities, meal support, and community programmes. A recent fire damaged key areas of the facility and disrupted services for families who rely on the centre each week.\n\nFunds raised will help with:\n- Building restoration works\n- Replacement of furniture and equipment\n- Reopening of after-school programmes\n- Safety upgrades and accessibility improvements\n\nYour support will help the hub reopen and continue serving the community.",
    category: "Community Projects",
    serviceType: "community",
    status: "active",
    targetAmount: 220000,
    raisedAmount: 136400,
    donorCount: 684,
    views: 10320,
    favouriteCount: 421,
    startDate: "2026-01-10T00:00:00Z",
    endDate: "2026-07-10T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    beneficiaryName: "Northside Family Hub",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Local families and programme users",
  },
  {
    title: "Coding Laptops for First-Gen Students",
    summary:
      "Help first-generation students access laptops, software, and mentoring so they can continue learning technology skills.",
    description:
      "Many first-generation students in our coding support programme have the motivation to learn but do not have reliable devices or software access at home. This campaign provides practical learning tools for students preparing for technology courses and internships.\n\nEach supported student may receive:\n- A laptop or tablet\n- Software and learning resources\n- Mentorship programme access\n- Workshop and internship preparation support\n\nYour donation helps reduce the digital gap for students working hard to build their future.",
    category: "Education",
    serviceType: "education",
    status: "active",
    targetAmount: 90000,
    raisedAmount: 51420,
    donorCount: 205,
    views: 4980,
    favouriteCount: 164,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-09-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    beneficiaryName: "First-Gen Coding Scholars",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Students needing digital learning support",
  },
  {
    title: "Coastal Turtle Rescue Sanctuary Appeal",
    summary:
      "Support a coastal sanctuary caring for injured turtles and marine wildlife affected by storms and pollution.",
    description:
      "The Coastal Turtle Rescue Sanctuary treats injured sea turtles, birds, and small marine animals affected by pollution, storms, and habitat disruption. The sanctuary needs additional funding to continue rescue, treatment, and rehabilitation work.\n\nYour donation helps provide:\n- Veterinary treatment and medication\n- Food and habitat maintenance\n- Rescue equipment\n- Rehabilitation tanks and supplies\n- Education programmes for local schools\n\nWith your help, more injured wildlife can recover and return safely to their natural environment.",
    category: "Animals",
    serviceType: "animals",
    status: "active",
    targetAmount: 72000,
    raisedAmount: 28600,
    donorCount: 402,
    views: 6920,
    favouriteCount: 338,
    startDate: "2026-02-01T00:00:00Z",
    endDate: "2026-06-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop",
    beneficiaryName: "Coastal Turtle Rescue Sanctuary",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Marine wildlife rescue organisation",
  },
  {
    title: "Typhoon Relief Meal Packs for Families",
    summary:
      "Families affected by a recent typhoon need meal packs, clean water, and hygiene supplies while recovery works continue.",
    description:
      "A severe typhoon has damaged homes, disrupted transport, and left families without stable access to food and clean water. Our relief team is preparing emergency meal packs and hygiene kits for affected households.\n\nEach donation supports:\n- Ready-to-eat meal packs\n- Drinking water\n- Hygiene and sanitation items\n- Temporary family support supplies\n\nYour support helps families get through the immediate recovery period safely.",
    category: "Emergency Relief",
    serviceType: "emergency",
    status: "active",
    targetAmount: 46000,
    raisedAmount: 39120,
    donorCount: 908,
    views: 14280,
    favouriteCount: 214,
    startDate: "2026-03-20T00:00:00Z",
    endDate: "2026-04-20T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=400&fit=crop",
    beneficiaryName: "Typhoon-Affected Families",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Families needing emergency food and hygiene support",
  },
  {
    title: "Weekend Basketball Gear for Youth",
    summary:
      "Help a youth basketball programme buy safe gear, uniforms, and training supplies for children from low-income families.",
    description:
      "The East Court Youth Basketball Programme gives children a safe and positive place to train on weekends. Many players cannot afford proper gear, uniforms, and basic training supplies.\n\nWe are raising funds for:\n- Basketballs and training cones\n- Team jerseys\n- Shoes and protective gear\n- First aid supplies\n- Court booking fees\n\nSport helps our young players build confidence, teamwork, and discipline.",
    category: "Sports & Recreation",
    serviceType: "sports",
    status: "active",
    targetAmount: 18000,
    raisedAmount: 9700,
    donorCount: 148,
    views: 2841,
    favouriteCount: 94,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-05-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop",
    beneficiaryName: "East Court Youth Basketball",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Youth sports programme",
  },
  {
    title: "Green Lane Urban Farm Starter Fund",
    summary:
      "Transform an unused lot into an urban farm that provides fresh produce, workshops, and shared gardening plots.",
    description:
      "The Green Lane Urban Farm project will convert an unused lot into a productive community food space. The farm will include raised beds, composting stations, water access, shared tools, and learning spaces for families and school groups.\n\nFunds will support:\n- Soil preparation and raised beds\n- Seedlings and gardening supplies\n- Water access and irrigation\n- Tool storage and safety equipment\n- Community workshops\n\nThis project will improve access to fresh produce while bringing neighbours together.",
    category: "Environment",
    serviceType: "environment",
    status: "active",
    targetAmount: 28000,
    raisedAmount: 16580,
    donorCount: 211,
    views: 3320,
    favouriteCount: 131,
    startDate: "2026-02-15T00:00:00Z",
    endDate: "2026-05-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    beneficiaryName: "Green Lane Residents",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Local families and community gardeners",
  },
  {
    title: "Community Theatre Documentary Project",
    summary:
      "Support a documentary about a small community theatre group preserving local stories through performance.",
    description:
      "This documentary follows a community theatre group that uses performance to share local stories, oral histories, and intergenerational experiences. Filming is complete and the project now needs post-production support.\n\nFunding will assist with:\n- Editing and post-production\n- Music licensing\n- Sound mixing\n- Accessibility captions\n- Community screening costs\n\nYour support helps preserve local stories and share them with a wider audience.",
    category: "Creative Arts",
    serviceType: "creative",
    status: "active",
    targetAmount: 32000,
    raisedAmount: 18420,
    donorCount: 151,
    views: 3980,
    favouriteCount: 188,
    startDate: "2026-01-20T00:00:00Z",
    endDate: "2026-04-20T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    beneficiaryName: "Local Stage Stories Team",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Community documentary production team",
  },
  {
    title: "Memorial Support for Nurse Emily Tan",
    summary:
      "Support the family of Nurse Emily Tan and honour her years of service to patients and the local community.",
    description:
      "Nurse Emily Tan served patients and families with dedication for many years. This memorial fund provides practical support to her family and contributes towards an education fund for her children.\n\nFunds raised will assist with:\n- Family living expenses\n- Education support\n- Counselling and transition support\n- Community memorial arrangements\n\nThis campaign allows the community to support Emily's family during a difficult time.",
    category: "Community Projects",
    serviceType: "memorial",
    status: "completed",
    targetAmount: 130000,
    raisedAmount: 152300,
    donorCount: 1884,
    views: 20120,
    favouriteCount: 642,
    startDate: "2026-02-12T00:00:00Z",
    endDate: "2026-03-12T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop",
    beneficiaryName: "Tan Family",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Family of Nurse Emily Tan",
  },
  {
    title: "Mobile Health Van Equipment Appeal",
    summary:
      "Help equip a mobile health van that provides basic check-ups and outreach care to remote communities.",
    description:
      "The mobile health van serves residents who have difficulty travelling to clinics. It needs updated equipment to provide safer and more reliable outreach care.\n\nWe urgently need:\n- Portable examination equipment\n- Patient monitoring devices\n- Medical storage supplies\n- Basic diagnostic tools\n- Sterilisation and safety equipment\n\nWith proper equipment, the outreach team can bring essential care closer to remote families.",
    category: "Medical & Health",
    serviceType: "medical",
    status: "active",
    targetAmount: 88000,
    raisedAmount: 30450,
    donorCount: 254,
    views: 3810,
    favouriteCount: 171,
    startDate: "2026-03-05T00:00:00Z",
    endDate: "2026-08-05T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop",
    beneficiaryName: "Remote Outreach Health Van",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Mobile medical outreach service",
  },
  {
    title: "BrightStart Reading Room Upgrade",
    summary:
      "Help upgrade an old reading room into a brighter learning space with books, computers, and quiet study areas.",
    description:
      "BrightStart Primary's reading room has outdated shelves, limited seating, and insufficient technology access. The upgrade will create a better learning environment for students who use the space for reading, research, and homework support.\n\nThe project includes:\n- New shelves and books\n- Computer stations\n- Comfortable study areas\n- Updated lighting and paint\n- Accessible reading corners\n\nA better reading room can support stronger learning habits and confidence.",
    category: "Education",
    serviceType: "education",
    status: "draft",
    targetAmount: 42000,
    raisedAmount: 0,
    donorCount: 0,
    views: 0,
    favouriteCount: 0,
    startDate: "2026-04-15T00:00:00Z",
    endDate: "2026-08-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
    beneficiaryName: "BrightStart Primary School",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Primary school students",
  },
  {
    title: "Veterans Skills and Housing Restart",
    summary:
      "Provide temporary housing support, skills training, and employment assistance for veterans rebuilding their lives.",
    description:
      "This programme supports veterans who are transitioning into stable housing and employment. It combines practical assistance with training and case support to help participants regain independence.\n\nServices include:\n- Temporary housing support\n- Job training and placement\n- Counselling and life skills workshops\n- Benefits navigation\n- Transport and work-readiness assistance\n\nYour donation helps veterans access the support needed for a stable restart.",
    category: "Community Projects",
    serviceType: "community",
    status: "completed",
    targetAmount: 72000,
    raisedAmount: 78640,
    donorCount: 498,
    views: 8120,
    favouriteCount: 286,
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2026-01-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=800&h=400&fit=crop",
    beneficiaryName: "Veterans Restart Initiative",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Veteran support programme",
  },
]

async function main() {
  const kimLee = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "fundraiser@example.com" },
        {
          AND: [
            { firstName: "Kim" },
            { lastName: "Lee" },
            { role: "fund_raiser" },
          ],
        },
      ],
    },
  })

  if (!kimLee) {
    throw new Error(
      "Kim Lee (fundraiser@example.com) was not found in the database."
    )
  }

  let inserted = 0
  let skipped = 0

  for (const campaign of mockCampaigns) {
    const existing = await prisma.campaign.findFirst({
      where: {
        title: campaign.title,
      },
    })

    if (existing) {
      skipped += 1
      console.log(`Skipping existing campaign title: ${campaign.title}`)
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
        organiserId: kimLee.id,
      },
    })

    inserted += 1
    console.log(`Inserted: ${campaign.title}`)
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
