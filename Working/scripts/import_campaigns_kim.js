const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const mockCampaigns = [
  {
    title: "Help Maya Get Her Life-Saving Surgery",
    summary:
      "Maya needs urgent heart surgery that her family cannot afford. Every donation brings her closer to a healthy future.",
    description:
      "Maya Chen is a bright 8-year-old girl who loves drawing butterflies and dreams of becoming a veterinarian. Last month, she was diagnosed with a congenital heart defect that requires immediate surgical intervention.\n\nThe surgery she needs costs $75,000, which is far beyond what her family can afford. Her parents, both teachers, have exhausted their savings on initial treatments and diagnostic tests.\n\nWithout this surgery, Maya's condition will worsen, affecting her quality of life and potentially becoming life-threatening. The surgical team at Children's Hospital has confirmed that with timely intervention, Maya has an excellent prognosis for a full recovery.\n\nYour donation will help cover:\n- Surgical procedure costs\n- Hospital stay and post-operative care\n- Rehabilitation and follow-up appointments\n- Medications and medical supplies\n\nEvery contribution, no matter the size, brings Maya one step closer to the healthy childhood she deserves. Thank you for being part of her journey to recovery.",
    category: "Medical & Health",
    serviceType: "medical",
    status: "active",
    targetAmount: 75000,
    raisedAmount: 52340,
    donorCount: 423,
    views: 8542,
    favouriteCount: 312,
    startDate: "2026-02-15T00:00:00Z",
    endDate: "2026-05-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop",
    beneficiaryName: "Maya Chen",
    beneficiaryRelationship: "Daughter",
    beneficiaryDescription: "8-year-old girl needing heart surgery",
  },
  {
    title: "Rebuild Riverside Community Center After Fire",
    summary:
      "Our beloved community center was destroyed by fire. Help us rebuild this vital hub for families and youth programs.",
    description:
      "The Riverside Community Center has been the heart of our neighborhood for over 40 years. Last month, a devastating fire destroyed the building, leaving hundreds of families without access to essential programs.\n\nThe center provided:\n- After-school tutoring for 200+ children\n- Senior citizen activities and meals\n- Youth basketball leagues\n- Job training workshops\n- Community meeting space\n\nWe need your help to rebuild and make the new center even better. The reconstruction will include modern facilities, improved accessibility, and expanded program space.\n\nJoin us in restoring this cornerstone of our community. Together, we can rise from the ashes and create an even brighter future for Riverside.",
    category: "Community Projects",
    serviceType: "community",
    status: "active",
    targetAmount: 250000,
    raisedAmount: 178500,
    donorCount: 892,
    views: 12340,
    favouriteCount: 567,
    startDate: "2026-01-10T00:00:00Z",
    endDate: "2026-07-10T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    beneficiaryName: "Riverside Community",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Local families and youth",
  },
  {
    title: "Scholarships for Underprivileged STEM Students",
    summary:
      "Help bright students from low-income families pursue their dreams in science and technology.",
    description:
      "Education is the key to breaking the cycle of poverty. Our STEM scholarship program identifies talented students from underprivileged backgrounds and provides them with the resources they need to succeed.\n\nEach $5,000 scholarship covers:\n- Tuition and fees\n- Books and supplies\n- Laptop or tablet\n- Mentorship program access\n- Internship placement support\n\nLast year, 15 of our scholarship recipients graduated with honors, and 12 secured positions at leading tech companies. Your donation directly impacts these young minds and helps build a more diverse, equitable tech industry.",
    category: "Education",
    serviceType: "education",
    status: "active",
    targetAmount: 100000,
    raisedAmount: 67800,
    donorCount: 234,
    views: 5621,
    favouriteCount: 189,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-09-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    beneficiaryName: "STEM Scholars Program",
    beneficiaryRelationship: null,
    beneficiaryDescription: "20 students per year",
  },
  {
    title: "Save the Ocean Ridge Wildlife Sanctuary",
    summary:
      "Our sanctuary cares for injured wildlife but faces closure due to funding cuts. Help us keep our doors open.",
    description:
      "Ocean Ridge Wildlife Sanctuary has rescued and rehabilitated over 3,000 animals in the past decade. From injured sea birds to orphaned deer, we provide medical care and safe haven for wildlife in need.\n\nRecent government funding cuts threaten to close our doors forever. We need community support to continue our vital work.\n\nYour donation helps provide:\n- Medical supplies and veterinary care\n- Food for 200+ animals in our care\n- Habitat maintenance and improvements\n- Educational programs for local schools\n- Staff salaries for trained animal care specialists\n\nWithout your help, hundreds of animals will have nowhere to go. Please join us in protecting our local wildlife.",
    category: "Animals",
    serviceType: "animals",
    status: "active",
    targetAmount: 85000,
    raisedAmount: 41200,
    donorCount: 567,
    views: 7823,
    favouriteCount: 423,
    startDate: "2026-02-01T00:00:00Z",
    endDate: "2026-06-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&h=400&fit=crop",
    beneficiaryName: "Ocean Ridge Wildlife Sanctuary",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Non-profit wildlife rescue organization",
  },
  {
    title: "Emergency Food Relief for Flood Victims",
    summary:
      "Families displaced by severe flooding need immediate food assistance. Your donation provides meals for those in crisis.",
    description:
      "Severe flooding has devastated communities across the region, leaving thousands of families without homes, food, or clean water. Our emergency response team is on the ground providing immediate relief.\n\nEach $25 donation provides:\n- 3 days of meals for a family of four\n- Clean drinking water\n- Essential hygiene supplies\n\nWe've already distributed 10,000 meals but the need continues to grow. With your support, we can expand our reach and help more families survive this crisis.",
    category: "Emergency Relief",
    serviceType: "emergency",
    status: "active",
    targetAmount: 50000,
    raisedAmount: 48750,
    donorCount: 1234,
    views: 15678,
    favouriteCount: 234,
    startDate: "2026-03-20T00:00:00Z",
    endDate: "2026-04-20T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=400&fit=crop",
    beneficiaryName: "Regional Flood Victims",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Displaced families needing food assistance",
  },
  {
    title: "Youth Soccer League Equipment Fund",
    summary:
      "Help our inner-city youth soccer league get proper equipment so every kid can play safely.",
    description:
      "The Eastside Youth Soccer League provides a safe, positive environment for over 300 kids from underserved neighborhoods. Many of our players come from families who cannot afford proper equipment.\n\nWe need funding for:\n- 50 sets of shin guards and cleats\n- 30 soccer balls\n- Goal nets and field equipment\n- Team jerseys for 15 teams\n- First aid supplies\n\nSoccer teaches our kids teamwork, discipline, and gives them a healthy outlet. Help us ensure every child has the gear they need to participate fully.",
    category: "Sports & Recreation",
    serviceType: "sports",
    status: "active",
    targetAmount: 15000,
    raisedAmount: 8900,
    donorCount: 156,
    views: 2341,
    favouriteCount: 87,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-05-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop",
    beneficiaryName: "Eastside Youth Soccer League",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Youth sports organization",
  },
  {
    title: "Community Garden Revitalization Project",
    summary:
      "Transform an abandoned lot into a thriving community garden providing fresh produce for local families.",
    description:
      "The vacant lot on Oak Street has been an eyesore for years. We're turning it into a vibrant community garden that will provide fresh vegetables, herbs, and flowers for our neighborhood.\n\nThe garden will feature:\n- 40 individual plots for families\n- Shared herb and flower gardens\n- Composting station\n- Tool shed and water access\n- Accessible raised beds for seniors and disabled gardeners\n- Children's learning garden\n\nThis project brings neighbors together, provides healthy food options in our food desert, and beautifies our community.",
    category: "Environment",
    serviceType: "environment",
    status: "active",
    targetAmount: 25000,
    raisedAmount: 18750,
    donorCount: 234,
    views: 3456,
    favouriteCount: 156,
    startDate: "2026-02-15T00:00:00Z",
    endDate: "2026-05-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    beneficiaryName: "Oak Street Neighborhood",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Local community members",
  },
  {
    title: "Independent Film: Stories of Resilience",
    summary:
      "Help us complete our documentary showcasing incredible stories of community resilience and hope.",
    description:
      "\"Stories of Resilience\" is a documentary film that follows five ordinary people who have overcome extraordinary challenges. From a refugee who became a successful entrepreneur to a cancer survivor who now runs marathons, these stories inspire and uplift.\n\nWe've completed filming and need funding for:\n- Post-production editing\n- Music licensing\n- Color grading\n- Sound mixing\n- Festival submission fees\n- Marketing materials\n\nThis film has the potential to reach millions and spread a message of hope. Help us share these powerful stories with the world.",
    category: "Creative Arts",
    serviceType: "creative",
    status: "active",
    targetAmount: 35000,
    raisedAmount: 21500,
    donorCount: 189,
    views: 4521,
    favouriteCount: 234,
    startDate: "2026-01-20T00:00:00Z",
    endDate: "2026-04-20T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    beneficiaryName: "Resilience Films LLC",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Independent documentary production",
  },
  {
    title: "Memorial Fund for Officer James Patterson",
    summary:
      "Supporting the family of Officer Patterson who gave his life protecting our community.",
    description:
      "Officer James Patterson served our community with honor and dedication for 15 years. He was tragically killed in the line of duty on February 10th, leaving behind his wife Maria and three children.\n\nThis fund will support:\n- Mortgage payments for the family home\n- Education fund for the three children\n- Daily living expenses during this difficult transition\n- Counseling and support services\n\nOfficer Patterson touched countless lives through his service. Let's come together to support the family he loved so dearly.",
    category: "Community Projects",
    serviceType: "memorial",
    status: "completed",
    targetAmount: 150000,
    raisedAmount: 187500,
    donorCount: 2341,
    views: 25678,
    favouriteCount: 876,
    startDate: "2026-02-12T00:00:00Z",
    endDate: "2026-03-12T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop",
    beneficiaryName: "Patterson Family",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Maria Patterson and children",
  },
  {
    title: "Rural Clinic Medical Equipment Drive",
    summary:
      "Our rural clinic serves 5,000 patients but desperately needs updated medical equipment.",
    description:
      "Valley Health Clinic is the only medical facility within 50 miles for our rural community. We serve over 5,000 patients annually but are operating with outdated equipment that limits our ability to provide quality care.\n\nWe urgently need:\n- New ultrasound machine ($45,000)\n- Digital X-ray system ($35,000)\n- Patient monitoring equipment ($15,000)\n- Sterilization equipment ($5,000)\n\nWith modern equipment, we can diagnose conditions earlier, reduce patient transfers to distant hospitals, and provide better care for our community.",
    category: "Medical & Health",
    serviceType: "medical",
    status: "active",
    targetAmount: 100000,
    raisedAmount: 34200,
    donorCount: 287,
    views: 4123,
    favouriteCount: 198,
    startDate: "2026-03-05T00:00:00Z",
    endDate: "2026-08-05T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop",
    beneficiaryName: "Valley Health Clinic",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Non-profit rural medical facility",
  },
  {
    title: "School Library Renovation Project",
    summary:
      "Help us transform an outdated school library into a modern learning hub for 800 students.",
    description:
      "Lincoln Elementary School's library hasn't been updated since 1985. Our 800 students deserve a modern, inspiring space to develop their love of reading.\n\nThe renovation will include:\n- New bookshelves and 5,000 new books\n- Computer stations with internet access\n- Comfortable reading nooks\n- Updated lighting and paint\n- Maker space for STEM activities\n- Accessible design for all students\n\nA great library can spark a lifelong love of learning. Help us give our students the resources they need to succeed.",
    category: "Education",
    serviceType: "education",
    status: "draft",
    targetAmount: 45000,
    raisedAmount: 0,
    donorCount: 0,
    views: 0,
    favouriteCount: 0,
    startDate: "2026-04-15T00:00:00Z",
    endDate: "2026-08-15T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
    beneficiaryName: "Lincoln Elementary School",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Public elementary school",
  },
  {
    title: "Homeless Veterans Support Program",
    summary:
      "Providing housing assistance and job training to veterans experiencing homelessness.",
    description:
      "Too many of our heroes who served this country are now living on the streets. Our program provides comprehensive support to help homeless veterans rebuild their lives.\n\nServices include:\n- Temporary housing assistance\n- Job training and placement\n- Mental health counseling\n- Substance abuse treatment\n- Benefits navigation assistance\n- Life skills workshops\n\nLast year, we helped 45 veterans find stable housing and employment. With your support, we can expand our program and help even more.",
    category: "Community Projects",
    serviceType: "community",
    status: "completed",
    targetAmount: 75000,
    raisedAmount: 82340,
    donorCount: 567,
    views: 8934,
    favouriteCount: 345,
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2026-01-01T00:00:00Z",
    coverImage:
      "https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=800&h=400&fit=crop",
    beneficiaryName: "Veterans First Initiative",
    beneficiaryRelationship: null,
    beneficiaryDescription: "Veteran support non-profit",
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
        organiserId: kimLee.id,
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