/**
 * Root Homepage - Platform landing page for DonorConnect
 * Shows platform-wide stats and links to organization directory
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Heart, Users, TrendingUp, Shield, Building2, Sparkles, BarChart3, Zap } from 'lucide-react'
import { prisma } from '@/lib/db'
import { DocsNav } from '@/components/docs-nav'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function HomePage() {
  // Fetch platform-wide stats
  let stats = {
    totalOrganizations: 0,
    totalDonors: 0,
    totalRaised: 0,
    activeCampaigns: 0,
  }

  try {
    const [orgs, donors, campaigns, donations] = await Promise.all([
      prisma.organization.count({ where: { isPublic: true } }),
      prisma.donor.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
    ])

    stats.totalOrganizations = orgs
    stats.totalDonors = donors
    stats.activeCampaigns = campaigns
    stats.totalRaised = donations._sum.amount || 0
  } catch (error) {
    console.error('Failed to fetch homepage stats:', error)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <DocsNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center py-12">
            <Heart className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-5xl font-bold mb-4 text-white">
              DonorConnect
            </h2>
            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto font-semibold">
              <strong className="text-white">Problem:</strong> Nonprofits lose 70% of first-time donors before their second gift due to disconnected data and missed follow-ups.
            </p>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-semibold">
              <strong className="text-white">Solution:</strong> DonorConnect centralizes donor management, automates retention workflows, and uses AI to personalize outreach—helping nonprofits convert more first-time donors into lifelong supporters.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Section - Platform-wide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center border border-purple-500/20 bg-purple-500/5">
              <Building2 className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{stats.totalOrganizations}</p>
              <p className="text-gray-400">Nonprofits</p>
            </div>
            <div className="glass-card p-6 text-center border border-emerald-500/20 bg-emerald-500/5">
              <Users className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{stats.totalDonors.toLocaleString()}</p>
              <p className="text-gray-400">Donors</p>
            </div>
            <div className="glass-card p-6 text-center border border-green-500/20 bg-green-500/5">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(stats.totalRaised)}</p>
              <p className="text-gray-400">Total Raised</p>
            </div>
            <div className="glass-card p-6 text-center border border-pink-500/20 bg-pink-500/5">
              <Heart className="h-12 w-12 text-pink-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{stats.activeCampaigns}</p>
              <p className="text-gray-400">Active Campaigns</p>
            </div>
          </div>

          {/* For Nonprofits Section */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-8 text-white">Why Nonprofits Choose DonorConnect</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border border-purple-500/20">
                <BarChart3 className="h-10 w-10 text-purple-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Centralized Donor Data</h4>
                <p className="text-gray-300">
                  Keep all your donor information, donation history, and interactions in one place.
                </p>
              </div>
              <div className="glass-card p-6 border border-purple-500/20">
                <Zap className="h-10 w-10 text-yellow-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Automated Workflows</h4>
                <p className="text-gray-300">
                  Set up automatic thank-you emails, follow-up reminders, and re-engagement campaigns.
                </p>
              </div>
              <div className="glass-card p-6 border border-purple-500/20">
                <Sparkles className="h-10 w-10 text-pink-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Increase Retention</h4>
                <p className="text-gray-300">
                  Convert more first-time donors into lifelong supporters with personalized outreach.
                </p>
              </div>
            </div>
          </div>

          {/* For Donors Section */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-8 text-white">Want to Make a Difference?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border border-purple-500/20">
                <h4 className="text-xl font-bold text-white mb-2">Direct Impact</h4>
                <p className="text-sm text-gray-400 mb-3">100% of your donation goes directly to programs</p>
                <p className="text-gray-300">
                  Every dollar makes a meaningful difference in the lives of those we serve.
                </p>
              </div>
              <div className="glass-card p-6 border border-purple-500/20">
                <h4 className="text-xl font-bold text-white mb-2">Transparent Reporting</h4>
                <p className="text-sm text-gray-400 mb-3">See exactly how your contribution is being used</p>
                <p className="text-gray-300">
                  Receive regular updates showing the impact of your generosity.
                </p>
              </div>
              <div className="glass-card p-6 border border-purple-500/20">
                <h4 className="text-xl font-bold text-white mb-2">Tax Deductible</h4>
                <p className="text-sm text-gray-400 mb-3">All donations are fully tax-deductible</p>
                <p className="text-gray-300">
                  You'll receive an immediate receipt from registered 501(c)(3) nonprofits.
                </p>
              </div>
              <div className="glass-card p-6 border border-purple-500/20">
                <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Secure Giving
                </h4>
                <p className="text-sm text-gray-400 mb-3">Your information is protected</p>
                <p className="text-gray-300">
                  Industry-standard encryption protects all your information.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass-card p-12 text-center border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h3>
            <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
              Improve your donor retention and build lasting relationships with DonorConnect.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-purple-500/20 text-gray-400 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-2 text-white">About</h4>
              <p className="text-sm">
                DonorConnect helps nonprofits manage donor relationships and increase retention.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-white">Learn More</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/about" className="hover:text-purple-400">The Problem</Link></li>
                <li><Link href="/why-donorconnect" className="hover:text-purple-400">Our Solution</Link></li>
                <li><Link href="/ai-policy" className="hover:text-purple-400">AI Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-white">Get Started</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/login" className="hover:text-purple-400">Staff Login</Link></li>
                <li><Link href="/register" className="hover:text-purple-400">Register Nonprofit</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 mt-8 pt-6 text-center text-sm text-gray-500">
            © 2026 DonorConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
