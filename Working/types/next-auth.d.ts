declare module 'next-auth' {
  // Keep type-only declarations. Avoid importing `next-auth` at the top-level
  // to prevent TypeScript from requiring the runtime package during build.
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}