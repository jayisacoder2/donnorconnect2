/**
 * Sample Donors Endpoint (No Authentication Required)
 * For testing purposes only
 */

import { NextResponse } from 'next/server'

export async function GET() {
  // Hard-coded sample donor data for testing
  const sampleDonors = [
    {
      id: 'sample-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      status: 'ACTIVE',
      totalAmount: 5000,
      totalGifts: 12,
      lastGiftDate: '2025-11-15',
      retentionRisk: 'LOW',
    },
    {
      id: 'sample-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 234-5678',
      status: 'ACTIVE',
      totalAmount: 15000,
      totalGifts: 24,
      lastGiftDate: '2025-12-01',
      retentionRisk: 'LOW',
    },
    {
      id: 'sample-3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mbrown@example.com',
      phone: '(555) 345-6789',
      status: 'LAPSED',
      totalAmount: 2500,
      totalGifts: 5,
      lastGiftDate: '2024-08-20',
      retentionRisk: 'HIGH',
    },
    {
      id: 'sample-4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '(555) 456-7890',
      status: 'ACTIVE',
      totalAmount: 8000,
      totalGifts: 16,
      lastGiftDate: '2025-12-10',
      retentionRisk: 'LOW',
    },
    {
      id: 'sample-5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'dwilson@example.com',
      phone: '(555) 567-8901',
      status: 'INACTIVE',
      totalAmount: 1000,
      totalGifts: 2,
      lastGiftDate: '2023-12-15',
      retentionRisk: 'CRITICAL',
    },
  ]

  return NextResponse.json({
    donors: sampleDonors,
    total: sampleDonors.length,
    page: 1,
    limit: 10,
    message: 'Sample donor data for testing (no authentication required)',
  })
}
