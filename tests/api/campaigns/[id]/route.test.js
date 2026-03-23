// vitest-environment node

/**
 * API Route Tests: DELETE /api/campaigns/[id]
 * Tests campaign deletion including unlinking donations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE, GET, PATCH } from '@/app/api/campaigns/[id]/route'
import { createMockRequest, createMockSession } from '../../../helpers/api-request'
import { createTestCampaign } from '../../../helpers/test-data'

// Mock dependencies
vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    campaign: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    donation: {
      updateMany: vi.fn(),
    },
  },
}))

describe('GET /api/campaigns/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('GET', '/api/campaigns/campaign-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'campaign-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 if campaign not found', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.campaign.findFirst.mockResolvedValue(null)

    const request = createMockRequest('GET', '/api/campaigns/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Not found')
  })

  it('should return campaign with donations', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ organizationId: 'org-123' }))

    const mockCampaign = {
      ...createTestCampaign({ id: 'campaign-1', organizationId: 'org-123' }),
      donations: [
        { id: 'd1', amount: 100, donor: { id: 'donor-1', firstName: 'John', lastName: 'Doe' } },
        { id: 'd2', amount: 200, donor: { id: 'donor-2', firstName: 'Jane', lastName: 'Doe' } },
      ],
    }
    prisma.campaign.findFirst.mockResolvedValue(mockCampaign)

    const request = createMockRequest('GET', '/api/campaigns/campaign-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'campaign-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.campaign).toBeDefined()
    expect(data.campaign.totalRaised).toBe(300)
  })
})

describe('PATCH /api/campaigns/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('PATCH', '/api/campaigns/campaign-1', { name: 'Updated' })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'campaign-1' }) })

    expect(response.status).toBe(401)
  })

  it('should return 403 for READONLY role', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(createMockSession({ role: 'READONLY' }))

    const request = createMockRequest('PATCH', '/api/campaigns/campaign-1', { name: 'Updated' })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'campaign-1' }) })

    expect(response.status).toBe(403)
  })

  it('should update campaign for authorized user', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'ADMIN' }))

    const updatedCampaign = createTestCampaign({ id: 'campaign-1', name: 'Updated Name' })
    prisma.campaign.update.mockResolvedValue(updatedCampaign)

    const request = createMockRequest('PATCH', '/api/campaigns/campaign-1', { name: 'Updated Name' })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'campaign-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.campaign.name).toBe('Updated Name')
  })
})

describe('DELETE /api/campaigns/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('DELETE', '/api/campaigns/campaign-1')
    const response = await DELETE(request, { params: Promise.resolve({ id: 'campaign-1' }) })

    expect(response.status).toBe(401)
  })

  it('should return 403 for non-ADMIN role', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(createMockSession({ role: 'STAFF' }))

    const request = createMockRequest('DELETE', '/api/campaigns/campaign-1')
    const response = await DELETE(request, { params: Promise.resolve({ id: 'campaign-1' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 404 if campaign not found', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'ADMIN', organizationId: 'org-123' }))
    prisma.campaign.findFirst.mockResolvedValue(null)

    const request = createMockRequest('DELETE', '/api/campaigns/nonexistent')
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Campaign not found')
  })

  it('should unlink donations and delete campaign', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'ADMIN', organizationId: 'org-123' }))

    const mockCampaign = createTestCampaign({ id: 'campaign-1', organizationId: 'org-123' })
    prisma.campaign.findFirst.mockResolvedValue(mockCampaign)
    prisma.donation.updateMany.mockResolvedValue({ count: 5 })
    prisma.campaign.delete.mockResolvedValue(mockCampaign)

    const request = createMockRequest('DELETE', '/api/campaigns/campaign-1')
    const response = await DELETE(request, { params: Promise.resolve({ id: 'campaign-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify donations were unlinked first
    expect(prisma.donation.updateMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaign-1' },
      data: { campaignId: null },
    })

    // Then campaign was deleted
    expect(prisma.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } })
  })
})
