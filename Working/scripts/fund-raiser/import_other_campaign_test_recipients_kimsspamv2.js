/**
 * Imports test recipient/donor records into the remaining Kim test campaigns.
 *
 * Run after these scripts:
 *   node scripts/create_kim_fundraiser_account.js
 *   node scripts/import_campaigns_kimsspamv2.js
 *   node scripts/import_two_campaign_test_recipients_kimsspamv2.js
 *
 * This script excludes the two campaigns already handled by:
 *   - Emergency Food Relief for Flood Victims
 *   - Rural Clinic Medical Equipment Drive
 *
 * It creates 6 donor users per remaining campaign using Gmail aliases:
 *   kimsspamv2+11@gmail.com onwards
 *
 * The script is idempotent. Existing donor users/donations are updated instead
 * of duplicated when the script is rerun.
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const FUNDRAISER_EMAIL = 'kimsspamv2@gmail.com'
const DONOR_PASSWORD = 'Demo1234@'
const DONORS_PER_CAMPAIGN = 6

// These are the other campaigns from import_campaigns_kimsspamv2.js.
// The first recipient script already covers Emergency Food Relief and Rural Clinic.
const TARGET_CAMPAIGN_TITLES = [
  'Help Maya Get Her Life-Saving Surgery',
  'Rebuild Riverside Community Center After Fire',
  'Scholarships for Underprivileged STEM Students',
  'Save the Ocean Ridge Wildlife Sanctuary',
  'Youth Soccer League Equipment Fund',
  'Community Garden Revitalization Project',
  'Independent Film: Stories of Resilience',
  'Memorial Fund for Officer James Patterson',
  'School Library Renovation Project',
  'Homeless Veterans Support Program',
  'Clean Water Filters for Remote Villages',
  'Accessible Playground for Maple Park',
  'Emergency Vet Care for Rescued Shelter Pets',
]

const donorNamePool = [
  ['Olivia', 'Chen'],
  ['Ryan', 'Ng'],
  ['Amelia', 'Tan'],
  ['Lucas', 'Wong'],
  ['Hannah', 'Lim'],
  ['Arjun', 'Patel'],
  ['Nadia', 'Rahman'],
  ['Ben', 'Lee'],
  ['Grace', 'Ho'],
  ['Isaac', 'Koh'],
  ['Mira', 'Singh'],
  ['Leo', 'Teo'],
]

const amountPool = [35, 50, 75, 100, 125, 150]

function buildDonorsForCampaign(campaignIndex, campaignTitle) {
  const startAliasNumber = 11 + campaignIndex * DONORS_PER_CAMPAIGN

  return Array.from({ length: DONORS_PER_CAMPAIGN }, (_, donorIndex) => {
    const aliasNumber = startAliasNumber + donorIndex
    const [firstName, lastName] = donorNamePool[(campaignIndex + donorIndex) % donorNamePool.length]

    return {
      firstName,
      lastName,
      email: `kimsspamv2+${aliasNumber}@gmail.com`,
      amount: amountPool[donorIndex % amountPool.length],
      message: `Test donor ${aliasNumber} for ${campaignTitle}.`,
    }
  })
}

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

async function findCampaign(fundraiserId, title) {
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

  return campaign
}

async function upsertDonorUser(donor, hashedPassword) {
  const existing = await prisma.user.findUnique({
    where: { email: donor.email },
  })

  const data = {
    email: donor.email,
    password: hashedPassword,
    firstName: donor.firstName,
    lastName: donor.lastName,
    role: 'donor',
    isVerified: true,
    status: 'active',
    location: 'Singapore',
  }

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: donor.email },
      data,
    })

    return { user: updated, created: false }
  }

  const created = await prisma.user.create({ data })
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
  const hashedPassword = await bcrypt.hash(DONOR_PASSWORD, 10)

  let createdUsers = 0
  let updatedUsers = 0
  let createdDonations = 0
  let updatedDonations = 0

  for (let campaignIndex = 0; campaignIndex < TARGET_CAMPAIGN_TITLES.length; campaignIndex += 1) {
    const title = TARGET_CAMPAIGN_TITLES[campaignIndex]
    const campaign = await findCampaign(fundraiser.id, title)
    const donors = buildDonorsForCampaign(campaignIndex, title)

    console.log(`\nImporting ${donors.length} recipients for: ${campaign.title}`)

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
  console.log(`Target campaigns: ${TARGET_CAMPAIGN_TITLES.length}`)
  console.log(`Donors per campaign: ${DONORS_PER_CAMPAIGN}`)
  console.log(`Created users: ${createdUsers}`)
  console.log(`Updated users: ${updatedUsers}`)
  console.log(`Created donations: ${createdDonations}`)
  console.log(`Updated donations: ${updatedDonations}`)

  const summary = await prisma.campaign.findMany({
    where: {
      organiserId: fundraiser.id,
      title: { in: TARGET_CAMPAIGN_TITLES },
    },
    select: {
      title: true,
      raisedAmount: true,
      donorCount: true,
    },
    orderBy: {
      title: 'asc',
    },
  })

  console.log('\nCampaign summary:')
  console.table(summary)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
