// vitest-environment node

/**
 * API Route Tests: GET /api/donations, POST /api/donations
 * Tests donation listing and creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/donations/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'
import { createTestDonation, createTestDonor } from '../../helpers/test-data'

// Mock dependencies
vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    donation: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    donor: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    campaign: {
      findFirst: vi.fn(),
    },
    segment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    segmentMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

// Mock workflow triggers and donor metrics
vi.mock('@/lib/api/donors', () => ({
  updateDonorMetrics: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/api/workflows', () => ({
  triggerWorkflows: vi.fn().mockResolvedValue(undefined),
}))

describe('GET /api/donations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('GET', '/api/donations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return paginated donations for authenticated user', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'STAFF', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const mockDonor = createTestDonor({ id: 'donor-1', organizationId: 'org-123' })
    const mockDonations = [
      { ...createTestDonation('donor-1', { id: '1', amount: 100 }), donor: mockDonor },
      { ...createTestDonation('donor-1', { id: '2', amount: 250 }), donor: mockDonor },
    ]

    prisma.donation.findMany.mockResolvedValue(mockDonations)
    prisma.donation.count.mockResolvedValue(2)

    const request = createMockRequest('GET', '/api/donations?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.donations).toHaveLength(2)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(2)
  })

  it('should filter donations by donor', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donation.findMany.mockResolvedValue([])
    prisma.donation.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/donations?donorId=donor-123')
    await GET(request)

    expect(prisma.donation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          donorId: 'donor-123',
        }),
      })
    )
  })

  it('should filter donations by campaign', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donation.findMany.mockResolvedValue([])
    prisma.donation.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/donations?campaignId=campaign-123')
    await GET(request)

    expect(prisma.donation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          campaignId: 'campaign-123',
        }),
      })
    )
  })
})

describe('POST /api/donations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('POST', '/api/donations', {
      donorId: 'donor-1',
      amount: 100,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 for READONLY role', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(createMockSession({ role: 'READONLY' }))

    const request = createMockRequest('POST', '/api/donations', {
      donorId: 'donor-1',
      amount: 100,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should create donation and update donor totals', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'STAFF', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const mockDonor = createTestDonor({
      id: 'donor-1',
      organizationId: 'org-123',
      totalGifts: 2,
      totalAmount: 500,
    })
    prisma.donor.findFirst.mockResolvedValue(mockDonor)

    const mockDonation = createTestDonation('donor-1', {
      id: 'donation-1',
      amount: 250,
    })
    prisma.donation.create.mockResolvedValue(mockDonation)
    prisma.donor.update.mockResolvedValue({ ...mockDonor, totalGifts: 3, totalAmount: 750 })

    const request = createMockRequest('POST', '/api/donations', {
      donorId: 'donor-1',
      amount: 250,
      date: new Date().toISOString(),
      type: 'ONE_TIME',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.donation).toBeDefined()
    expect(data.donation.amount).toBe(250)

    // Verify donor update was called
    expect(prisma.donor.update).toHaveBeenCalled()
  })

  it('should return 404 if donor not found', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'STAFF', organizationId: 'org-123' }))
    prisma.donor.findFirst.mockResolvedValue(null) // Donor not found

    const request = createMockRequest('POST', '/api/donations', {
      donorId: 'nonexistent-donor',
      amount: 100,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Donor not found')
  })
})
