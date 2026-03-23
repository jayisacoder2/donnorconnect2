// Authentication utilities
import { prisma } from './db'
import { hashPassword, verifyPassword } from './password'

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
export async function register(userData) {
  const { email, password, firstName, lastName, role = 'STAFF', organizationId } = userData || {}

  if (!email || !password || !firstName || !lastName || !organizationId) {
    throw new Error('Missing required fields')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('User already exists')
  }

  const hashed = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role,
      organizationId,
    },
  })

  const { password: _pw, ...safeUser } = user
  return safeUser
}

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null if invalid
 */
export async function login(email, password) {
  if (!email || !password) return null

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  const { password: _pw, ...safeUser } = user
  return safeUser
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  })

  if (!user) return null
  const { password: _pw, ...safeUser } = user
  return safeUser
}