// Session management for authentication
import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from './db'
import crypto from 'crypto'

/**
 * Create a new session for a user
 * @param {string} userId - User ID to create session for
 * @returns {Promise<string>} Session token
 */
export async function createSession(userId) {
  if (!userId) return null

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return token
}

/**
 * Get session and user data from session token
 * @param {string} sessionToken - Session token to validate
 * @returns {Promise<Object|null>} Session with user data or null
 */
export async function getSession(sessionToken) {
  if (!sessionToken || typeof sessionToken !== 'string') return null

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: { include: { organization: true } },
    },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token: sessionToken } })
    return null
  }

  return session
}

/**
 * Get current user from session (for server components)
 * @returns {Promise<Object|null>} User object or null
 */
export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = await getSession(token)
  return session?.user || null
}

/**
 * Delete a session (logout)
 * @param {string} sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken) {
  if (!sessionToken) return
  await prisma.session.deleteMany({ where: { token: sessionToken } })
}
