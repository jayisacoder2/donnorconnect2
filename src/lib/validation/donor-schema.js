// Zod validation schemas for donor operations
import { z } from 'zod'

// Enumerations used across donor validation
export const DonorStatusEnum = z.enum(['ACTIVE', 'LAPSED', 'INACTIVE', 'DO_NOT_CONTACT'])
export const RetentionRiskEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'])

// Schema for creating donors
export const createDonorSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required').max(50),
	lastName: z.string().trim().min(1, 'Last name is required').max(50),
	email: z.string().trim().email('Valid email required'),
	phone: z.string().trim().max(20).optional().or(z.literal('').transform(() => undefined)),
	address: z.string().trim().max(200).optional().or(z.literal('').transform(() => undefined)),
	city: z.string().trim().max(100).optional().or(z.literal('').transform(() => undefined)),
	state: z.string().trim().max(50).optional().or(z.literal('').transform(() => undefined)),
	zipCode: z.string().trim().max(20).optional().or(z.literal('').transform(() => undefined)),
	status: DonorStatusEnum.default('ACTIVE'),
	retentionRisk: RetentionRiskEnum.default('LOW'),
	notes: z.string().trim().max(1000).optional().or(z.literal('').transform(() => undefined)),
})

// Schema for updating donors (all fields optional)
export const updateDonorSchema = createDonorSchema.partial()

// Query schema for listing donors
export const donorListQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	search: z.string().trim().optional(),
	status: DonorStatusEnum.optional(),
	retentionRisk: RetentionRiskEnum.optional(),
	sortBy: z
		.enum(['firstName', 'lastName', 'email', 'createdAt', 'totalAmount', 'totalGifts'])
		.default('firstName'),
	sortOrder: z.enum(['asc', 'desc']).default('asc'),
})