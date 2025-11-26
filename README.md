# MedSim

MedSim is a patient interaction simulation platform that facilitates realistic interview practice for medical students. Key feature is the case practice with voice, assessment and coaching agents

This application was bootstrapped in Replit but has since moved to a more contrallable environment

## TechStack

Infrastructure:

- Frontend & Backend: Single deployment via Railway, where Express serves both the API and the prebuilt client from the same server and port. In dev, Vite is mounted on Express so both API and SPA share the same server/port. In prod, Express serves the built SPA from dist/public and the API from /api, still single-port.
- Database: Supabase (PostgreSQL + Storage buckets)
- Auth: TBD

Languages & Libraries:

- Frontend: Typescript, React, TailwaindCSS, Vite
- Backend: Typescript, Node.js & Express, Pino (Logging)

## Development Workflow and Environment Overview

### Environments

**Overview**

- Development (Local development)
- Staging (Published for QA / Testing)
- Production

**Deployment**

- Staging - `https://staging-medsim-production.up.railway.app`
- Production - `https://medsim-production.up.railway.app`

**Environment Variables**

| Variable                        | Description                                              | Local            | Staging          | Production       |
| ------------------------------- | -------------------------------------------------------- | ---------------- | ---------------- | ---------------- |
| `GEMINI_API_KEY`                | Gemini API Key                                           | `Production Key` | `Production Key` | `Production Key` |
| `ELEVENLABS_API_KEY`            | Elevenlabs API Key                                       | `Production Key` | `Production Key` | `Production Key` |
| `VITE_MOCK_VOICE_AGENT`         | Flag to block Elevenlabs call and use dummy data instead | `true`           | `true`           | `false`          |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase DB Public Key (Frontend)                        | `Staging Key`    | `Staging Key`    | `Production Key` |
| `SUPABASE_PUBLISHABLE_KEY`      | Supabase DB Public Key (Backend)                         | `Staging Key`    | `Staging Key`    | `Production Key` |
| `VITE_SUPABASE_URL`             | Supabase DB Public Key (Frontend)                        | `Staging Key`    | `Staging Key`    | `Production Key` |
| `SUPABASE_URL`                  | Supabase DB Public Key (Backend)                         | `Staging Key`    | `Staging Key`    | `Production Key` |
| `LOG_PRETTY`                    | Supabase DB URL (Pretty logs for local debugging)        | `true`           | `false`          | `false`          |
| `LOG_LEVEL`                     | Supabase DB URL (Extensive logs for local debugging)     | `debug`          | TBC              | TBC              |

### Version Control

**Git branches**

- `main` → PRODUCTION (prod site + prod API)
- `staging` → STAGING (preview site + staging API)
- `your-feature-branch` - Local Development

**Database**

- Currently changes are made manually in all environments. Will be setting up use of migration files in future

**Deploying Local Changes to Staging**

1. Merge `your-feature-branch` to `staging` branch:

<pre>
git checkout staging
git merge your-feature-branch
git push origin staging</pre>

2. Application deploys automatically via Railway (staging environment)

**Deploying Staging to Production**

1. Merge `staging` branch to `main` branch:

<pre>
git checkout main
git merge staging
git push origin main</pre>

2. Application deploys automatically via Railway (production environment)
