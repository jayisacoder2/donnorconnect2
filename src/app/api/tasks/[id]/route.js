// Task API - Get, Update, Delete
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma, TaskStatus, TaskPriority } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          {
            donor: {
              organizationId: session.user.organizationId,
            },
          },
          {
            assignedUser: {
              organizationId: session.user.organizationId,
            },
          },
          {
            AND: [
              { donorId: null },
              { assignedTo: null },
            ],
          },
        ],
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate, assignedTo } = body
    
    console.log('PATCH /api/tasks/[id]:', { id, body, orgId: session.user.organizationId })

    // Verify task belongs to organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          {
            donor: {
              organizationId: session.user.organizationId,
            },
          },
          {
            assignedUser: {
              organizationId: session.user.organizationId,
            },
          },
        ],
      },
    })

    console.log('Existing task found:', existingTask ? 'YES' : 'NO')

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) {
      // Ensure status is a valid TaskStatus enum value
      updateData.status = TaskStatus[status] || status
      if (status === 'DONE' && !existingTask.completedAt) {
        updateData.completedAt = new Date()
      } else if (status !== 'DONE') {
        updateData.completedAt = null
      }
    }
    if (priority !== undefined) {
      // Ensure priority is a valid TaskPriority enum value
      updateData.priority = TaskPriority[priority] || priority
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify task belongs to organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          {
            donor: {
              organizationId: session.user.organizationId,
            },
          },
          {
            assignedUser: {
              organizationId: session.user.organizationId,
            },
          },
        ],
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
