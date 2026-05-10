import { NextResponse } from 'next/server'

// NextAuth server integration removed (migrated to Firebase Auth).
// Return 410 Gone for any calls to this endpoint.

export async function GET() {
	return NextResponse.json({ error: 'NextAuth removed. Use Firebase Auth on client.' }, { status: 410 })
}

export async function POST() {
	return NextResponse.json({ error: 'NextAuth removed. Use Firebase Auth on client.' }, { status: 410 })
}