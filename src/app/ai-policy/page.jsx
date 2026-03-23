"use client"

import { DocsNav } from '@/components/docs-nav'

export default function AIPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <DocsNav />
      <div className="mx-auto max-w-4xl space-y-8 py-12 pt-24 px-6">
      <div>
        <h1 className="text-4xl font-bold text-white">AI Policy & Safeguards</h1>
        <p className="mt-2 text-lg text-gray-300">How DonorConnect uses AI responsibly to assist, not replace, nonprofit staff.</p>
      </div>

      {/* AI Feature Overview */}
      <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">🤖 AI-Powered Feature: Donor Summaries</h2>
        <p className="text-gray-300 mb-4">
          DonorConnect includes an AI-powered donor summary feature that helps nonprofit staff quickly understand 
          donor relationships and personalize outreach. This feature is designed to <strong className="text-white">augment human decision-making</strong>, 
          not replace it.
        </p>
        <div className="bg-gray-900/50 rounded p-4">
          <h3 className="text-lg font-medium text-white mb-2">How It Works:</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-300">
            <li>Staff clicks the "AI Summary" button on a donor's profile page</li>
            <li>Server validates the request and fetches donor data (organization-scoped)</li>
            <li>A minimal summary payload is sent to OpenAI (no raw PII)</li>
            <li>AI generates an 80-100 word actionable summary with risk assessment</li>
            <li>Summary is displayed to staff with suggested next actions</li>
          </ol>
        </div>
      </section>

      {/* AI Model & API */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">📡 AI Model & API Used</h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <table className="w-full text-gray-300">
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 font-medium text-white">Model</td>
                <td className="py-2">OpenAI GPT-4o-mini</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 font-medium text-white">API Endpoint</td>
                <td className="py-2"><code className="bg-gray-900 px-2 py-1 rounded">POST /api/ai/summarize-donor</code></td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 font-medium text-white">Provider</td>
                <td className="py-2">OpenAI API (api.openai.com)</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 font-medium text-white">Max Tokens</td>
                <td className="py-2">200 tokens</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-white">Temperature</td>
                <td className="py-2">0.4 (low creativity, high consistency)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsible AI Usage */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">🛡️ How We Use AI Responsibly</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
            <h3 className="font-semibold text-green-400 mb-2">✅ What We DO</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
              <li>Use AI for summaries and suggestions only</li>
              <li>Keep API keys server-side only</li>
              <li>Validate organization access before AI calls</li>
              <li>Send minimal, aggregated data (not raw records)</li>
              <li>Give users control via opt-in button</li>
              <li>Return user-friendly error messages</li>
            </ul>
          </div>
          <div className="rounded-lg border border-red-700 bg-red-900/20 p-4">
            <h3 className="font-semibold text-red-400 mb-2">❌ What We DON'T Do</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
              <li>Expose API keys to the client</li>
              <li>Send full addresses, phone numbers, or SSNs</li>
              <li>Allow AI to make decisions (only recommendations)</li>
              <li>Train models on user data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Sent to AI */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">📊 Data Sent to AI</h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <p className="text-gray-300 mb-4">
            We minimize data exposure by sending only aggregated metrics, never raw PII:
          </p>
          <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300">
            <pre>{`{
  "name": "John Doe",           // First + Last name only
  "status": "ACTIVE",           // Donor status enum
  "retentionRisk": "MEDIUM",    // Calculated risk level
  "totalAmount": 1250.00,       // Lifetime giving total
  "totalGifts": 5,              // Number of donations
  "lastGiftDate": "2025-12-15", // Most recent gift
  "notes": "Prefers email...",  // Staff notes for personalization
  "recentDonations": [          // Last 10 gifts only
    { "amount": 100, "date": "2025-12-15" }
  ]
}`}</pre>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            <strong>NOT sent:</strong> Full address, phone number, email address, payment details, or raw donation records.
          </p>
        </div>
      </section>

      {/* Prompt Engineering */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">✍️ Prompt Engineering</h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 space-y-4">
          <p className="text-gray-300">
            We crafted prompts to generate concise, factual, and actionable summaries:
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">System Prompt:</h4>
              <div className="bg-gray-900 rounded p-3 font-mono text-sm text-blue-300">
                "Be concise, factual, and actionable. Do not invent data."
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">User Prompt:</h4>
              <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-300">
                "You are a donor success assistant. Summarize this donor in 80-100 words max with risk assessment and suggested next action. Use any notes about the donor to personalize the recommendation."
              </div>
            </div>
          </div>
          <div className="mt-4 text-gray-300">
            <h4 className="font-medium text-white mb-2">Prompt Design Principles:</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Length constraint</strong> (80-100 words) prevents verbose, unfocused output</li>
              <li><strong>"Do not invent data"</strong> instruction reduces hallucination risk</li>
              <li><strong>Actionability focus</strong> ensures output is useful for staff decisions</li>
              <li><strong>Low temperature</strong> (0.4) prioritizes consistency over creativity</li>
              <li><strong>Personalization via notes</strong> lets staff guide AI recommendations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How AI Improves the Solution */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">🚀 How AI Improves DonorConnect</h2>
        <div className="rounded-lg border border-purple-700 bg-purple-900/20 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">Without AI</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                <li>Staff manually reviews donation history</li>
                <li>Risk assessment is subjective and inconsistent</li>
                <li>Personalized outreach takes significant time</li>
                <li>New staff lack context on donor relationships</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-300 mb-2">With AI</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                <li>Instant donor summary with one click</li>
                <li>Consistent risk assessment based on data</li>
                <li>AI suggests specific next actions</li>
                <li>New staff quickly understand donor context</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-gray-300 text-sm border-t border-gray-700 pt-4">
            <strong className="text-white">Bottom line:</strong> AI helps small nonprofit teams act faster and more consistently, 
            improving first-to-second gift conversion rates without requiring additional staff.
          </p>
        </div>
      </section>

      {/* Security & Controls */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">🔒 Security & Access Controls</h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <div>
                <strong className="text-white">Server-side only:</strong> All AI calls happen on the server. 
                API keys are never sent to the browser.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <div>
                <strong className="text-white">Organization scoping:</strong> Donors are validated against the user's 
                organization before any AI request. Users cannot summarize donors from other organizations.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <div>
                <strong className="text-white">Session authentication:</strong> All AI endpoints require valid 
                session authentication via HTTP-only cookies.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <div>
                <strong className="text-white">Error handling:</strong> Failures return user-friendly messages; 
                stack traces and API details are never exposed.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <div>
                <strong className="text-white">No data retention:</strong> OpenAI API requests are transient; 
                we do not store or log AI conversations.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center">
        <p className="text-gray-400">
          Questions about our AI usage? Review our source code on{' '}
          <a href="https://github.com/Jayisacoder/donorconnect" className="text-blue-400 underline">GitHub</a>.
        </p>
      </section>
    </div>
    </div>
  )
}
