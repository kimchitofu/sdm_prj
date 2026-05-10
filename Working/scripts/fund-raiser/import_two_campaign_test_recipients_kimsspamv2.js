/**
 * Imports test recipient/donor records into two Kim campaign records.
 *
 * Run after campaigns are imported:
 *   node scripts/create_kim_fundraiser_account.js
 *   node scripts/import_campaigns_kimsspamv2.js
 *   node scripts/import_two_campaign_test_recipients_kimsspamv2.js
 *
 * This creates 10 donor users using Gmail aliases:
 *   kimsspamv2+1@gmail.com through kimsspamv2+10@gmail.com
 *
 * The same 10 donors are added to BOTH selected campaigns so you can test
 * manual emails, workflow emails, BCC behaviour, and email activity logging.
 * The script is idempotent. Existing users/donations are updated instead of duplicated.
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const FUNDRAISER_EMAIL = 'kimsspamv2@gmail.com'
const DONOR_PASSWORD = 'Demo1234@'

const CAMPAIGN_TITLES = [
  'Emergency Food Relief for Flood Victims',
  'Rural Clinic Medical Equipment Drive',
]

const donors = [
  {
    firstName: 'James',
    lastName: 'Tan',
    email: 'kimsspamv2+1@gmail.com',
    amount: 25,
    message: 'Test donor 1 for email workflow testing.',
  },
  {
    firstName: 'Chloe',
    lastName: 'Lim',
    email: 'kimsspamv2+2@gmail.com',
    amount: 40,
    message: 'Test donor 2 for email workflow testing.',
  },
  {
    firstName: 'Marcus',
    lastName: 'Ong',
    email: 'kimsspamv2+3@gmail.com',
    amount: 60,
    message: 'Test donor 3 for email workflow testing.',
  },
  {
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'kimsspamv2+4@gmail.com',
    amount: 80,
    message: 'Test donor 4 for email workflow testing.',
  },
  {
    firstName: 'Ethan',
    lastName: 'Koh',
    email: 'kimsspamv2+5@gmail.com',
    amount: 100,
    message: 'Test donor 5 for email workflow testing.',
  },
  {
    firstName: 'Aisha',
    lastName: 'Rahman',
    email: 'kimsspamv2+6@gmail.com',
    amount: 120,
    message: 'Test donor 6 for email workflow testing.',
  },
  {
    firstName: 'Daniel',
    lastName: 'Lee',
    email: 'kimsspamv2+7@gmail.com',
    amount: 150,
    message: 'Test donor 7 for email workflow testing.',
  },
  {
    firstName: 'Mei',
    lastName: 'Wong',
    email: 'kimsspamv2+8@gmail.com',
    amount: 200,
    message: 'Test donor 8 for email workflow testing.',
  },
  {
    firstName: 'Sofia',
    lastName: 'Gomez',
    email: 'kimsspamv2+9@gmail.com',
    amount: 250,
    message: 'Test donor 9 for email workflow testing.',
  },
  {
    firstName: 'Noah',
    lastName: 'Martin',
    email: 'kimsspamv2+10@gmail.com',
    amount: 300,
    message: 'Test donor 10 for email workflow testing.',
  },
]

async function findFundraiser() {
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

  return fundraiser
}

async function findCampaigns(fundraiserId) {
  const campaigns = []

  for (const title of CAMPAIGN_TITLES) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        organiserId: fundraiserId,
        title,
      },
    })

    if (!campaign) {
      throw new Error(
        `Campaign not found for ${FUNDRAISER_EMAIL}: ${title}. Run scripts/import_campaigns_kimsspamv2.js first.`
      )
    }

    campaigns.push(campaign)
  }

  return campaigns
}

async function upsertDonorUser(donor, hashedPassword) {
  const existing = await prisma.user.findUnique({
    where: { email: donor.email },
  })

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: donor.email },
      data: {
        password: hashedPassword,
        firstName: donor.firstName,
        lastName: donor.lastName,
        role: 'donor',
        isVerified: true,
        status: 'active',
        location: 'Singapore',
      },
    })

    return { user: updated, created: false }
  }

  const created = await prisma.user.create({
    data: {
      email: donor.email,
      password: hashedPassword,
      firstName: donor.firstName,
      lastName: donor.lastName,
      role: 'donor',
      isVerified: true,
      status: 'active',
      location: 'Singapore',
    },
  })

  return { user: created, created: true }
}

async function upsertDonation({ campaign, donor, user }) {
  const existingDonation = await prisma.donation.findFirst({
    where: {
      campaignId: campaign.id,
      donorEmail: donor.email,
    },
  })

  const data = {
    campaignId: campaign.id,
    donorId: user.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    donorEmail: donor.email,
    amount: donor.amount,
    status: 'completed',
    message: donor.message,
    isAnonymous: false,
  }

  if (existingDonation) {
    await prisma.donation.update({
      where: { id: existingDonation.id },
      data,
    })
    return false
  }

  await prisma.donation.create({ data })
  return true
}

async function refreshCampaignTotals(campaignId) {
  const completedDonations = await prisma.donation.findMany({
    where: {
      campaignId,
      status: 'completed',
    },
    select: {
      amount: true,
      donorEmail: true,
    },
  })

  const raisedAmount = completedDonations.reduce(
    (sum, donation) => sum + Number(donation.amount || 0),
    0
  )

  const donorCount = new Set(
    completedDonations.map((donation) => donation.donorEmail).filter(Boolean)
  ).size

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      raisedAmount,
      donorCount,
    },
  })

  return { raisedAmount, donorCount }
}

async function main() {
  const fundraiser = await findFundraiser()
  const campaigns = await findCampaigns(fundraiser.id)
  const hashedPassword = await bcrypt.hash(DONOR_PASSWORD, 10)

  let createdUsers = 0
  let updatedUsers = 0
  let createdDonations = 0
  let updatedDonations = 0

  for (const campaign of campaigns) {
    console.log(`\nImporting recipients for: ${campaign.title}`)

    for (const donor of donors) {
      const { user, created } = await upsertDonorUser(donor, hashedPassword)
      if (created) createdUsers += 1
      else updatedUsers += 1

      const donationCreated = await upsertDonation({ campaign, donor, user })
      if (donationCreated) {
        createdDonations += 1
        console.log(`Created donation: ${donor.email}`)
      } else {
        updatedDonations += 1
        console.log(`Updated existing donation: ${donor.email}`)
      }
    }

    const totals = await refreshCampaignTotals(campaign.id)
    console.log(
      `Updated campaign totals: raisedAmount=${totals.raisedAmount}, donorCount=${totals.donorCount}`
    )
  }

  console.log('\nDone.')
  console.log(`Created users: ${createdUsers}`)
  console.log(`Updated users: ${updatedUsers}`)
  console.log(`Created donations: ${createdDonations}`)
  console.log(`Updated donations: ${updatedDonations}`)

  for (const title of CAMPAIGN_TITLES) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        organiserId: fundraiser.id,
        title,
      },
      select: {
        id: true,
        title: true,
        raisedAmount: true,
        donorCount: true,
      },
    })

    const recipients = await prisma.donation.findMany({
      where: {
        campaignId: campaign.id,
        status: 'completed',
      },
      select: {
        donorName: true,
        donorEmail: true,
        amount: true,
      },
      orderBy: {
        amount: 'asc',
      },
    })

    console.log(`\nRecipients for "${campaign.title}":`)
    console.table(recipients)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
