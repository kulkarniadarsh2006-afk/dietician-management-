# Dietitian Management System (NutriCare)

> **Foundation Scaffolding & Infrastructure Phase**  
> A production-minded clinical management platform engineered specifically for Registered Dietitians and Nutritionists handling Protected Health Information (PHI).

---

## 1. Overview & System Mission

The Dietitian Management System is built from first principles with a security-first, clinical-grade architecture. Rather than treating compliance and security as an afterthought, this repository establishes the hardened foundation for:

- Strict healthcare data isolation (HIPAA alignment and zero-PHI logging).
- Row Level Security (RLS) and short-lived private storage signed URLs.
- Type-safe integration clients for Google Workspace (Forms & Sheets) and Meta WhatsApp Business Platform Cloud API (official endpoints only).
- An accessible, responsive clinician app shell with mobile drawer navigation and dark-mode compatible design tokens.

_Note: In accordance with foundation phase boundaries, business features (e.g., specific diet plan generators, patient CRM rows, live appointment bookings, and automated ingestion pipelines) belong to subsequent development phases._

---

## 2. Prerequisites

- **Node.js**: `20 LTS` (pinned via `.nvmrc` and `engines` in `package.json`).
- **Package Manager**: `pnpm` (v12 recommended) or `npm` (v10+).
- **Operating System**: Cross-platform (Windows, macOS, Linux).

---

## 3. Installation

Clone the repository and install dependencies using your preferred package manager:

```bash
# Using pnpm (Recommended)
pnpm install

# Or using npm
npm install
```

---

## 4. Environment Setup

Copy `.env.example` to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

### Obtaining Credentials by Service

#### A. Core Application

| Variable              | Description          | Where to Obtain                                                         | Exposure    |
| :-------------------- | :------------------- | :---------------------------------------------------------------------- | :---------- |
| `NEXT_PUBLIC_APP_URL` | Application root URL | `http://localhost:3000` for local development or your production domain | Public      |
| `NODE_ENV`            | Runtime environment  | `development`, `test`, or `production`                                  | Server-Only |
| `PORT`                | Local dev port       | Default `3000`                                                          | Server-Only |

#### B. Supabase (Database, Auth & Storage)

| Variable                               | Description                       | Where to Obtain                                                         | Exposure        |
| :------------------------------------- | :-------------------------------- | :---------------------------------------------------------------------- | :-------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase API URL                  | Supabase Dashboard -> **Project Settings** -> **API**                   | Public          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Publishable / Anon JWT Key | Supabase Dashboard -> **Project Settings** -> **API**                   | Public          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Legacy Alias for Publishable Key  | Supabase Dashboard -> **Project Settings** -> **API**                   | Public          |
| `SUPABASE_SERVICE_ROLE_KEY`            | Administrative Service Role Key   | Supabase Dashboard -> **Project Settings** -> **API** (CRITICAL SECRET) | **Server-Only** |

#### C. Google APIs (Forms & Sheets)

| Variable                       | Description               | Where to Obtain                                                                        | Exposure        |
| :----------------------------- | :------------------------ | :------------------------------------------------------------------------------------- | :-------------- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account IAM Email | Google Cloud Console -> **IAM & Admin** -> **Service Accounts**                        | Server-Only     |
| `GOOGLE_PRIVATE_KEY`           | RSA Private Key PEM       | Generated key downloaded from Service Account in GCP Console (escape newlines as `\n`) | **Server-Only** |
| `GOOGLE_FORMS_FOLDER_ID`       | Drive Folder ID           | Google Drive folder URL holding clinical intake questionnaires                         | Server-Only     |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Target Spreadsheet ID     | The ID segment inside your target Google Sheet URL                                     | Server-Only     |

_Note: In Google Cloud Console, enable the **Google Sheets API** and **Google Forms API** for your project, and share your spreadsheet with the service account email._

#### D. Meta WhatsApp Business Cloud API

| Variable                        | Description               | Where to Obtain                                                                                | Exposure        |
| :------------------------------ | :------------------------ | :--------------------------------------------------------------------------------------------- | :-------------- |
| `WHATSAPP_PHONE_NUMBER_ID`      | Cloud Phone Number ID     | Meta Developer Portal -> **WhatsApp** -> **API Setup**                                         | Server-Only     |
| `WHATSAPP_BUSINESS_ACCOUNT_ID`  | WABA ID                   | Meta Developer Portal -> **WhatsApp** -> **API Setup**                                         | Server-Only     |
| `WHATSAPP_ACCESS_TOKEN`         | System User Access Token  | Meta Business Manager -> **System Users** (Permanent Token with `whatsapp_business_messaging`) | **Server-Only** |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Custom Verification Token | Choose any secure string and match it in Meta Webhook configuration                            | Server-Only     |
| `WHATSAPP_APP_SECRET`           | Meta App Secret           | Meta Developer Portal -> **App Settings** -> **Basic** (Used for HMAC-SHA256 signature checks) | **Server-Only** |

---

## 5. Development & Quality Gate Scripts

| Script         | Command             | Purpose                                                        |
| :------------- | :------------------ | :------------------------------------------------------------- |
| `dev`          | `pnpm dev`          | Starts local Next.js development server on port 3000           |
| `build`        | `pnpm build`        | Compiles strict Next.js production build                       |
| `start`        | `pnpm start`        | Runs the compiled production build                             |
| `lint`         | `pnpm lint`         | Runs Next.js ESLint verification                               |
| `lint:fix`     | `pnpm lint:fix`     | Automatically fixes autofixable ESLint errors                  |
| `typecheck`    | `pnpm typecheck`    | Runs TypeScript compiler check (`tsc --noEmit`) in strict mode |
| `format`       | `pnpm format`       | Formats all code files using Prettier                          |
| `format:check` | `pnpm format:check` | Verifies code conforms to formatting standards                 |
| `check`        | `pnpm check`        | Runs combined verification gate (`typecheck` + `lint`)         |

---

## 6. Architecture & Directory Rationale

```
src/
├── app/                     # Next.js App Router (layouts, segment error boundaries, loading states)
│   ├── (auth)/              # Route group for login and authentication
│   ├── (dashboard)/         # Authenticated shell layout (responsive sidebar & drawer)
│   │   ├── dashboard/       # Overview metrics & integration status
│   │   ├── patients/        # Caseload & PHI directory stub
│   │   ├── diet-plans/      # Nutritional guidelines & meal template stub
│   │   ├── appointments/    # Consultation scheduling stub
│   │   ├── messages/        # WhatsApp Cloud API messaging hub stub
│   │   ├── forms/           # Google Forms & Sheets intake stub
│   │   └── settings/        # System configuration & secret isolation status
│   └── api/
│       ├── health/          # Sanitized health check reporting uptime & integrations
│       └── webhooks/        # Inbound webhooks (Meta challenge verification & HMAC check)
├── components/
│   ├── shell/               # App layout shell, desktop sidebar, mobile drawer, accessible nav
│   └── ui/                  # Accessible design token primitives (button, card, input, badge, skeleton)
├── config/
│   ├── env.ts               # Fail-fast Zod environment loader with strict client/server boundaries
│   └── site.ts              # System metadata & route definitions
├── db/
│   ├── repositories/        # Repository pattern isolating queries from UI and components
│   └── supabase/            # Client factories (browser, server cookie handler, admin service role)
├── integrations/
│   ├── google/              # Typed Google Sheets/Forms client wrapper via Service Account JWT
│   └── whatsapp/            # Official Meta WhatsApp Cloud API client wrapper & HMAC signature verification
├── lib/
│   ├── auth/                # Session helpers & role assertions
│   ├── errors/              # Domain error hierarchy with HTTP statuses
│   ├── logger/              # Zero-PHI healthcare safe logger with automated redaction
│   └── utils.ts             # Tailwind class merging utility (cn)
└── middleware.ts            # Edge session refresh and route protection
```

---

## 7. Security & Compliance Principles

1. **Zero-PHI Logging**: All application logging passes through `src/lib/logger/index.ts`. Patient names, contact details, diagnoses, diet notes, and auth tokens are automatically redacted.
2. **Server/Client Boundary Enforcement**: All files accessing private keys, database service roles, or Meta secrets import `'server-only'`, preventing accidental bundling into browser JavaScript.
3. **HTTP Security Headers**: Enforced in `next.config.mjs` including `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `Permissions-Policy`.
4. **Row Level Security (RLS) & Signed URLs**: Full architectural designs documented in `docs/rls-and-storage-design.md`. Direct database access by client components is blocked.
5. **HMAC Webhook Verification**: Meta WhatsApp inbound webhooks verify cryptographic signatures via constant-time buffer comparison (`crypto.timingSafeEqual`) to neutralize timing attacks.

---

## 8. Deployment Notes (Vercel & Supabase Hosted)

- **Environment-Driven Configuration**: No hardcoded `localhost` references. All base URLs and endpoints resolve through `env.NEXT_PUBLIC_APP_URL`.
- **Deploying to Vercel**:
  1. Import the GitHub repository (`https://github.com/kulkarniadarsh2006-afk/dietician-management-`) into Vercel.
  2. Set Framework Preset to **Next.js**.
  3. Add environment variables in **Project Settings -> Environment Variables**:
     - `NEXT_PUBLIC_APP_URL`: `https://<your-vercel-domain>.vercel.app`
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: (from Supabase Dashboard -> Project Settings -> API)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (same as Publishable Key)
     - `SUPABASE_SERVICE_ROLE_KEY`: (from Supabase Dashboard -> Project Settings -> API)
  4. Build command: `pnpm build` (or `npm run build`).
  5. **Supabase Auth Redirect Configuration**:
     - Go to Supabase Dashboard -> **Authentication** -> **URL Configuration**.
     - Set **Site URL**: `https://<your-vercel-domain>.vercel.app`
     - In **Redirect URLs**, add:
       - `https://<your-vercel-domain>.vercel.app/**`
       - `http://localhost:3000/**`
  6. **Health Check Probes**:
     - General system vitals: `/api/health`
     - Live Supabase database probe: `/api/health/supabase` (queries database and reports latency/response).

---

## 9. Roadmap for Future Phases

- **Phase 2: Authentication & Caseload**: Live Supabase email/password auth, role-based onboarding, patient intake table.
- **Phase 3: Intake Pipeline**: Automated webhook ingestion from Google Forms to Supabase via Google Sheets sync.
- **Phase 4: Meal & Diet Plan Studio**: Nutritional macro calculators, meal plan PDF generator, private bucket storage with signed download links.
- **Phase 5: Automated Patient Reminders**: WhatsApp Cloud API template dispatch for upcoming appointments and diet check-ins.
