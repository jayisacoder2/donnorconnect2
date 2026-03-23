// Zod validation schemas for workflow operations
import { z } from 'zod'

export const WorkflowTriggerEnum = z.enum([
	'FIRST_DONATION',
	'DONATION_RECEIVED',
	'INACTIVITY_THRESHOLD',
	'SEGMENT_ENTRY',
	'MANUAL',
	'SCHEDULED',
])

// Flexible step schema to support various step types
const workflowStepSchema = z.object({
	type: z.enum(['email', 'task', 'wait']),
	// Email step fields
	subject: z.string().optional(),
	body: z.string().optional(),
	template: z.string().optional(),
	// Task step fields
	title: z.string().optional(),
	description: z.string().optional(),
	assignTo: z.string().optional(),
	priority: z.enum(['low', 'normal', 'high', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
	// Wait step fields
	days: z.coerce.number().min(0).optional(),
	hours: z.coerce.number().min(0).max(23).optional(),
	// Legacy/compatibility fields
	delay: z.coerce.number().min(0).optional(),
	metadata: z.record(z.any()).optional(),
}).passthrough() // Allow additional fields for flexibility

export const createWorkflowSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(150),
	description: z.string().trim().max(1000).optional().nullable().or(z.literal('').transform(() => null)),
	segmentId: z.string().cuid().nullable().optional(),
	trigger: WorkflowTriggerEnum,
	steps: z.array(workflowStepSchema).min(1, 'At least one step is required'),
	isActive: z.boolean().default(false),
})

export const updateWorkflowSchema = createWorkflowSchema.partial()

export const workflowListQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	search: z.string().trim().optional(),
	isActive: z.coerce.boolean().optional(),
	trigger: WorkflowTriggerEnum.optional(),
	sortBy: z.enum(['name', 'createdAt', 'trigger', 'isActive']).default('name'),
	sortOrder: z.enum(['asc', 'desc']).default('asc'),
})