// Authentication API - User Registration
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()

    const firstName = body?.firstName?.trim()
    const lastName = body?.lastName?.trim()
    const email = body?.email?.trim()
    const password = body?.password
    const organizationId = body?.organizationId?.trim()
    const organizationName = body?.organizationName?.trim()

    if (!firstName) {
      return NextResponse.json({ error: 'firstName is required' }, { status: 400 })
    }

    if (!lastName) {
      return NextResponse.json({ error: 'lastName is required' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'password must be at least 8 characters' }, { status: 400 })
    }

    if (!organizationId && !organizationName) {
      return NextResponse.json({ error: 'organizationId or organizationName is required' }, { status: 400 })
    }

    let resolvedOrganizationId = organizationId

    if (organizationId) {
      const existingOrg = await prisma.organization.findUnique({ where: { id: organizationId } })
      if (!existingOrg) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
      }
    } else {
      // Generate a URL-friendly slug from the organization name
      const baseSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Ensure slug is unique by appending a number if needed
      let slug = baseSlug
      let slugCounter = 1
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${slugCounter}`
        slugCounter++
      }
      
      const newOrg = await prisma.organization.create({ 
        data: { 
          name: organizationName,
          slug,
          isPublic: true
        } 
      })
      resolvedOrganizationId = newOrg.id
    }

    const user = await register({
      firstName,
      lastName,
      email,
      password,
      organizationId: resolvedOrganizationId,
      role: 'ADMIN',
    })

    const sessionToken = await createSession(user.id)

    const response = NextResponse.json({ user })
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    const message = error?.message || 'Internal server error'

    if (message === 'User already exists') {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    if (message === 'Missing required fields') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}