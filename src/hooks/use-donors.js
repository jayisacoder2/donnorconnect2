// React hook for donor data management
import { useState, useEffect } from 'react'

/**
 * TODO: Hook to fetch and manage donors list
 * @param {number} page - Page number for pagination
 * @param {number} limit - Items per page
 * @param {Object} filters - Search and filter options
 * @returns {Object} { donors, loading, error, refetch }
 */
export function useDonors(page = 1, limit = 20, filters = {}) {
  const [donors, setDonors] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page, limit })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const buildQuery = () => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('limit', limit)
    params.set('sortBy', filters.sortBy || 'createdAt')
    params.set('sortOrder', filters.sortOrder || 'desc')
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.retentionRisk) params.set('retentionRisk', filters.retentionRisk)
    return params.toString()
  }

  const fetchDonors = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/donors?${buildQuery()}`)
      if (!res.ok) throw new Error('Failed to fetch donors')
      const data = await res.json()
      setDonors(data.donors || [])
      setPagination(data.pagination || { total: 0, page, limit })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.search, filters.status, filters.retentionRisk, filters.sortBy, filters.sortOrder])

  return { donors, pagination, loading, error, refetch: fetchDonors }
}

/**
 * TODO: Hook to fetch single donor
 * @param {string} donorId - Donor ID
 * @returns {Object} { donor, loading, error, refetch }
 */
export function useDonor(donorId) {
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDonor = async () => {
    if (!donorId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/donors/${donorId}`)
      if (!res.ok) throw new Error('Failed to fetch donor')
      const data = await res.json()
      setDonor(data.donor || null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donorId])

  return { donor, loading, error, refetch: fetchDonor }
}