/**
 * Creates/updates a fund raiser test account for Kim.
 *
 * Run with:
 *   node scripts/create_kim_fundraiser_account.js
 *
 * Login:
 *   Email:    kimsspamv2@gmail.com
 *   Password: Demo1234@
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const FUNDRAISER = {
  email: 'kimsspamv2@gmail.com',
  password: 'Demo1234@',
  firstName: 'Thomas',
  lastName: 'Tan',
  role: 'fund_raiser',
  isVerified: true,
  status: 'active',
  location: 'Singapore',
  bio: 'Demo fund raiser account for email automation and campaign testing.',
}

async function main() {
  const hashedPassword = await bcrypt.hash(FUNDRAISER.password, 10)

  const existing = await prisma.user.findUnique({
    where: { email: FUNDRAISER.email },
  })

  const user = existing
    ? await prisma.user.update({
        where: { email: FUNDRAISER.email },
        data: {
          password: hashedPassword,
          firstName: FUNDRAISER.firstName,
          lastName: FUNDRAISER.lastName,
          role: FUNDRAISER.role,
          isVerified: FUNDRAISER.isVerified,
          status: FUNDRAISER.status,
          location: FUNDRAISER.location,
          bio: FUNDRAISER.bio,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isVerified: true,
        },
      })
    : await prisma.user.create({
        data: {
          email: FUNDRAISER.email,
          password: hashedPassword,
          firstName: FUNDRAISER.firstName,
          lastName: FUNDRAISER.lastName,
          role: FUNDRAISER.role,
          isVerified: FUNDRAISER.isVerified,
          status: FUNDRAISER.status,
          location: FUNDRAISER.location,
          bio: FUNDRAISER.bio,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isVerified: true,
        },
      })

  console.log(existing ? 'Updated existing fund raiser account.' : 'Created fund raiser account.')
  console.table([user])
  console.log('\nLogin details:')
  console.log(`Email: ${FUNDRAISER.email}`)
  console.log(`Password: ${FUNDRAISER.password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
