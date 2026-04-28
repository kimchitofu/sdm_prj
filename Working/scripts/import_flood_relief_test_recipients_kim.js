const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const CAMPAIGN_TITLE = 'Flood Relief for Affected Families'

const donors = [
  {
    firstName: 'James',
    lastName: 'Tan',
    email: 'kimsspamv2+1@gmail.com',
    amount: 25,
    message: 'Test donor 1 for email workflow.',
  },
  {
    firstName: 'Chloe',
    lastName: 'Lim',
    email: 'kimsspamv2+2@gmail.com',
    amount: 40,
    message: 'Test donor 2 for email workflow.',
  },
  {
    firstName: 'Marcus',
    lastName: 'Ong',
    email: 'kimsspamv2+3@gmail.com',
    amount: 60,
    message: 'Test donor 3 for email workflow.',
  },
  {
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'kimsspamv2+4@gmail.com',
    amount: 80,
    message: 'Test donor 4 for email workflow.',
  },
  {
    firstName: 'Ethan',
    lastName: 'Koh',
    email: 'kimsspamv2+5@gmail.com',
    amount: 100,
    message: 'Test donor 5 for email workflow.',
  },
]

async function main() {
  const campaign = await prisma.campaign.findFirst({
    where: { title: CAMPAIGN_TITLE },
  })

  if (!campaign) {
    throw new Error(`Campaign not found: ${CAMPAIGN_TITLE}`)
  }

  const seededDonee = await prisma.user.findFirst({
    where: { email: 'donee@example.com' },
    select: { password: true },
  })

  if (!seededDonee?.password) {
    throw new Error(
      'Could not find donee@example.com to reuse a seeded hashed password.'
    )
  }

  let createdUsers = 0
  let createdDonations = 0

  for (const donor of donors) {
    let user = await prisma.user.findUnique({
      where: { email: donor.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: donor.email,
          password: seededDonee.password,
          firstName: donor.firstName,
          lastName: donor.lastName,
          role: 'donee',
          isVerified: true,
          status: 'active',
          location: 'Singapore',
        },
      })
      createdUsers += 1
      console.log(`Created user: ${donor.email}`)
    } else {
      console.log(`User already exists: ${donor.email}`)
    }

    const existingDonation = await prisma.donation.findFirst({
      where: {
        campaignId: campaign.id,
        donorId: user.id,
      },
    })

    if (!existingDonation) {
      await prisma.donation.create({
        data: {
          campaignId: campaign.id,
          donorId: user.id,
          donorName: `${donor.firstName} ${donor.lastName}`,
          donorEmail: donor.email,
          amount: donor.amount,
          status: 'completed',
          message: donor.message,
        },
      })
      createdDonations += 1
      console.log(`Created donation for: ${donor.email}`)
    } else {
      console.log(`Donation already exists for: ${donor.email}`)
    }
  }

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

  console.log('\nDone.')
  console.log(`Created users: ${createdUsers}`)
  console.log(`Created donations: ${createdDonations}`)
  console.log(`\nRecipients for "${CAMPAIGN_TITLE}":`)
  console.table(recipients)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })