// Zod validation schemas for donation operations
import { z } from 'zod'

export const DonationTypeEnum = z.enum(['ONE_TIME', 'RECURRING', 'PLEDGE', 'IN_KIND'])

export const createDonationSchema = z.object({
	donorId: z.string().cuid(),
	campaignId: z.string().cuid().nullable().optional().or(z.literal('').transform(() => null)),
	amount: z.coerce.number().positive('Amount must be greater than zero'),
	date: z.coerce.date(),
	type: DonationTypeEnum.default('ONE_TIME'),
	method: z.string().trim().max(50).nullable().optional().or(z.literal('').transform(() => null)),
	notes: z.string().trim().max(1000).nullable().optional().or(z.literal('').transform(() => null)),
})

export const updateDonationSchema = createDonationSchema.partial()

// Transform empty strings to undefined so they don't apply as filters
const emptyToUndefined = z.preprocess((val) => (val === '' ? undefined : val), z.string().optional())
const numericFilter = z.preprocess(
	(val) => (val === '' || val === undefined ? undefined : val),
	z.coerce.number().min(0).optional()
)

export const donationListQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	donorId: emptyToUndefined,
	campaignId: emptyToUndefined,
	type: z.preprocess((val) => (val === '' ? undefined : val), DonationTypeEnum.optional()),
	minAmount: numericFilter,
	maxAmount: numericFilter,
	startDate: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.date().optional()),
	endDate: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.date().optional()),
	sortBy: z.enum(['date', 'amount', 'type', 'createdAt']).default('date'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
