// node scripts/fund-raiser/create_kim_donor_account.js

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const email = "kimsspamv2+donor@gmail.com"
  const password = "Demo1234@"

  const hashedPassword = await bcrypt.hash(password, 10)

  const donor = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName: "Sharon",
      lastName: "Tan",
      role: "donor",
      status: "active",
      isVerified: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: "Sharon",
      lastName: "Tan",
      role: "donor",
      status: "active",
      isVerified: true,
    },
  })

  console.log("Donor account created/updated:")
  console.log({
    id: donor.id,
    email: donor.email,
    firstName: donor.firstName,
    lastName: donor.lastName,
    role: donor.role,
    status: donor.status,
    isVerified: donor.isVerified,
  })
}

main()
  .catch((error) => {
    console.error("Failed to create donor account:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })