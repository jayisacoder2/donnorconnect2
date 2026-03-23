// React hook for workflow data management
import { useState, useEffect } from 'react'

export function useWorkflows(page = 1, limit = 20, filters = {}) {
	const [workflows, setWorkflows] = useState([])
	const [pagination, setPagination] = useState({ total: 0, page, limit })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const buildQuery = () => {
		const params = new URLSearchParams()
		params.set('page', page)
		params.set('limit', limit)
		if (filters.search) params.set('search', filters.search)
		if (typeof filters.isActive === 'boolean') params.set('isActive', filters.isActive)
		if (filters.trigger) params.set('trigger', filters.trigger)
		if (filters.sortBy) params.set('sortBy', filters.sortBy)
		if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
		return params.toString()
	}

	const fetchWorkflows = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/workflows?${buildQuery()}`)
			if (!res.ok) throw new Error('Failed to fetch workflows')
			const data = await res.json()
			setWorkflows(data.workflows || [])
			setPagination(data.pagination || { total: 0, page, limit })
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchWorkflows()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, limit, filters.search, filters.isActive, filters.trigger, filters.sortBy, filters.sortOrder])

	return { workflows, pagination, loading, error, refetch: fetchWorkflows }
}