/**
 * Health Check API Endpoint
 * Used to verify the server and database are running correctly
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const checks = {
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    databaseUrlSet: !!process.env.DATABASE_URL,
    database: false,
    error: null,
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    checks.ok = false
    checks.error = error.message
  }

  return NextResponse.json(checks)
}
