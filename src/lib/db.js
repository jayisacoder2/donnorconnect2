// Prisma Client Singleton
// Ensures single instance in development (prevents hot reload issues)

import prisma from '../../prisma/client.js'

// Export Prisma enums - using direct string values since generated client uses CommonJS
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

export const DonorStatus = {
  ACTIVE: 'ACTIVE',
  LAPSED: 'LAPSED',
  INACTIVE: 'INACTIVE',
  DO_NOT_CONTACT: 'DO_NOT_CONTACT'
}

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
}

export const UserRole = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  MARKETING: 'MARKETING',
  READONLY: 'READONLY'
}

export const DonationType = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING',
  PLEDGE: 'PLEDGE',
  IN_KIND: 'IN_KIND'
}

export const RetentionRisk = {
  UNKNOWN: 'UNKNOWN',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
}

export const WorkflowTrigger = {
  FIRST_DONATION: 'FIRST_DONATION',
  DONATION_RECEIVED: 'DONATION_RECEIVED',
  INACTIVITY_THRESHOLD: 'INACTIVITY_THRESHOLD',
  SEGMENT_ENTRY: 'SEGMENT_ENTRY',
  MANUAL: 'MANUAL',
  SCHEDULED: 'SCHEDULED'
}

export const InteractionType = {
  EMAIL: 'EMAIL',
  PHONE_CALL: 'PHONE_CALL',
  MEETING: 'MEETING',
  NOTE: 'NOTE'
}

export { prisma }
export default prisma
