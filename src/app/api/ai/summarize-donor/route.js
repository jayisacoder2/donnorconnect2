import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { donorId } = await request.json()
    if (!donorId) return NextResponse.json({ error: 'donorId is required' }, { status: 400 })

    const donor = await prisma.donor.findFirst({
      where: { id: donorId, organizationId: session.user.organizationId },
      include: {
        donations: {
          select: { amount: true, date: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 })

    const summaryPayload = {
      name: `${donor.firstName} ${donor.lastName}`.trim(),
      status: donor.status,
      retentionRisk: donor.retentionRisk,
      totalAmount: donor.totalAmount,
      totalGifts: donor.totalGifts,
      lastGiftDate: donor.lastGiftDate,
      notes: donor.notes || null,
      recentDonations: donor.donations.map((d) => ({ amount: d.amount, date: d.date })),
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
    }

    const prompt = `You are a donor success assistant. Summarize this donor in 80-100 words max with risk assessment and suggested next action. Use any notes about the donor to personalize the recommendation. Data: ${JSON.stringify(summaryPayload)}.`

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Be concise, factual, and actionable. Do not invent data.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    })

    if (!aiRes.ok) {
      const errorText = await aiRes.text()
      return NextResponse.json({ error: 'AI request failed', detail: errorText }, { status: 500 })
    }

    const aiJson = await aiRes.json()
    const summary = aiJson.choices?.[0]?.message?.content?.trim() || 'Summary unavailable.'
    return NextResponse.json({ summary })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
