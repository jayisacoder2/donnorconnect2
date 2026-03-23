// vitest-environment node

/**
 * API Route Tests: GET /api/campaigns, POST /api/campaigns
 * Tests campaign listing and creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/campaigns/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'
import { createTestCampaign } from '../../helpers/test-data'

// Mock dependencies
vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    campaign: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('GET /api/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('GET', '/api/campaigns')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return paginated campaigns for authenticated user', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'STAFF', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const mockCampaigns = [
      createTestCampaign({ id: '1', name: 'Annual Fund', organizationId: 'org-123' }),
      createTestCampaign({ id: '2', name: 'Spring Gala', organizationId: 'org-123' }),
    ]

    prisma.campaign.findMany.mockResolvedValue(mockCampaigns)
    prisma.campaign.count.mockResolvedValue(2)

    const request = createMockRequest('GET', '/api/campaigns?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.campaigns).toHaveLength(2)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(2)

    // Verify organization filtering
    expect(prisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-123',
        }),
      })
    )
  })

  it('should filter campaigns by status', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.campaign.findMany.mockResolvedValue([])
    prisma.campaign.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/campaigns?status=ACTIVE')
    await GET(request)

    expect(prisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
        }),
      })
    )
  })

  it('should filter campaigns by search term', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.campaign.findMany.mockResolvedValue([])
    prisma.campaign.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/campaigns?search=annual')
    await GET(request)

    expect(prisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'annual' }) }),
          ]),
        }),
      })
    )
  })
})

describe('POST /api/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('POST', '/api/campaigns', {
      name: 'Test Campaign',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 for READONLY role', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(createMockSession({ role: 'READONLY' }))

    const request = createMockRequest('POST', '/api/campaigns', {
      name: 'Test Campaign',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should create campaign for authorized user', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'ADMIN', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const mockCampaign = createTestCampaign({
      id: 'campaign-1',
      name: 'New Campaign',
      organizationId: 'org-123',
    })
    prisma.campaign.create.mockResolvedValue(mockCampaign)

    const request = createMockRequest('POST', '/api/campaigns', {
      name: 'New Campaign',
      description: 'Test description',
      goal: 10000,
      status: 'DRAFT',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.campaign).toBeDefined()
    expect(data.campaign.name).toBe('New Campaign')

    expect(prisma.campaign.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'New Campaign',
          organizationId: 'org-123',
        }),
      })
    )
  })

  it('should allow STAFF role to create campaigns', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'STAFF' }))
    prisma.campaign.create.mockResolvedValue(createTestCampaign())

    const request = createMockRequest('POST', '/api/campaigns', {
      name: 'Staff Campaign',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })

  it('should allow MARKETING role to create campaigns', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'MARKETING' }))
    prisma.campaign.create.mockResolvedValue(createTestCampaign())

    const request = createMockRequest('POST', '/api/campaigns', {
      name: 'Marketing Campaign',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })
})
