// Test data factory functions

import { randomUUID } from 'crypto'

export function createTestDonor(overrides = {}) {
  const uuid = randomUUID().slice(0, 8)

  return {
    id: overrides.id || randomUUID(),
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'Donor',
    email: overrides.email || `donor-${uuid}@example.com`,
    phone: overrides.phone || '555-1234',
    address: overrides.address || '123 Test St',
    city: overrides.city || 'Test City',
    state: overrides.state || 'CA',
    zipCode: overrides.zipCode || '12345',
    organizationId: overrides.organizationId || 'test-org-1',
    status: overrides.status || 'ACTIVE',
    retentionRisk: overrides.retentionRisk || 'LOW',
    totalGifts: overrides.totalGifts ?? 0,
    totalAmount: overrides.totalAmount ?? 0,
    firstGiftDate: overrides.firstGiftDate || null,
    lastGiftDate: overrides.lastGiftDate || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestDonation(donorId, overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    donorId,
    campaignId: overrides.campaignId || null,
    amount: overrides.amount ?? 100,
    date: overrides.date || new Date(),
    type: overrides.type || 'ONE_TIME',
    method: overrides.method || 'Credit Card',
    notes: overrides.notes || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestCampaign(overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    name: overrides.name || 'Test Campaign',
    description: overrides.description || 'Annual Fund 2024',
    goal: overrides.goal ?? 50000,
    organizationId: overrides.organizationId || 'test-org-1',
    status: overrides.status || 'ACTIVE',
    type: overrides.type || 'Annual Fund',
    startDate: overrides.startDate || new Date(),
    endDate: overrides.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestUser(overrides = {}) {
  const uuid = randomUUID().slice(0, 8)

  return {
    id: overrides.id || randomUUID(),
    email: overrides.email || `user-${uuid}@example.com`,
    password: overrides.password || 'hashedpassword123', // Should be hashed in real tests
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    role: overrides.role || 'STAFF',
    organizationId: overrides.organizationId || 'test-org-1',
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestSegment(overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    name: overrides.name || 'Test Segment',
    description: overrides.description || 'High-value donors',
    organizationId: overrides.organizationId || 'test-org-1',
    rules: overrides.rules || {
      totalAmount: { gte: 1000 },
      retentionRisk: { in: ['LOW', 'MEDIUM'] },
    },
    memberCount: overrides.memberCount ?? 0,
    lastCalculated: overrides.lastCalculated || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestWorkflow(overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    name: overrides.name || 'Test Workflow',
    description: overrides.description || 'Welcome new donors',
    organizationId: overrides.organizationId || 'test-org-1',
    segmentId: overrides.segmentId || null,
    trigger: overrides.trigger || 'FIRST_DONATION',
    steps: overrides.steps || [
      { type: 'email', template: 'welcome', delay: 0 },
      { type: 'task', title: 'Follow up call', delay: 7 },
    ],
    isActive: overrides.isActive ?? false,
    executionCount: overrides.executionCount ?? 0,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export async function seedTestDonors(prisma, count = 5) {
  const donors = []

  for (let i = 0; i < count; i++) {
    const donor = await prisma.donor.create({
      data: createTestDonor({
        firstName: `Donor${i}`,
        email: `donor${i}@example.com`,
      }),
    })

    // Add 1-3 donations per donor
    const donationCount = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < donationCount; j++) {
      await prisma.donation.create({
        data: createTestDonation(donor.id, {
          amount: Math.floor(Math.random() * 1000) + 50,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
        }),
      })
    }

    donors.push(donor)
  }

  return donors
}

export function createTestInteraction(donorId, overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    donorId,
    type: overrides.type || 'NOTE',
    subject: overrides.subject || 'Follow-up conversation',
    notes: overrides.notes || 'Discussed upcoming campaign',
    date: overrides.date || new Date(),
    createdById: overrides.createdById || 'test-user-1',
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}

export function createTestTask(overrides = {}) {
  return {
    id: overrides.id || randomUUID(),
    donorId: overrides.donorId || null,
    assignedTo: overrides.assignedTo || 'test-user-1',
    title: overrides.title || 'Test Task',
    description: overrides.description || 'Complete follow-up',
    status: overrides.status || 'TODO',
    priority: overrides.priority || 'MEDIUM',
    dueDate: overrides.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    completedAt: overrides.completedAt || null,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  }
}
