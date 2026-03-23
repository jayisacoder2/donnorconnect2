// Tasks API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')?.trim()
    const priority = url.searchParams.get('priority')?.trim()

    // Get tasks where either:
    // 1. Task has a donor that belongs to the org, OR
    // 2. Task has no donor but assigned user is from the org
    const where = {
      OR: [
        {
          donor: {
            organizationId: session.user.organizationId,
          },
        },
        {
          donorId: null,
          assignedUser: {
            organizationId: session.user.organizationId,
          },
        },
      ],
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { donorId, title, description, status, priority, dueDate, assignedTo } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Verify donor belongs to organization if donorId provided
    if (donorId) {
      const donor = await prisma.donor.findFirst({
        where: {
          id: donorId,
          organizationId: session.user.organizationId,
        },
      })
      if (!donor) {
        return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
      }
    }

    const task = await prisma.task.create({
      data: {
        donorId: donorId || null,
        assignedTo: assignedTo || session.user.id,
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
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

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
