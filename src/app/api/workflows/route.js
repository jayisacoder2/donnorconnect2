// Workflows API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createWorkflowSchema, workflowListQuerySchema } from '@/lib/validation/workflow-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = workflowListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))

    const where = {
      organizationId: session.user.organizationId,
      ...(params.search
        ? { name: { contains: params.search, mode: 'insensitive' } }
        : {}),
      ...(params.trigger ? { trigger: params.trigger } : {}),
      ...(typeof params.isActive === 'boolean' ? { isActive: params.isActive } : {}),
    }

    const skip = (params.page - 1) * params.limit

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.workflow.count({ where }),
    ])

    return NextResponse.json({ workflows, pagination: { total, page: params.page, limit: params.limit } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createWorkflowSchema.parse(body)

    const workflow = await prisma.workflow.create({
      data: {
        ...data,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
