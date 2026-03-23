// React hook for donation data management  
import { useEffect, useState } from 'react'

export function useDonations(page = 1, limit = 20, filters = {}) {
	const [donations, setDonations] = useState([])
	const [pagination, setPagination] = useState({ total: 0, page, limit })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const buildQuery = () => {
		const params = new URLSearchParams()
		params.set('page', page)
		params.set('limit', limit)
		if (filters.donorId) params.set('donorId', filters.donorId)
		if (filters.campaignId) params.set('campaignId', filters.campaignId)
		if (filters.type) params.set('type', filters.type)
		if (filters.minAmount) params.set('minAmount', filters.minAmount)
		if (filters.maxAmount) params.set('maxAmount', filters.maxAmount)
		if (filters.startDate) params.set('startDate', filters.startDate)
		if (filters.endDate) params.set('endDate', filters.endDate)
		if (filters.sortBy) params.set('sortBy', filters.sortBy)
		if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
		return params.toString()
	}

	const fetchDonations = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/donations?${buildQuery()}`)
			if (!res.ok) throw new Error('Failed to fetch donations')
			const data = await res.json()
			setDonations(data.donations || [])
			setPagination(data.pagination || { total: 0, page, limit })
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchDonations()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, limit, filters.donorId, filters.campaignId, filters.type, filters.minAmount, filters.maxAmount, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder])

	return { donations, pagination, loading, error, refetch: fetchDonations }
}