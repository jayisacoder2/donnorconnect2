import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, AlertCircle, Plus, UserPlus, Calendar, Clock, Gift, Target, Heart, Shield, ChevronRight, CircleDot } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch data directly from database using organizationId
  const [donors, donations, campaignsRaw, tasks, totalDonationsCount] = await Promise.all([
    prisma.donor.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.donation.findMany({
      where: { donor: { organizationId: user.organizationId } },
      include: { donor: true },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.campaign.findMany({
      where: { organizationId: user.organizationId, status: 'ACTIVE' },
      include: {
        donations: {
          select: { amount: true },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { donor: { organizationId: user.organizationId } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.donation.count({
      where: { donor: { organizationId: user.organizationId } },
    }),
  ])

  // Calculate currentAmount for each campaign from its donations
  const campaigns = campaignsRaw.map(campaign => ({
    ...campaign,
    currentAmount: campaign.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
  }))

  const totalRaised = donors.reduce((sum, d) => sum + (d.totalAmount || 0), 0)
  const activeDonors = donors.filter(d => d.status === 'ACTIVE').length
  const newDonors = donors.filter(d => d.status === 'NEW').length
  const lapsedDonors = donors.filter(d => d.status === 'LAPSED').length
  
  const thisMonthDonations = donations.filter(d => {
    const date = new Date(d.date)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const thisMonthRaised = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0)

  const pendingTasks = tasks.filter(t => t.status !== 'DONE').length
  const highPriorityTasks = tasks.filter(t => t.status !== 'DONE' && (t.priority === 'HIGH' || t.priority === 'URGENT')).length
  
  // Get upcoming tasks (next 7 days)
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const upcomingTasks = tasks
    .filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) <= nextWeek)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
  
  // Get recent donors (last 30 days) - based on first gift date, else fallback to createdAt
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentNewDonors = donors.filter(d => {
    // A donor is "new" if they gave their first gift recently.
    // Use firstGiftDate if available, otherwise createdAt (for manual entries without gifts yet)
    const startDate = d.firstGiftDate ? new Date(d.firstGiftDate) : new Date(d.createdAt)
    return startDate >= thirtyDaysAgo
  }).length
  
  // Get at-risk donors
  const atRiskDonors = donors.filter(d => d.retentionRisk === 'HIGH' || d.retentionRisk === 'CRITICAL').length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Command Center</h1>
            <p className="text-gray-400 mt-3 text-lg">Welcome back! Here's what's happening with your donors.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/donors/new">
              <Button className="btn-gradient rounded-xl px-5 py-3">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Donor
              </Button>
            </Link>
            <Link href="/donations/new">
              <Button className="btn-gradient-green rounded-xl px-5 py-3">
                <Plus className="h-4 w-4 mr-2" />
                Log Donation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/donors">
          <div className="metric-card risk-low group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300">
                +{recentNewDonors} new
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-1">{donors.length}</div>
            <div className="text-gray-400 font-medium">Total Donors</div>
            <div className="text-xs text-gray-500 mt-2">{activeDonors} active, {lapsedDonors} lapsed</div>
          </div>
        </Link>

        <Link href="/donations">
          <div className="metric-card group cursor-pointer" style={{background: 'linear-gradient(135deg, hsl(145 60% 45% / 0.15) 0%, hsl(165 60% 40% / 0.1) 100%)'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-500/30 text-green-300">
                {totalDonationsCount} gifts
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-1">{formatCurrency(totalRaised)}</div>
            <div className="text-gray-400 font-medium">Total Raised</div>
          </div>
        </Link>

        <Link href="/donations">
          <div className="metric-card group cursor-pointer" style={{background: 'linear-gradient(135deg, hsl(270 70% 55% / 0.15) 0%, hsl(330 70% 55% / 0.1) 100%)'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-500/30 text-purple-300">
                This month
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-1">{formatCurrency(thisMonthRaised)}</div>
            <div className="text-gray-400 font-medium">{thisMonthDonations.length} Donations</div>
          </div>
        </Link>

        <Link href="/donors?risk=HIGH">
          <div className="metric-card risk-high group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-red-500/30 text-red-300">
                Needs attention
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-1">{atRiskDonors}</div>
            <div className="text-gray-400 font-medium">At Risk Donors</div>
          </div>
        </Link>
      </div>

      {/* Activity and Campaigns Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Upcoming Tasks
          </h2>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500">No upcoming tasks in the next 7 days.</p>
            ) : (
              upcomingTasks.map((task) => {
                const dueDate = new Date(task.dueDate)
                const isOverdue = dueDate < now
                const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                
                return (
                  <Link key={task.id} href="/tasks">
                    <div className="activity-item">
                      <Clock className={`h-4 w-4 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-purple-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                        <p className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                          {isOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'URGENT' ? 'badge-danger' :
                        task.priority === 'HIGH' ? 'badge-warning' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {task.priority}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Active Campaigns
          </h2>
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-gray-500">No active campaigns.</p>
            ) : (
              campaigns.slice(0, 3).map((campaign) => {
                const goalAmount = campaign.goal || 0
                const currentAmount = campaign.currentAmount || 0
                const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0
                return (
                  <Link key={campaign.id} href="/campaigns">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-white">{campaign.name}</span>
                        <span className="font-bold text-emerald-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatCurrency(currentAmount)} of {goalAmount > 0 ? formatCurrency(goalAmount) : 'No goal set'}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {donations.length === 0 ? (
              <p className="text-gray-500">No recent donations.</p>
            ) : (
              donations.slice(0, 5).map((donation) => (
                <Link key={donation.id} href={`/donors/${donation.donor?.id}`}>
                  <div className="activity-item">
                    <CircleDot className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {donation.donor?.firstName} {donation.donor?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(donation.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(donation.amount)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Donor Insights
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div>
                <p className="text-sm font-medium text-white">New Donors (30 days)</p>
                <p className="text-xs text-gray-500 mt-1">Recently joined supporters</p>
              </div>
              <div className="text-3xl font-black text-blue-400">{recentNewDonors}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div>
                <p className="text-sm font-medium text-white">At-Risk Donors</p>
                <p className="text-xs text-gray-500 mt-1">Need attention to retain</p>
              </div>
              <div className="text-3xl font-black text-orange-400">{atRiskDonors}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div>
                <p className="text-sm font-medium text-white">Active Donors</p>
                <p className="text-xs text-gray-500 mt-1">Currently engaged</p>
              </div>
              <div className="text-3xl font-black text-emerald-400">{activeDonors}</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div>
                <p className="text-sm font-medium text-white">Average Gift Size</p>
                <p className="text-xs text-gray-500 mt-1">Per donation</p>
              </div>
              <div className="text-3xl font-black text-purple-400">
                {formatCurrency(donations.length > 0 ? totalRaised / donations.length : 0)}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div>
                <p className="text-sm font-medium text-white">Donations This Month</p>
                <p className="text-xs text-gray-500 mt-1">Total received</p>
              </div>
              <div className="text-3xl font-black text-green-400">{thisMonthDonations.length}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div>
                <p className="text-sm font-medium text-white">Active Campaigns</p>
                <p className="text-xs text-gray-500 mt-1">Currently running</p>
              </div>
              <div className="text-3xl font-black text-cyan-400">{campaigns.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
