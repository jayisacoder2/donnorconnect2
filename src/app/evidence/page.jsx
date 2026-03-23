"use client"

import ProtectedGate from '@/components/protected-gate'
import { DocsNav } from '@/components/docs-nav'
import MermaidDiagram from '@/components/mermaid-diagram'
import Link from 'next/link'

const erdDiagram = `erDiagram
    Organization ||--o{ User : has
    Organization ||--o{ Donor : manages
    Organization ||--o{ Campaign : runs
    Organization ||--o{ Segment : defines
    Organization ||--o{ Workflow : configures
    
    User ||--o{ Session : maintains
    User ||--o{ Task : "assigned to"
    User ||--o{ ActivityLog : generates
    User ||--o{ WorkflowExecution : executes
    
    Donor ||--o{ Donation : makes
    Donor ||--o{ Interaction : receives
    Donor ||--o{ Task : "has tasks for"
    Donor }o--o{ Segment : belongs_to_via
    
    Campaign ||--o{ Donation : receives
    
    Segment ||--o{ Workflow : triggers
    Segment ||--o{ SegmentMember : contains
    
    Workflow ||--o{ WorkflowExecution : executes
    
    Organization {
        string id PK
        string name
        string slug UK
        text description
        string website
        string logo
        boolean isPublic
        datetime createdAt
        datetime updatedAt
    }
    
    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role
        string organizationId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Session {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        datetime createdAt
    }
    
    Donor {
        string id PK
        string organizationId FK
        string firstName
        string lastName
        string email
        string phone
        string address
        string city
        string state
        string zipCode
        text notes
        enum status
        enum retentionRisk
        int totalGifts
        float totalAmount
        datetime firstGiftDate
        datetime lastGiftDate
        datetime createdAt
        datetime updatedAt
    }
    
    Donation {
        string id PK
        string donorId FK
        string campaignId FK
        float amount
        datetime date
        enum type
        string method
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    Campaign {
        string id PK
        string organizationId FK
        string name
        text description
        float goal
        datetime startDate
        datetime endDate
        string type
        enum status
        datetime createdAt
        datetime updatedAt
    }
    
    Interaction {
        string id PK
        string donorId FK
        enum type
        text subject
        text notes
        datetime date
        string createdById
        datetime createdAt
        datetime updatedAt
    }
    
    Task {
        string id PK
        string donorId FK
        string assignedTo FK
        string title
        text description
        enum status
        enum priority
        datetime dueDate
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Segment {
        string id PK
        string organizationId FK
        string name
        text description
        json rules
        int memberCount
        datetime lastCalculated
        datetime createdAt
        datetime updatedAt
    }
    
    SegmentMember {
        string id PK
        string segmentId FK
        string donorId FK
        datetime createdAt
    }
    
    Workflow {
        string id PK
        string organizationId FK
        string segmentId FK
        string name
        text description
        enum trigger
        json steps
        boolean isActive
        int executionCount
        datetime createdAt
        datetime updatedAt
    }
    
    WorkflowExecution {
        string id PK
        string workflowId FK
        string executedById FK
        string status
        json progress
        datetime startedAt
        datetime completedAt
        text error
    }
    
    ActivityLog {
        string id PK
        string userId FK
        string action
        string entity
        string entityId
        json changes
        datetime createdAt
    }
`

export default function EvidencePage() {
  return (
    <ProtectedGate>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
        <DocsNav />
        <div className="mx-auto max-w-5xl space-y-10 py-12 pt-24 px-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Evidence & Rubric Alignment</h1>
          <p className="mt-2 text-lg text-gray-300">
            Clear mapping of competencies to implementation evidence with direct links.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-600 px-3 py-1 rounded text-sm">CCC.1.3</span>
            <span className="bg-teal-600/20 text-teal-400 border border-teal-600 px-3 py-1 rounded text-sm">CCC.1.4</span>
            <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-600 px-3 py-1 rounded text-sm">CCC.1.5</span>
            <span className="bg-purple-600/20 text-purple-400 border border-purple-600 px-3 py-1 rounded text-sm">TS.6.2</span>
            <span className="bg-orange-600/20 text-orange-400 border border-orange-600 px-3 py-1 rounded text-sm">TS.6.3</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* CCC.1.3 - IMPLEMENT A SOLUTION */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border-2 border-blue-600 bg-gray-800/50 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded">CCC.1.3</span>
              <h2 className="text-2xl font-semibold text-white">Implement a Solution</h2>
            </div>
            <p className="text-gray-400 italic">
              "I can implement a solution using the most appropriate industry-accepted method that leads to effective implementation of the solution."
            </p>
          </div>

          {/* What the rubric requires */}
          <div className="bg-blue-900/20 border border-blue-700 rounded p-4">
            <h3 className="font-semibold text-blue-400 mb-2">📋 Rubric Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Build a working MVP with multiple pages</li>
              <li>✓ Use industry-accepted methods (Agile, DevOps, Interface design)</li>
              <li>✓ Apply appropriate tools and best practices</li>
            </ul>
          </div>

          {/* How I demonstrated it */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">🎯 How I Demonstrated This</h3>
            
            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-3">Working MVP: 12+ Functional Pages</h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Dashboard Analytics', path: '/dashboard', desc: 'Real-time metrics & KPIs' },
                  { name: 'Donor Management', path: '/donors', desc: 'Full CRUD operations' },
                  { name: 'Add/Edit Donor', path: '/donors/new', desc: 'Form validation' },
                  { name: 'Donation Tracking', path: '/donations', desc: 'Record & list gifts' },
                  { name: 'Record Donation', path: '/donations/new', desc: 'Campaign linking' },
                  { name: 'Campaign Management', path: '/campaigns', desc: 'Goal tracking' },
                  { name: 'Segment Builder', path: '/segments', desc: 'Dynamic grouping' },
                  { name: 'Workflow Automation', path: '/workflows', desc: 'Multi-step sequences' },
                  { name: 'Task Management', path: '/tasks', desc: 'Follow-up tracking' },
                  { name: 'Login Page', path: '/login', desc: 'Secure authentication' },
                  { name: 'Registration', path: '/register', desc: 'Org creation' },
                  { name: 'AI Policy', path: '/ai-policy', desc: 'Documentation' },
                ].map((page) => (
                  <Link 
                    key={page.path}
                    href={page.path} 
                    className="flex flex-col p-3 border border-gray-700 rounded hover:border-blue-500 hover:bg-blue-900/10 transition"
                  >
                    <span className="text-white font-medium text-sm">{page.name}</span>
                    <span className="text-gray-500 text-xs">{page.desc}</span>
                    <span className="text-blue-400 text-xs mt-1">{page.path} →</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-3">Industry-Accepted Methods & Tools</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Development Methodology</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong className="text-white">Agile/Iterative</strong> – Built features incrementally</li>
                    <li>• <strong className="text-white">Component-based</strong> – Reusable React components</li>
                    <li>• <strong className="text-white">RESTful API</strong> – Standard HTTP endpoints</li>
                    <li>• <strong className="text-white">Git version control</strong> – GitHub repository</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Technology Stack</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong className="text-white">Next.js 16</strong> – Production React framework</li>
                    <li>• <strong className="text-white">PostgreSQL + Prisma</strong> – Industry-standard database</li>
                    <li>• <strong className="text-white">Tailwind CSS</strong> – Modern styling approach</li>
                    <li>• <strong className="text-white">Vercel</strong> – CI/CD deployment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Evidence Links */}
          <div className="bg-gray-900/50 rounded p-4">
            <h4 className="font-medium text-white mb-3">📎 Direct Evidence Links</h4>
            <div className="flex flex-wrap gap-3">
              <a href="https://github.com/Jayisacoder/donorconnect" 
                 className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
                📂 GitHub Source Code
              </a>
              <a href="https://donorconnect-three.vercel.app" 
                 className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
                🌐 Live Deployed App
              </a>
              <a href="https://www.notion.so/donorconnect-docs-2ca0485bf39c80e49571e2d8e91584ed" 
                 className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
                📝 Notion Docs (Labs, Wireframes, Trello)
              </a>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                📊 View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* CCC.1.4 - TEST AND IMPROVE */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border-2 border-teal-600 bg-gray-800/50 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-teal-600 text-white text-sm font-bold px-3 py-1 rounded">CCC.1.4</span>
              <h2 className="text-2xl font-semibold text-white">Test and Improve a Solution</h2>
            </div>
            <p className="text-gray-400 italic">
              "I can conduct extensive testing of my solution with users, evaluate my design, and identify ways to improve its effectiveness in solving the problem."
            </p>
          </div>

          {/* What the rubric requires */}
          <div className="bg-teal-900/20 border border-teal-700 rounded p-4">
            <h3 className="font-semibold text-teal-400 mb-2">📋 Rubric Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Test my solution with users and identify areas for improvement</li>
              <li>✓ Gather targeted feedback about my solution</li>
              <li>✓ Use feedback to revise and refine my solution</li>
            </ul>
          </div>

          {/* How I demonstrated it */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">🎯 How I Demonstrated This</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3">🔍 User Testing & Feedback</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Manual testing of all CRUD flows</span>
                    <span className="text-teal-400 text-xs">✓ Complete</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Cross-browser compatibility check</span>
                    <span className="text-teal-400 text-xs">✓ Chrome, Firefox</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300">UI responsiveness testing</span>
                    <span className="text-teal-400 text-xs">✓ Desktop, Mobile</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Error handling verification</span>
                    <span className="text-teal-400 text-xs">✓ API responses</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3">🔧 Issues Fixed Based on Testing</h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded">1</span>
                    <span>Fixed dark text on dark background (dropdowns)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded">2</span>
                    <span>Replaced text inputs with proper select menus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded">3</span>
                    <span>Added duplicate email prevention for donors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded">4</span>
                    <span>Fixed campaign deletion (unlink donations first)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded">5</span>
                    <span>Added working filters to donations page</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-2">📝 Reflection on Improvements</h4>
              <p className="text-gray-400 text-sm mb-3">Documented challenges, what I learned, and what I would do differently:</p>
              <Link href="/reflection" className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition">
                View Full Reflection → /reflection
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* CCC.1.5 - DOCUMENT AND PRESENT */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border-2 border-indigo-600 bg-gray-800/50 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded">CCC.1.5</span>
              <h2 className="text-2xl font-semibold text-white">Document and Present</h2>
            </div>
            <p className="text-gray-400 italic">
              "I can document my solution clearly and present it effectively to stakeholders."
            </p>
          </div>

          <div className="bg-indigo-900/20 border border-indigo-700 rounded p-4">
            <h3 className="font-semibold text-indigo-400 mb-2">📋 Rubric Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Clear documentation of the solution</li>
              <li>✓ Explain technical decisions and architecture</li>
              <li>✓ Present the solution effectively</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">🎯 How I Demonstrated This</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <a href="https://github.com/Jayisacoder/donorconnect#readme" 
                 className="bg-gray-900/50 rounded p-4 hover:border-indigo-500 border border-gray-700 transition" target="_blank" rel="noreferrer">
                <h4 className="font-medium text-white mb-2">📖 README.md</h4>
                <p className="text-gray-400 text-sm">Comprehensive project overview, setup instructions, architecture explanation</p>
                <span className="text-indigo-400 text-xs mt-2 block">View on GitHub →</span>
              </a>
              
              <Link href="/ai-policy" className="bg-gray-900/50 rounded p-4 hover:border-indigo-500 border border-gray-700 transition">
                <h4 className="font-medium text-white mb-2">🤖 AI Policy Page</h4>
                <p className="text-gray-400 text-sm">Detailed AI integration documentation, ethics, safeguards</p>
                <span className="text-indigo-400 text-xs mt-2 block">/ai-policy →</span>
              </Link>
              
              <Link href="/reflection" className="bg-gray-900/50 rounded p-4 hover:border-indigo-500 border border-gray-700 transition">
                <h4 className="font-medium text-white mb-2">💭 Reflection Page</h4>
                <p className="text-gray-400 text-sm">Challenges, learnings, growth throughout the project</p>
                <span className="text-indigo-400 text-xs mt-2 block">/reflection →</span>
              </Link>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-3">📄 In-App Documentation</h4>
              <ul className="grid gap-2 md:grid-cols-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-indigo-400">✓</span> Code comments explaining complex logic
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-indigo-400">✓</span> JSDoc annotations on key functions
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-indigo-400">✓</span> Zod schemas documenting data structures
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-indigo-400">✓</span> Clear component/file naming conventions
                </li>
              </ul>
            </div>

            {/* ERD Diagram */}
            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-3">🗄️ Entity Relationship Diagram (ERD)</h4>
              <p className="text-gray-400 text-sm mb-4">Complete database schema showing all entities, attributes, and relationships:</p>
              <div className="bg-gray-950 rounded p-4 overflow-x-auto border border-gray-700">
                <MermaidDiagram chart={erdDiagram} />
              </div>
              <p className="text-gray-500 text-xs mt-3">
                This Mermaid ERD diagram documents all 12 entities, their attributes with types, and relationships with cardinality notation.
                The schema is implemented in <code className="bg-gray-800 px-1 rounded">prisma/schema.prisma</code>.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* TS.6.2 - USE AI RESPONSIBLY */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border-2 border-purple-600 bg-gray-800/50 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded">TS.6.2</span>
              <h2 className="text-2xl font-semibold text-white">Use AI Responsibly</h2>
            </div>
            <p className="text-gray-400 italic">
              "I can consider bias, ethics, security, and data privacy when using and building AI systems."
            </p>
          </div>

          {/* What the rubric requires */}
          <div className="bg-purple-900/20 border border-purple-700 rounded p-4">
            <h3 className="font-semibold text-purple-400 mb-2">📋 Rubric Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Consider bias in AI outputs</li>
              <li>✓ Address ethics of AI usage</li>
              <li>✓ Implement security measures</li>
              <li>✓ Protect data privacy</li>
            </ul>
          </div>

          {/* How I demonstrated it */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">🎯 How I Demonstrated This</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">🔒</span> Data Privacy
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Minimal data sent to AI</strong> – Only aggregated metrics (gift counts, totals), never raw PII like addresses or phone numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Organization scoping</strong> – Users can only access their own org's donor data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">No data retention</strong> – AI requests are transient, not logged</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">🛡️</span> Security
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Server-side only</strong> – API keys stored in env vars, never exposed to client</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Authentication required</strong> – All AI endpoints require valid session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Error handling</strong> – Failures return safe messages, no stack traces</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">⚖️</span> Ethics
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">AI assists, doesn't decide</strong> – Provides suggestions for staff to act on, not automated decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">User opt-in</strong> – AI feature activated by explicit button click</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Transparent documentation</strong> – AI Policy page explains how AI is used</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 rounded p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">⚠️</span> Bias Mitigation
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Factual prompts</strong> – "Do not invent data" instruction reduces hallucinations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Low temperature</strong> – 0.4 setting prioritizes consistency over creativity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span><strong className="text-white">Data-driven only</strong> – AI summarizes existing data, doesn't make predictions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-2">📍 Code Evidence</h4>
              <p className="text-gray-400 text-sm mb-2">AI endpoint with all safeguards implemented:</p>
              <code className="block bg-gray-800 text-green-400 px-3 py-2 rounded text-sm font-mono">
                src/app/api/ai/summarize-donor/route.js
              </code>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded p-4">
            <Link href="/ai-policy" className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition">
              📖 View Full AI Policy Page → /ai-policy
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* TS.6.3 - PROMPT EFFECTIVELY / INTEGRATE AI */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border-2 border-orange-600 bg-gray-800/50 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1 rounded">TS.6.3</span>
              <h2 className="text-2xl font-semibold text-white">Prompt Effectively / Integrate AI Tools</h2>
            </div>
            <p className="text-gray-400 italic">
              "I can craft specific and targeted prompts for machines to follow in order to generate my desired response."
            </p>
          </div>

          {/* What the rubric requires */}
          <div className="bg-orange-900/20 border border-orange-700 rounded p-4">
            <h3 className="font-semibold text-orange-400 mb-2">📋 Rubric Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Craft specific, targeted prompts</li>
              <li>✓ Generate desired AI responses</li>
              <li>✓ Integrate AI meaningfully into the product</li>
            </ul>
          </div>

          {/* How I demonstrated it */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">🎯 How I Demonstrated This</h3>
            
            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-4">🤖 AI Feature: Donor Summary Generator</h4>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="text-center p-4 border border-orange-700 rounded bg-orange-900/10">
                  <p className="text-2xl font-bold text-orange-400">GPT-4o-mini</p>
                  <p className="text-gray-400 text-sm">AI Model Used</p>
                </div>
                <div className="text-center p-4 border border-orange-700 rounded bg-orange-900/10">
                  <p className="text-2xl font-bold text-orange-400">80-100 words</p>
                  <p className="text-gray-400 text-sm">Targeted Output</p>
                </div>
                <div className="text-center p-4 border border-orange-700 rounded bg-orange-900/10">
                  <p className="text-2xl font-bold text-orange-400">1-click</p>
                  <p className="text-gray-400 text-sm">User Activation</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4 space-y-4">
              <h4 className="font-medium text-white">📝 My Prompt Engineering Strategy</h4>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 bg-gray-800/50 p-4 rounded-r">
                  <p className="text-blue-400 text-xs font-semibold mb-1">SYSTEM PROMPT</p>
                  <p className="text-blue-300 font-mono text-sm">"Be concise, factual, and actionable. Do not invent data."</p>
                  <p className="text-gray-500 text-xs mt-2">→ Prevents hallucinations and keeps responses focused</p>
                </div>
                
                <div className="border-l-4 border-green-500 bg-gray-800/50 p-4 rounded-r">
                  <p className="text-green-400 text-xs font-semibold mb-1">USER PROMPT</p>
                  <p className="text-green-300 font-mono text-sm">"You are a donor success assistant. Summarize this donor in 80-100 words max with risk assessment and suggested next action. Use any notes about the donor to personalize the recommendation."</p>
                  <p className="text-gray-500 text-xs mt-2">→ Specific word limit, clear output structure, personalization instruction</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded mt-4">
                <h5 className="text-white font-medium mb-2">Why These Prompts Work:</h5>
                <ul className="grid gap-2 md:grid-cols-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">1.</span>
                    <span><strong className="text-white">Word limit</strong> – Prevents verbose, unfocused responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">2.</span>
                    <span><strong className="text-white">"Do not invent"</strong> – Reduces hallucination risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">3.</span>
                    <span><strong className="text-white">Low temp (0.4)</strong> – Consistent, reliable outputs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">4.</span>
                    <span><strong className="text-white">Role assignment</strong> – "donor success assistant" provides context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">5.</span>
                    <span><strong className="text-white">Structured output</strong> – Risk + action = actionable result</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">6.</span>
                    <span><strong className="text-white">Personalization</strong> – Uses staff notes for better recommendations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-4">
              <h4 className="font-medium text-white mb-3">💡 How AI Improves the Solution</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-red-700/50 rounded p-3 bg-red-900/10">
                  <p className="text-red-400 font-medium mb-2">❌ Without AI</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Staff manually reviews 10+ donation records</li>
                    <li>• Risk assessment is subjective, inconsistent</li>
                    <li>• Personalized outreach takes 5-10 min/donor</li>
                    <li>• New staff lack context on donor history</li>
                  </ul>
                </div>
                <div className="border border-green-700/50 rounded p-3 bg-green-900/10">
                  <p className="text-green-400 font-medium mb-2">✅ With AI</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Instant summary in one click (&lt;2 seconds)</li>
                    <li>• Consistent, data-driven risk assessment</li>
                    <li>• AI suggests specific next action</li>
                    <li>• Anyone can quickly understand donor context</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded p-4">
            <h4 className="font-medium text-white mb-2">📍 Implementation Evidence</h4>
            <code className="block bg-gray-800 text-orange-400 px-3 py-2 rounded text-sm font-mono mb-3">
              src/app/api/ai/summarize-donor/route.js
            </code>
            <Link href="/ai-policy" className="inline-flex items-center gap-2 text-orange-400 hover:underline text-sm">
              See detailed prompt documentation on AI Policy page →
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        {/* QUICK ACCESS */}
        {/* ═══════════════════════════════════════════════════════════════════════════════ */}
        <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔗 Quick Access - All Evidence Links</h2>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/Jayisacoder/donorconnect" 
               className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
              📂 GitHub
            </a>
            <a href="https://donorconnect-three.vercel.app" 
               className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
              🌐 Vercel
            </a>
            <a href="https://www.notion.so/donorconnect-docs-2ca0485bf39c80e49571e2d8e91584ed" 
               className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm transition" target="_blank" rel="noreferrer">
              📝 Notion Docs
            </a>
            <Link href="/dashboard" className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
              📊 Dashboard
            </Link>
            <Link href="/ai-policy" className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition">
              🤖 AI Policy
            </Link>
            <Link href="/reflection" className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition">
              💭 Reflection
            </Link>
          </div>
        </section>
      </div>
      </div>
    </ProtectedGate>
  )
}
