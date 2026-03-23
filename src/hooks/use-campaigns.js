// React hook for campaign data management
import { useEffect, useState } from 'react'

const buildQuery = (page, limit, filters = {}) => {
	const params = new URLSearchParams()
	if (page) params.set('page', page)
	if (limit) params.set('limit', limit)
	if (filters.search) params.set('search', filters.search)
	if (filters.status) params.set('status', filters.status)
	if (filters.sortBy) params.set('sortBy', filters.sortBy)
	if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
	return params.toString()
}

export function useCampaigns(page = 1, limit = 20, filters = {}) {
	const [campaigns, setCampaigns] = useState([])
	const [pagination, setPagination] = useState({ total: 0, page, limit })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const fetchCampaigns = async () => {
		setLoading(true)
		setError(null)
		try {
			const qs = buildQuery(page, limit, filters)
			const res = await fetch(`/api/campaigns?${qs}`)
			if (!res.ok) throw new Error('Failed to load campaigns')
			const data = await res.json()
			setCampaigns(data.campaigns || [])
			setPagination(data.pagination || { total: 0, page, limit })
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchCampaigns()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, limit, filters.search, filters.status, filters.sortBy, filters.sortOrder])

	return { campaigns, pagination, loading, error, refetch: fetchCampaigns }
}

export function useCampaign(campaignId) {
	const [campaign, setCampaign] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const fetchCampaign = async () => {
		if (!campaignId) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/campaigns/${campaignId}`)
			if (!res.ok) throw new Error('Failed to load campaign')
			const data = await res.json()
			setCampaign(data.campaign || null)
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchCampaign()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [campaignId])

	return { campaign, loading, error, refetch: fetchCampaign }
}