// Manual workflow execution endpoint
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { executeWorkflow } from '@/lib/api/workflows'

export async function POST(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: workflowId } = await params
    const body = await request.json()
    const { donorId, context } = body

    // Execute the workflow
    const execution = await executeWorkflow({
      workflowId,
      donorId: donorId || null,
      executedById: session.user.id,
      context: {
        ...context,
        manualTrigger: true,
        triggeredBy: `${session.user.firstName} ${session.user.lastName}`,
      },
    })

    return NextResponse.json({ 
      execution: {
        id: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
      },
    })
  } catch (error) {
    console.error('Manual workflow execution error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to execute workflow',
    }, { status: 500 })
  }
}
