import { NextResponse } from 'next/server'

// Initial setup is retired. Never reset accounts, allowlists or signup settings.
export async function POST() {
  return NextResponse.json({ error: 'Setup is no longer available' }, { status: 410 })
}
