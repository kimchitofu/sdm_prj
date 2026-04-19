// Prisma client removed for Firebase/Firestore migration.
// This file remains as a stub to avoid build errors from accidental imports.
// If any code tries to use `prisma`, it will throw to make the issue obvious.

export const prisma = new Proxy({}, {
  get() {
    throw new Error('Prisma has been removed in this repository. Use Firestore client instead.')
  }
}) as any