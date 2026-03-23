"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DocsNav } from '@/components/docs-nav'

export default function WhyDonorConnectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <DocsNav />

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12 pt-24">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Why DonorConnect</h1>
            <p className="text-lg text-gray-300">A focused MVP built to move first-time donors to their second gift with clear data, guided actions, and automation.</p>
          </div>

          <div className="space-y-6 text-gray-200">
            <section className="glass-card p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-3">Solution idea</h2>
              <p className="text-gray-300">Centralize donors, donations, and campaigns; surface retention risk; give AI-generated context so staff send the right follow-up fast.</p>
            </section>

            <section className="glass-card p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-3">Key features & rationale</h2>
              <ul className="list-disc space-y-2 pl-6 text-gray-300">
                <li>Donor + donation CRUD tied to organizations for clean multi-tenant data.</li>
                <li>Dashboard metrics for totals, trends, and recent gifts to triage work.</li>
                <li>AI donor summaries to condense history and risk into one actionable paragraph.</li>
                <li>Role-based controls so only admins/staff can add gifts or donors.</li>
                <li>Transaction simulator to test workflows without real payments.</li>
              </ul>
            </section>

            <section className="glass-card p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-3">Expected challenges & planning</h2>
              <p className="text-gray-300">Ensuring auth compatibility with Next.js app router, keeping Prisma multi-tenant filters strict, and handling AI responsibly with minimal PII sent.</p>
            </section>

            <section className="glass-card p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-3">System overview</h2>
              <p className="text-gray-300">Pages: Home, Problem, Why, AI Policy, Evidence, Reflection, Dashboard, Donors, Donations. Data: organizations, users, donors, donations, campaigns, sessions. APIs enforce org scoping; dashboard reads Prisma directly for accuracy.</p>
            </section>
          </div>

          {/* CTA */}
          <div className="glass-card p-8 text-center border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to improve donor retention?</h3>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
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
              <h4 className="font-bold mb-2 text-white">Get Started</h4>
              <p className="text-sm">
                Ready to improve donor retention?<br />
                Register your nonprofit today.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-white">Secure Giving</h4>
              <p className="text-sm">
                All donations are processed securely with industry-standard encryption.
              </p>
            </div>
          </div>
          <div className="border-t border-purple-500/20 mt-8 pt-6 text-center text-sm text-gray-500">
            © 2025 DonorConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
