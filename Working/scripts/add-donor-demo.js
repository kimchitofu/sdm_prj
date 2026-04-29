/**
 * Adds the donor demo account if it does not already exist.
 * Safe to run at any time — does NOT wipe existing data.
 *
 * Run with: node scripts/add-donor-demo.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'donor@example.com'

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    // If the account exists but still has the old 'donee' role, fix it
    if (existing.role !== 'donor') {
      await prisma.user.update({ where: { email }, data: { role: 'donor' } })
      console.log(`Updated ${email} role to 'donor'.`)
    } else {
      console.log(`${email} already exists with role 'donor'. Nothing to do.`)
    }
    return
  }

  const password = await bcrypt.hash('Demo1234', 10)

  await prisma.user.create({
    data: {
      email,
      password,
      firstName: 'David',
      lastName: 'Chen',
      role: 'donor',
      isVerified: true,
      status: 'active',
      location: 'Singapore',
    },
  })

  console.log(`Created donor demo account: ${email}  (password: Demo1234)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
