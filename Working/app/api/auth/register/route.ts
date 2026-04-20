import { NextResponse } from 'next/server'

// This server-side registration endpoint has been removed as part of the
// migration to Firebase Authentication + Firestore (client-side).
// Keep a minimal handler that returns 410 Gone so that any unexpected
// server requests get a clear response instead of runtime errors.

export async function POST() {
  return NextResponse.json({ error: 'Endpoint removed. Use Firebase Auth on client.' }, { status: 410 })
}