// vitest-environment node

/**
 * Validation Schema Tests
 * Tests Zod schemas for all major entities
 */

import { describe, it, expect } from 'vitest'
import { createDonorSchema, updateDonorSchema } from '@/lib/validation/donor-schema'
import { createCampaignSchema, updateCampaignSchema, CampaignStatusEnum } from '@/lib/validation/campaign-schema'
import { createDonationSchema } from '@/lib/validation/donation-schema'

describe('Donor Validation Schemas', () => {
  describe('createDonorSchema', () => {
    it('should validate a valid donor', () => {
      const validDonor = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }
      const result = createDonorSchema.safeParse(validDonor)
      expect(result.success).toBe(true)
    })

    it('should require firstName', () => {
      const invalidDonor = {
        lastName: 'Doe',
        email: 'john@example.com',
      }
      const result = createDonorSchema.safeParse(invalidDonor)
      expect(result.success).toBe(false)
    })

    it('should require lastName', () => {
      const invalidDonor = {
        firstName: 'John',
        email: 'john@example.com',
      }
      const result = createDonorSchema.safeParse(invalidDonor)
      expect(result.success).toBe(false)
    })

    it('should validate email format', () => {
      const invalidDonor = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
      }
      const result = createDonorSchema.safeParse(invalidDonor)
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const donorWithOptionals = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        notes: 'Test notes',
      }
      const result = createDonorSchema.safeParse(donorWithOptionals)
      expect(result.success).toBe(true)
    })

    it('should validate status enum', () => {
      const donorWithStatus = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'ACTIVE',
      }
      const result = createDonorSchema.safeParse(donorWithStatus)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const donorWithBadStatus = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'INVALID_STATUS',
      }
      const result = createDonorSchema.safeParse(donorWithBadStatus)
      expect(result.success).toBe(false)
    })
  })

  describe('updateDonorSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        firstName: 'Jane',
      }
      const result = updateDonorSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate email if provided', () => {
      const updateWithBadEmail = {
        email: 'not-valid',
      }
      const result = updateDonorSchema.safeParse(updateWithBadEmail)
      expect(result.success).toBe(false)
    })
  })
})

describe('Campaign Validation Schemas', () => {
  describe('CampaignStatusEnum', () => {
    it('should accept valid statuses', () => {
      expect(CampaignStatusEnum.safeParse('DRAFT').success).toBe(true)
      expect(CampaignStatusEnum.safeParse('ACTIVE').success).toBe(true)
      expect(CampaignStatusEnum.safeParse('COMPLETED').success).toBe(true)
      expect(CampaignStatusEnum.safeParse('ARCHIVED').success).toBe(true)
    })

    it('should reject invalid status', () => {
      expect(CampaignStatusEnum.safeParse('INVALID').success).toBe(false)
    })
  })

  describe('createCampaignSchema', () => {
    it('should validate a valid campaign', () => {
      const validCampaign = {
        name: 'Annual Fund 2024',
      }
      const result = createCampaignSchema.safeParse(validCampaign)
      expect(result.success).toBe(true)
    })

    it('should require name', () => {
      const invalidCampaign = {
        description: 'No name provided',
      }
      const result = createCampaignSchema.safeParse(invalidCampaign)
      expect(result.success).toBe(false)
    })

    it('should reject empty name', () => {
      const invalidCampaign = {
        name: '',
      }
      const result = createCampaignSchema.safeParse(invalidCampaign)
      expect(result.success).toBe(false)
    })

    it('should accept optional goal', () => {
      const campaignWithGoal = {
        name: 'Campaign',
        goal: 50000,
      }
      const result = createCampaignSchema.safeParse(campaignWithGoal)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.goal).toBe(50000)
      }
    })

    it('should coerce goal from string', () => {
      const campaignWithStringGoal = {
        name: 'Campaign',
        goal: '25000',
      }
      const result = createCampaignSchema.safeParse(campaignWithStringGoal)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.goal).toBe(25000)
      }
    })

    it('should transform empty goal to undefined', () => {
      const campaignWithEmptyGoal = {
        name: 'Campaign',
        goal: '',
      }
      const result = createCampaignSchema.safeParse(campaignWithEmptyGoal)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.goal).toBeUndefined()
      }
    })

    it('should default status to DRAFT', () => {
      const campaignNoStatus = {
        name: 'Campaign',
      }
      const result = createCampaignSchema.safeParse(campaignNoStatus)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('DRAFT')
      }
    })

    it('should coerce dates', () => {
      const campaignWithDates = {
        name: 'Campaign',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }
      const result = createCampaignSchema.safeParse(campaignWithDates)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date)
        expect(result.data.endDate).toBeInstanceOf(Date)
      }
    })
  })

  describe('updateCampaignSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        status: 'ACTIVE',
      }
      const result = updateCampaignSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })
  })
})

describe('Donation Validation Schemas', () => {
  describe('createDonationSchema', () => {
    it('should validate a valid donation', () => {
      const validDonation = {
        donorId: 'clxyz123456',
        amount: 100,
        date: new Date().toISOString(),
      }
      const result = createDonationSchema.safeParse(validDonation)
      expect(result.success).toBe(true)
    })

    it('should require donorId', () => {
      const noDonor = {
        amount: 100,
        date: new Date().toISOString(),
      }
      const result = createDonationSchema.safeParse(noDonor)
      expect(result.success).toBe(false)
    })

    it('should require amount', () => {
      const noAmount = {
        donorId: 'clxyz123456',
        date: new Date().toISOString(),
      }
      const result = createDonationSchema.safeParse(noAmount)
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const negativeAmount = {
        donorId: 'clxyz123456',
        amount: -50,
        date: new Date().toISOString(),
      }
      const result = createDonationSchema.safeParse(negativeAmount)
      expect(result.success).toBe(false)
    })

    it('should coerce amount from string', () => {
      const stringAmount = {
        donorId: 'clxyz123456',
        amount: '250.50',
        date: new Date().toISOString(),
      }
      const result = createDonationSchema.safeParse(stringAmount)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(250.50)
      }
    })

    it('should accept optional campaignId', () => {
      const donationWithCampaign = {
        donorId: 'clxyz123456789012345678901',
        amount: 100,
        date: new Date().toISOString(),
        campaignId: 'clabc789012345678901234567',
      }
      const result = createDonationSchema.safeParse(donationWithCampaign)
      expect(result.success).toBe(true)
    })

    it('should transform empty campaignId to null', () => {
      const donationEmptyCampaign = {
        donorId: 'clxyz123456',
        amount: 100,
        date: new Date().toISOString(),
        campaignId: '',
      }
      const result = createDonationSchema.safeParse(donationEmptyCampaign)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.campaignId).toBeNull()
      }
    })

    it('should validate donation type', () => {
      const donationWithType = {
        donorId: 'clxyz123456',
        amount: 100,
        date: new Date().toISOString(),
        type: 'RECURRING',
      }
      const result = createDonationSchema.safeParse(donationWithType)
      expect(result.success).toBe(true)
    })

    it('should reject invalid donation type', () => {
      const invalidType = {
        donorId: 'clxyz123456',
        amount: 100,
        date: new Date().toISOString(),
        type: 'INVALID_TYPE',
      }
      const result = createDonationSchema.safeParse(invalidType)
      expect(result.success).toBe(false)
    })
  })
})
