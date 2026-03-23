// React hook for segment data management
import { useState, useEffect } from 'react'

export function useSegments(page = 1, limit = 20, filters = {}, options = {}) {
	const [segments, setSegments] = useState([])
	const [pagination, setPagination] = useState({ total: 0, page, limit })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
  const pollMs = Number(options.pollMs || 0)

	const buildQuery = () => {
		const params = new URLSearchParams()
		params.set('page', page)
		params.set('limit', limit)
		if (filters.search) params.set('search', filters.search)
		if (filters.sortBy) params.set('sortBy', filters.sortBy)
		if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
		return params.toString()
	}

	const fetchSegments = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/segments?${buildQuery()}`)
			if (!res.ok) throw new Error('Failed to fetch segments')
			const data = await res.json()
			setSegments(data.segments || [])
			setPagination(data.pagination || { total: 0, page, limit })
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSegments()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, limit, filters.search, filters.sortBy, filters.sortOrder])

  // Optional polling to keep counts fresh
  useEffect(() => {
    if (!pollMs || pollMs < 1000) return
    const id = setInterval(fetchSegments, pollMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs, page, limit, filters.search, filters.sortBy, filters.sortOrder])

	return { segments, pagination, loading, error, refetch: fetchSegments }
}