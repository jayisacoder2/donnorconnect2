# DonorConnect - Nonprofit Donor Retention Platform

> **Helping nonprofits convert first-time donors into lifelong supporters** through intelligent donor management, automated workflows, and AI-powered insights.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://donorconnect-three.vercel.app)
[![GitHub](https://img.shields.io/badge/Source-GitHub-blue)](https://github.com/Jayisacoder/donorconnect)

---

## 🎯 The Problem We Solve

**70% of first-time donors never make a second gift.** This attrition costs nonprofits billions annually and happens because of:

- **Disconnected data** – Donor info scattered across spreadsheets and systems
- **Missed follow-ups** – No systematic way to thank and engage new donors
- **Limited capacity** – Small teams can't personalize outreach at scale
- **No retention visibility** – Organizations don't know who's at risk until it's too late

**DonorConnect** centralizes donor management, surfaces retention risks automatically, and uses AI to help staff personalize outreach—enabling small nonprofit teams to build lasting relationships.

---

## ✨ Key Features

### Core CRM Functionality
| Feature | Description |
|---------|-------------|
| 📊 **Donor Management** | Full CRUD with search, filters, and retention risk tracking |
| 💰 **Donation Tracking** | Record gifts linked to donors and campaigns with automatic metrics |
| 🎯 **Campaign Management** | Track fundraising campaigns with goals, dates, and donation progress |
| 📈 **Dashboard Analytics** | Real-time metrics: total raised, donor counts, at-risk supporters |
| 👥 **Segment Builder** | Create dynamic donor groups based on giving patterns and behavior |
| ⚡ **Workflow Automation** | Build automated sequences (thank-yous, reminders, follow-ups) |
| ✅ **Task Management** | Track follow-up tasks and staff assignments |

### Multi-Organization Platform
| Feature | Description |
|---------|-------------|
| 🏢 **Multi-Tenant Architecture** | Complete data isolation per organization |
| 🌐 **Public Organization Pages** | Each org gets `/org/[slug]` public landing page |
| 💳 **Public Donation Pages** | Organization-specific donation forms at `/org/[slug]/donate` |
| 📁 **Organization Directory** | Browse all public organizations at `/organizations` |
| 🔐 **Role-Based Access** | Admin, Staff, and Marketing roles with appropriate permissions |

### AI-Powered Features
| Feature | Description |
|---------|-------------|
| 🤖 **AI Donor Summaries** | GPT-4o-mini generates actionable 80-100 word donor insights |
| 📋 **Retention Risk Analysis** | AI-enhanced risk assessment with next-action recommendations |
| 🎯 **Personalized Suggestions** | Uses donor notes and history to customize recommendations |

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16.0.10** – App Router with React Server Components
- **React 19.2.3** – Latest React with modern hooks
- **JavaScript** – Chosen for rapid MVP development (no TypeScript)

### Database & ORM
- **PostgreSQL** – Production-ready relational database
- **Prisma 7.1.0** – Type-safe ORM with migrations
- **Neon PostgreSQL** – Serverless cloud database

### UI & Styling
- **Tailwind CSS 4.1.18** – Utility-first styling with dark theme
- **shadcn/ui** – Accessible React components (Radix UI-based)
- **Lucide Icons** – Beautiful, customizable icon library

### Forms & Validation
- **React Hook Form 7.68.0** – Performant forms with minimal re-renders
- **Zod 4.2.0** – Runtime schema validation
- **@hookform/resolvers** – Zod integration for form validation

### AI Integration
- **OpenAI GPT-4o-mini** – Cost-effective model for donor summaries
- **Server-side only** – API keys never exposed to client
- **Minimal data exposure** – Only summary metrics sent, no raw PII

### Testing
- **Vitest 4.0.15** – Fast unit and integration testing
- **Playwright** – Cross-browser E2E testing
- **MSW** – API mocking for reliable tests

### Deployment
- **Vercel** – Optimized Next.js hosting
- **pnpm 10.18.1** – Fast, efficient package management

---

## 🏗️ Architecture Overview

### Multi-Tenant Data Model

```
Organization (tenant boundary)
├── Users[]         → Staff with roles (ADMIN, STAFF, MARKETING)
├── Donors[]        → Donor profiles with calculated retention metrics
├── Donations[]     → Individual gifts linked to donors + campaigns
├── Campaigns[]     → Fundraising initiatives with goals
├── Segments[]      → Dynamic donor groupings (many-to-many via SegmentMember)
├── Workflows[]     → Automation sequences with steps
└── Tasks[]         → Follow-up actions for staff
```

### Key Database Features
- **Organization isolation**: Every query filtered by `organizationId`
- **Calculated fields**: `totalAmount`, `totalGifts`, `lastGiftDate`, `retentionRisk` auto-updated
- **12 domain enums**: DonorStatus, RetentionRisk, DonationType, CampaignStatus, etc.
- **Public org support**: Organizations have `slug`, `isPublic`, `description` for public pages

### Authentication System
- **Session-based auth** with HTTP-only cookies (not JWT)
- **bcrypt password hashing** with configurable salt rounds
- **Database sessions** for server-side control
- **Route protection** via Next.js middleware and layout guards

### API Design
- **RESTful endpoints** under `/api/[entity]`
- **Request-based session validation** – `request.cookies.get('session')`
- **Zod validation** on all inputs
- **Structured JSON responses** with proper error handling

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10+ (`npm install -g pnpm`)
- PostgreSQL database (local or [Neon](https://neon.tech) cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/Jayisacoder/donorconnect.git
cd donorconnect

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Credentials
After seeding:
- **Email**: `admin@hopefoundation.org`
- **Password**: `password123`

---

## 📋 Available Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create and apply migrations
npx prisma studio     # Visual database browser
npx prisma db seed    # Load sample data (75 donors, 200+ donations)

# Testing
pnpm test             # Run Vitest unit tests
pnpm test:watch       # Watch mode
pnpm test:ui          # Vitest UI
pnpm test:e2e         # Playwright E2E tests
```

---

## 📊 Seed Data Overview

The seed script creates realistic nonprofit data for development:

| Entity | Count | Details |
|--------|-------|---------|
| Organizations | 2 | Hope Foundation, Green Earth Alliance (with slugs) |
| Users | 10 | Staff members with Admin/Staff/Marketing roles |
| Donors | 75 | Varied retention risk profiles |
| Donations | 200+ | Across multiple campaigns |
| Campaigns | 5 | Annual fund, emergency response, major gifts, etc. |
| Segments | 4 | First-time, loyal, lapsed, major gift prospects |
| Workflows | 2 | Welcome series, retention campaigns |

### Donor Risk Distribution
- **40%** First-time donors (HIGH risk) → Welcome series candidates
- **30%** Two-gift donors (MEDIUM risk) → Retention campaign targets
- **20%** Loyal donors (LOW risk) → Upgrade cultivation
- **10%** Lapsed donors (CRITICAL risk) → Reactivation outreach

---

## 🤖 AI Integration Details

### How It Works
1. Staff clicks "AI Summary" button on donor profile
2. Server fetches donor data (gifts, totals, risk, notes) – scoped to organization
3. Minimal summary payload sent to OpenAI (no raw PII like addresses)
4. GPT-4o-mini generates 80-100 word actionable summary
5. Summary returned with risk assessment and suggested next action

### API Endpoint
```
POST /api/ai/summarize-donor
Body: { donorId: "..." }
Response: { summary: "..." }
```

### Prompt Engineering
```javascript
// System prompt enforces factual, concise output
{ role: 'system', content: 'Be concise, factual, and actionable. Do not invent data.' }

// User prompt includes structured donor data
`Summarize this donor in 80-100 words max with risk assessment and suggested next action. 
Use any notes to personalize the recommendation. Data: ${JSON.stringify(summaryPayload)}`
```

### Responsible AI Practices
- ✅ Server-side only (keys never exposed)
- ✅ Organization scoping enforced before any AI call
- ✅ Minimal data sent (summary metrics, not raw records)
- ✅ No training or logging of user content
- ✅ Opt-in feature (user must click button)
- ✅ Error handling returns user-friendly messages

See [/ai-policy](https://donorconnect-three.vercel.app/ai-policy) for complete AI documentation.

---

## 📁 Project Structure

```
donorconnect/
├── prisma/
│   ├── schema.prisma      # Database schema with 12 enums
│   ├── seed.js            # Test data generator
│   └── generated/         # Prisma client output
├── src/
│   ├── app/
│   │   ├── (auth)/        # Public auth pages (login, register)
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   │   ├── campaigns/
│   │   │   ├── dashboard/
│   │   │   ├── donations/
│   │   │   ├── donors/
│   │   │   ├── segments/
│   │   │   ├── tasks/
│   │   │   └── workflows/
│   │   ├── (public)/      # Public donation pages
│   │   ├── api/           # REST API routes
│   │   │   ├── ai/        # AI summary endpoint
│   │   │   ├── auth/      # Login, register, logout
│   │   │   ├── campaigns/
│   │   │   ├── donations/
│   │   │   ├── donors/
│   │   │   ├── organizations/
│   │   │   ├── segments/
│   │   │   ├── tasks/
│   │   │   └── workflows/
│   │   ├── org/[slug]/    # Public org pages
│   │   ├── organizations/ # Org directory
│   │   ├── ai-policy/     # AI ethics documentation
│   │   ├── evidence/      # Rubric evidence page
│   │   └── reflection/    # Project reflection
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── donors/        # Donor-specific components
│   │   ├── campaigns/     # Campaign components
│   │   ├── donations/     # Donation components
│   │   ├── segments/      # Segment builder
│   │   └── workflows/     # Workflow builder
│   ├── hooks/             # Custom React hooks (useDonors, useCampaigns, etc.)
│   └── lib/
│       ├── api/           # Business logic layer
│       ├── validation/    # Zod schemas
│       ├── auth.js        # Password utilities
│       ├── session.js     # Session management
│       └── db.js          # Prisma client singleton
└── tests/                 # Unit, integration, and E2E tests
```

---

## 🔐 Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Optional (enables AI features)
OPENAI_API_KEY="sk-..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📄 Documentation Pages

| Page | Purpose |
|------|---------|
| [/ai-policy](https://donorconnect-three.vercel.app/ai-policy) | AI ethics, safeguards, and responsible use |
| [/evidence](https://donorconnect-three.vercel.app/evidence) | Rubric criteria with direct links to implementation |
| [/reflection](https://donorconnect-three.vercel.app/reflection) | Project learnings and challenges |
| [/testing](https://donorconnect-three.vercel.app/testing) | User testing capture tool |
| [/why-donorconnect](https://donorconnect-three.vercel.app/why-donorconnect) | Value proposition for nonprofits |

---

## 📝 User Feedback & Change Mapping

### Feedback Collection

User feedback was collected via a Google Form survey from testers evaluating the DonorConnect platform.

**📋 Feedback Form**: [Google Forms Survey](https://docs.google.com/forms/d/e/1FAIpQLSdKfh2lIjZUgcthW_eSJoiIqUW85OJikZjQe2_F9ZAaE2j42g/viewform?usp=header)

*Survey collected responses on: ease of navigation, pain points, platform comparison to other tools, feature requests, and general feedback.*

---

### Feedback Change Mapping Table

| Feedback ID | User Feedback | Problem Identified | Decision Made | Change Implemented |
|-------------|---------------|-------------------|---------------|-------------------|
| **FB-01** | "Campaign ID says it's optional but it seems it is required" | Users confused by form field labeling when campaign is conditionally required | Clarify optional field behavior in UI | Updated donation form to show "(optional)" label clearly; improved campaign dropdown placeholder text |
| **FB-02** | "Making the text visible in the drop down boxes" | Dropdown text contrast insufficient; hard to read selections | Improve form element visibility | Increased text contrast in Select components; darkened dropdown option text from gray-400 to gray-100 |
| **FB-03** | "A way to edit names once you type the donor in" | Users could not edit donor names after initial entry | Enable inline editing for donor records | Added edit functionality to donor profile page; implemented PUT endpoint for donor updates |
| **FB-04** | "The filters and the edit campaigns - I could not act on them" | Campaign edit and filter functionality unclear or broken | Fix campaign management interactions | Repaired campaign edit modal; added clear filter reset button; improved filter state persistence |
| **FB-05** | "The ability to get a synopsis on everything" | Users wanted quick overview of donor information | Provide summarized donor insights | Implemented AI-powered donor summary feature with GPT-4o-mini; added "AI Summary" button on donor profiles |
| **FB-06** | "Demo credentials feature is currently [unclear]" | Test login credentials not prominently displayed | Make demo access easier | Added demo credentials banner on login page showing `admin@hopefoundation.org` / `password123` |
| **FB-07** | "When logging a donation, the dropdown [issue]" | Donation form dropdown had usability issues | Improve donation logging experience | Fixed donor selection dropdown; added search/filter within dropdown; improved loading states |

---

### Before & After Examples

#### FB-02: Dropdown Visibility
- **Before**: Dropdown text used `text-gray-400`, making selections hard to read on dark background
- **After**: Updated to `text-gray-100` with proper contrast ratio for accessibility

#### FB-05: Donor Synopsis
- **Before**: Staff had to manually read through donation history and notes to understand donor status
- **After**: One-click "AI Summary" generates 80-100 word actionable insight with retention risk and next steps

#### FB-06: Demo Credentials
- **Before**: Users had to find login info in README or documentation
- **After**: Login page displays credentials directly with copy-to-clipboard functionality

---

### Summary

> **Feedback creates decisions. Decisions create changes. Changes must be visible.**

All changes in DonorConnect can be traced back to specific user feedback collected during testing. This iterative approach ensures the platform addresses real user needs rather than assumed requirements.

---

## 🎓 Key Learning Outcomes

Building DonorConnect demonstrates:

1. **Full-stack development** – Next.js App Router with React Server Components
2. **Database design** – Complex relational model with Prisma ORM
3. **Authentication** – Secure session-based auth without external providers
4. **Multi-tenancy** – Organization-scoped data isolation
5. **AI integration** – Responsible use of LLMs for user assistance
6. **Form handling** – React Hook Form with Zod validation
7. **Testing strategy** – Unit, integration, and E2E testing
8. **Deployment** – Production deployment with Vercel

---

## 🔗 Links

- **Live Demo**: [https://donorconnect-three.vercel.app](https://donorconnect-three.vercel.app)
- **GitHub**: [https://github.com/Jayisacoder/donorconnect](https://github.com/Jayisacoder/donorconnect)
- **AI Policy**: [/ai-policy](https://donorconnect-three.vercel.app/ai-policy)
- **Evidence**: [/evidence](https://donorconnect-three.vercel.app/evidence)
- **Reflection**: [/reflection](https://donorconnect-three.vercel.app/reflection)

---

## 📄 License

ISC License – Feel free to use for learning, teaching, or building nonprofit tools.
