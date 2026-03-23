// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateDonorMetrics } from '@/lib/api/donors'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search')?.trim() || ''
    const status = url.searchParams.get('status')?.trim()
    const retentionRisk = url.searchParams.get('retentionRisk')?.trim()
    const sortBy = url.searchParams.get('sortBy')?.trim() || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder')?.trim() || 'desc'

    const where = {
      organizationId: session.user.organizationId,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (retentionRisk) {
      where.retentionRisk = retentionRisk
    }

    const skip = (page - 1) * limit
    
    // Build orderBy based on sortBy field
    const validSortFields = ['firstName', 'lastName', 'email', 'totalAmount', 'totalGifts', 'lastGiftDate', 'createdAt']
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc'

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: orderDirection },
      }),
      prisma.donor.count({ where }),
    ])

    return NextResponse.json({
      donors,
      pagination: {
        total,
        page,
        limit,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role
    if (!['ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permission' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, address, city, state, zipCode, status, retentionRisk } = body || {}

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'firstName, lastName, and email are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check for duplicate email within the organization
    const existingDonor = await prisma.donor.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        organizationId: session.user.organizationId,
      },
    })

    if (existingDonor) {
      return NextResponse.json({ error: 'A donor with this email already exists' }, { status: 409 })
    }

    const donor = await prisma.donor.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        status: status || 'ACTIVE',
        retentionRisk: retentionRisk || 'UNKNOWN',
        organizationId: session.user.organizationId,
      },
    })

    // Initialize metrics and segment membership for new donor
    await updateDonorMetrics(donor.id)

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}