// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDonorMetrics } from '@/lib/api/donors'

// Mock Prisma with all needed methods
vi.mock('@/lib/db', () => ({
  prisma: {
    donation: {
      findMany: vi.fn(),
    },
    donor: {
      update: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
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

describe('Donor API utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateDonorMetrics', () => {
    // Helper to set up common mocks for refreshSegmentsForDonor
    const setupSegmentMocks = async () => {
      const { prisma } = await import('@/lib/db')
      prisma.donor.findUnique.mockResolvedValue({
        id: 'donor-123',
        organizationId: 'org-123',
        totalAmount: 100,
        totalGifts: 1,
        status: 'ACTIVE',
      })
      prisma.segment.findMany.mockResolvedValue([])
      prisma.segmentMember.groupBy.mockResolvedValue([])
      return prisma
    }

    it('should calculate metrics for donor with one gift', async () => {
      const prisma = await setupSegmentMocks()

      const mockDonations = [
        {
          amount: 100,
          receivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          totalGifts: 1,
          totalAmount: 100,
          retentionRisk: expect.any(String),
        }),
      })
    })

    it('should mark donor as CRITICAL after 365+ days inactivity', async () => {
      const prisma = await setupSegmentMocks()

      const mockDonations = [
        {
          amount: 100,
          receivedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days ago
        },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          retentionRisk: 'CRITICAL',
        }),
      })
    })

    it('should calculate total amount correctly for multiple donations', async () => {
      const prisma = await setupSegmentMocks()

      const mockDonations = [
        { amount: 100, receivedAt: new Date() },
        { amount: 200, receivedAt: new Date() },
        { amount: 150, receivedAt: new Date() },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          totalGifts: 3,
          totalAmount: 450,
        }),
      })
    })
  })
})
