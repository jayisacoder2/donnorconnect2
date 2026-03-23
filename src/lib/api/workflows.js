// Workflow execution engine
import { prisma } from '../db'

/**
 * Trigger workflows based on an event
 * @param {Object} params - Event parameters
 * @param {string} params.trigger - Workflow trigger type (DONATION_RECEIVED, FIRST_DONATION, etc.)
 * @param {string} params.organizationId - Organization ID
 * @param {string} params.donorId - Donor ID (for donor-specific triggers)
 * @param {string} params.segmentId - Segment ID (for SEGMENT_ENTRY)
 * @param {Object} params.context - Additional context data
 * @returns {Promise<void>}
 */
export async function triggerWorkflows(params) {
  const { trigger, organizationId, donorId, segmentId, context = {} } = params

  // Find all active workflows matching this trigger
  const workflows = await prisma.workflow.findMany({
    where: {
      organizationId,
      trigger,
      isActive: true,
    },
    include: {
      segment: true,
    },
  })

  if (!workflows.length) return

  // For segment-specific workflows, filter by segment
  const applicableWorkflows = workflows.filter(wf => {
    if (wf.segmentId && segmentId) {
      return wf.segmentId === segmentId
    }
    // Workflows without segment apply to all
    return !wf.segmentId
  })

  // Execute each workflow
  for (const workflow of applicableWorkflows) {
    await executeWorkflow({
      workflowId: workflow.id,
      donorId,
      context: {
        ...context,
        trigger,
      },
    })
  }
}

/**
 * Execute a workflow (manually or via trigger)
 * @param {Object} params - Execution parameters
 * @param {string} params.workflowId - Workflow ID
 * @param {string} params.donorId - Donor ID (optional, for donor-specific workflows)
 * @param {string} params.executedById - User ID who triggered (optional)
 * @param {Object} params.context - Execution context
 * @returns {Promise<Object>} Workflow execution record
 */
export async function executeWorkflow(params) {
  const { workflowId, donorId, executedById, context = {} } = params

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { organization: true },
  })

  if (!workflow) throw new Error('Workflow not found')

  // Create execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      executedById: executedById || null,
      status: 'running',
      progress: {
        currentStep: 0,
        totalSteps: Array.isArray(workflow.steps) ? workflow.steps.length : 0,
        startedAt: new Date().toISOString(),
        context,
      },
    },
  })

  try {
    // Get donor context if provided
    let donor = null
    if (donorId) {
      donor = await prisma.donor.findUnique({
        where: { id: donorId },
        include: {
          donations: { orderBy: { date: 'desc' }, take: 1 },
        },
      })
    }

    // Execute steps sequentially
    const steps = Array.isArray(workflow.steps) ? workflow.steps : []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Update progress
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          progress: {
            currentStep: i + 1,
            totalSteps: steps.length,
            lastStepCompleted: step.type,
            context,
          },
        },
      })

      // Execute step
      await executeStep({
        step,
        workflow,
        donor,
        organizationId: workflow.organizationId,
        context,
      })
    }

    // Mark as completed
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        progress: {
          currentStep: steps.length,
          totalSteps: steps.length,
          completedAt: new Date().toISOString(),
          context,
        },
      },
    })

    // Increment execution count
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { executionCount: { increment: 1 } },
    })

    return execution
  } catch (error) {
    // Mark as failed
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error.message || 'Execution failed',
      },
    })

    console.error('Workflow execution failed:', error)
    throw error
  }
}

/**
 * Execute a single workflow step
 * @param {Object} params - Step execution parameters
 * @param {Object} params.step - Step configuration
 * @param {Object} params.workflow - Workflow object
 * @param {Object} params.donor - Donor object (if applicable)
 * @param {string} params.organizationId - Organization ID
 * @param {Object} params.context - Execution context
 * @returns {Promise<void>}
 */
async function executeStep(params) {
  const { step, workflow, donor, organizationId, context } = params

  switch (step.type) {
    case 'email':
      await executeEmailStep({ step, workflow, donor, context })
      break

    case 'task':
      await executeTaskStep({ step, workflow, donor, organizationId, context })
      break

    case 'wait':
      // In a real implementation, this would schedule the next step
      // For now, we'll simulate immediate execution with logging
      const waitDays = step.days || 0
      const waitHours = step.hours || 0
      console.log(`Wait step: ${waitDays} days, ${waitHours} hours (simulated - executing immediately)`)
      break

    default:
      console.warn(`Unknown step type: ${step.type}`)
  }
}

/**
 * Execute an email step (simulated - no actual email sending)
 */
async function executeEmailStep({ step, workflow, donor, context }) {
  console.log('=== EMAIL STEP EXECUTED ===')
  console.log('Workflow:', workflow.name)
  console.log('Subject:', step.subject)
  console.log('To:', donor ? `${donor.firstName} ${donor.lastName} <${donor.email}>` : 'No recipient')
  console.log('Body:', step.body)
  console.log('Context:', context)
  console.log('=========================')

  // TODO: Integrate with email service (SendGrid, Postmark, etc.)
  // For now, we just log that the email would be sent
}

/**
 * Execute a task creation step
 */
async function executeTaskStep({ step, workflow, donor, organizationId, context }) {
  // Map lowercase priority to database enum (uppercase)
  const priorityMap = {
    'low': 'LOW',
    'normal': 'MEDIUM',
    'high': 'HIGH',
  }
  const priority = priorityMap[step.priority] || step.priority?.toUpperCase() || 'MEDIUM'
  
  const task = await prisma.task.create({
    data: {
      title: step.title || 'Workflow Task',
      description: step.description || `Created by workflow: ${workflow.name}`,
      donorId: donor?.id || null,
      assignedTo: step.assignTo || step.assignedTo || null,
      status: 'TODO',
      priority,
      dueDate: step.dueDate ? new Date(step.dueDate) : null,
    },
  })

  console.log(`Task created: ${task.title} (ID: ${task.id})`)
  return task
}

/**
 * Check for scheduled workflows and execute them
 * This should be called by a cron job or scheduled task
 */
export async function executeScheduledWorkflows() {
  const scheduledWorkflows = await prisma.workflow.findMany({
    where: {
      trigger: 'SCHEDULED',
      isActive: true,
    },
  })

  for (const workflow of scheduledWorkflows) {
    // Check if workflow should run based on schedule in steps
    // For simplicity, we'll execute all scheduled workflows
    await executeWorkflow({
      workflowId: workflow.id,
      context: { scheduledExecution: true },
    })
  }
}

/**
 * Check for inactivity thresholds and trigger workflows
 * This should be called by a cron job or scheduled task
 */
export async function checkInactivityThresholds(organizationId) {
  const inactivityWorkflows = await prisma.workflow.findMany({
    where: {
      organizationId,
      trigger: 'INACTIVITY_THRESHOLD',
      isActive: true,
    },
  })

  if (!inactivityWorkflows.length) return

  // Find donors who haven't donated in X days
  const donors = await prisma.donor.findMany({
    where: {
      organizationId,
      lastGiftDate: { not: null },
    },
  })

  for (const donor of donors) {
    const daysSinceLastGift = Math.floor(
      (Date.now() - new Date(donor.lastGiftDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Check each workflow's threshold
    for (const workflow of inactivityWorkflows) {
      const threshold = workflow.steps?.[0]?.inactivityDays || 90
      if (daysSinceLastGift >= threshold) {
        await executeWorkflow({
          workflowId: workflow.id,
          donorId: donor.id,
          context: { daysSinceLastGift },
        })
      }
    }
  }
}
