// Zod validation schemas for segment operations
import { z } from 'zod'

const baseRulesSchema = z.object({
	status: z.array(z.string()).optional(),
	retentionRisk: z.array(z.string()).optional(),
	lastGiftDateRange: z
		.object({ start: z.coerce.date().optional(), end: z.coerce.date().optional() })
		.optional(),
	totalGiftAmountRange: z
		.object({ min: z.coerce.number().optional(), max: z.coerce.number().optional() })
		.optional(),
	giftCountRange: z
		.object({ min: z.coerce.number().optional(), max: z.coerce.number().optional() })
		.optional(),
	preferredContactMethod: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
})

export const createSegmentSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(100),
	description: z.string().trim().max(1000).optional().or(z.literal('').transform(() => undefined)),
	rules: baseRulesSchema.default({}),
})

export const updateSegmentSchema = createSegmentSchema.partial()

export const segmentListQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	search: z.string().trim().optional(),
	sortBy: z.enum(['name', 'createdAt', 'memberCount']).default('name'),
	sortOrder: z.enum(['asc', 'desc']).default('asc'),
})