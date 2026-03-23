"use client"

import ProtectedGate from '@/components/protected-gate'
import { DocsNav } from '@/components/docs-nav'
import Link from 'next/link'

export default function ReflectionPage() {
  return (
    <ProtectedGate>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
        <DocsNav />
        <div className="mx-auto max-w-4xl space-y-10 py-12 pt-24 px-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Project Reflection</h1>
          <p className="mt-2 text-lg text-gray-300">
            Learning, growth, and decision-making throughout the DonorConnect build.
          </p>
        </div>

        {/* What Challenged You Most */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧗</span>
            <h2 className="text-2xl font-semibold text-white">What Challenged Me Most</h2>
          </div>
          
          <div className="space-y-4 text-gray-300">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-white mb-2">Next.js 16 Authentication Architecture</h3>
              <p className="text-sm">
                The biggest challenge was implementing session-based authentication with Next.js 16's App Router. 
                The new async <code className="bg-gray-800 px-1 rounded">params</code> and <code className="bg-gray-800 px-1 rounded">cookies()</code> APIs 
                required completely rethinking how API routes handle authentication. I had to migrate from using 
                <code className="bg-gray-800 px-1 rounded">getSessionUser()</code> in Server Components to 
                <code className="bg-gray-800 px-1 rounded">request.cookies.get('session')</code> in API routes because 
                the <code className="bg-gray-800 px-1 rounded">cookies()</code> helper doesn't work in route handlers.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-white mb-2">Multi-Tenant Data Isolation</h3>
              <p className="text-sm">
                Ensuring every database query was properly scoped to the user's organization was tedious but critical. 
                I had to audit every API endpoint to verify <code className="bg-gray-800 px-1 rounded">organizationId</code> filtering 
                was applied, and that users couldn't access data from other organizations through parameter manipulation.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-white mb-2">Prisma 7 with Neon PostgreSQL</h3>
              <p className="text-sm">
                Configuring Prisma 7 with the new driver adapters for Neon's serverless PostgreSQL required understanding 
                the new configuration format in <code className="bg-gray-800 px-1 rounded">prisma.config.js</code> and how 
                the custom output path in <code className="bg-gray-800 px-1 rounded">prisma/generated/</code> works. 
                Connection pooling and SSL settings needed careful tuning for both local development and production.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-white mb-2">Making Workflows Actually Work</h3>
              <p className="text-sm">
                The workflow automation feature went through several iterations. Initially I had ambitious plans 
                for complex triggers and conditional logic, but I had to scope down to practical step types 
                (email, task creation, wait periods) that could actually be implemented and tested within the timeline.
              </p>
            </div>
          </div>
        </section>

        {/* What I Would Change */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔄</span>
            <h2 className="text-2xl font-semibold text-white">What I Would Change or Add</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-900/50 rounded p-4">
              <h3 className="font-semibold text-green-400 mb-3">If I Had More Time</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>Real email sending</strong> – Integrate SendGrid/Postmark for actual workflow emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>Advanced segmentation</strong> – More complex rule combinations with AND/OR logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>Deeper analytics</strong> – Charts, trends, year-over-year comparisons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>Payment processing</strong> – Stripe integration for real donation handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>CRM imports</strong> – CSV/Excel upload and Salesforce sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span><strong>Mobile responsiveness</strong> – Better tablet and phone experience</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h3 className="font-semibold text-blue-400 mb-3">What I Would Do Differently</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Start with TypeScript</strong> – Would have caught many bugs earlier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Write tests first</strong> – TDD would have made refactoring safer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Simpler auth initially</strong> – Could have used NextAuth.js to start faster</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Better error boundaries</strong> – More graceful error handling throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Component library earlier</strong> – Should have built shared components from day one</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* What I Learned */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <h2 className="text-2xl font-semibold text-white">What I Learned About Building Real Products</h2>
          </div>
          
          <div className="space-y-4 text-gray-300">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/50">
                <h3 className="font-semibold text-white mb-2">🏗️ Architecture Matters</h3>
                <p className="text-sm">
                  The multi-tenant architecture decision made early on (organizationId on every model) 
                  proved essential. It would have been nearly impossible to retrofit data isolation later. 
                  Taking time to design the schema properly saved countless hours of refactoring.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-lg p-4 border border-green-700/50">
                <h3 className="font-semibold text-white mb-2">🔐 Security Is Non-Negotiable</h3>
                <p className="text-sm">
                  Every API endpoint needs authentication and authorization checks. I learned to never 
                  trust client-side data and always validate on the server. HTTP-only cookies are more 
                  secure than localStorage for session management.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-700/50">
                <h3 className="font-semibold text-white mb-2">⚡ Scope Ruthlessly</h3>
                <p className="text-sm">
                  I started with grand plans for workflow automation, AI coaching, and advanced analytics. 
                  Reality forced me to cut features and focus on what users actually need first: 
                  basic CRUD, clear data display, and simple automation. Ship something usable, then iterate.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-700/50">
                <h3 className="font-semibold text-white mb-2">🧪 Seed Data Is Gold</h3>
                <p className="text-sm">
                  The seed script with 75 donors and 200+ donations was invaluable. Realistic test data 
                  exposed edge cases, made the UI feel real, and helped stakeholders understand the product. 
                  Worth every minute invested in creating it.
                </p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h3 className="font-semibold text-white mb-2">📚 Technical Skills Gained</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Next.js 16 App Router', 'React Server Components', 'Prisma 7 ORM', 'PostgreSQL', 
                  'Session-based Auth', 'Multi-tenancy', 'OpenAI API', 'Zod Validation', 
                  'React Hook Form', 'Tailwind CSS', 'shadcn/ui', 'Vitest Testing'].map((skill) => (
                  <span key={skill} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How AI Helped */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <h2 className="text-2xl font-semibold text-white">How AI Helped (and Where It Didn't)</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-3">✅ Where AI Accelerated Development</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Code scaffolding</strong> – Generating boilerplate for API routes, components, and forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Debugging</strong> – Explaining error messages and suggesting fixes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Documentation</strong> – Writing README, policy pages, and inline comments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Refactoring</strong> – Improving code structure and following best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Seed data</strong> – Creating realistic nonprofit donor profiles and donations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>CSS/Styling</strong> – Tailwind class suggestions and responsive design</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-3">❌ Where AI Fell Short</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Next.js 16 specifics</strong> – Often suggested outdated patterns from older versions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Prisma 7 syntax</strong> – Many suggestions used Prisma 5/6 API that no longer works</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Complex auth flows</strong> – Had to manually trace session handling issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Business logic decisions</strong> – AI can't understand nonprofit context deeply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Security review</strong> – Still needed manual auditing of auth and data access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Integration testing</strong> – AI-generated tests often missed edge cases</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded p-4">
            <h3 className="font-semibold text-white mb-2">💭 Key Insight</h3>
            <p className="text-gray-300 text-sm">
              AI is a powerful <strong className="text-white">productivity multiplier</strong> but not a replacement 
              for understanding. The biggest gains came when I used AI to accelerate tasks I already understood 
              conceptually. When I relied on AI for unfamiliar territory (like Next.js 16's new APIs), I often 
              had to spend extra time debugging incorrect suggestions. <strong className="text-white">AI + human judgment</strong> is 
              the winning combination.
            </p>
          </div>
        </section>

        {/* Final Thoughts */}
        <section className="rounded-lg border border-purple-700 bg-purple-900/20 p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">🎯 Final Thoughts</h2>
          <p className="text-gray-300 leading-relaxed">
            Building DonorConnect taught me that real-world software development is about making trade-offs. 
            You can't have everything – you have to choose what matters most for users right now, ship it, 
            and improve iteratively. The nonprofit sector needs accessible tools, and I'm proud to have built 
            something that could genuinely help small organizations manage donor relationships better. 
            This project gave me confidence that I can design, build, and deploy a complete full-stack application 
            from scratch, and that's a skill that will serve me well in any future role.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <Link href="/evidence" className="text-blue-400 hover:underline flex items-center gap-2">
            ← Back to Evidence
          </Link>
          <Link href="/dashboard" className="text-blue-400 hover:underline flex items-center gap-2">
            Go to Dashboard →
          </Link>
        </div>
      </div>
      </div>
    </ProtectedGate>
  )
}
