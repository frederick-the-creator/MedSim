# MedSim

MedSim is a patient interaction simulation platform that facilitates realistic interview practice for medical students. Key feature is the case practice with voice, assessment and coaching agents

## Development Workflow and Environment Overview

### Environments

**Overview**

- Development: Local (localhost)
- Staging: Pre-production testing
- Production: Live environment

**Deployment**

Single deployment - Express serves both the API and the prebuilt client from the same server and port. In dev, Vite is mounted on Express so both API and SPA share the same server/port. In prod, Express serves the built SPA from dist/public and the API from /api, still single-port.

- Staging - `https://staging-medsim-production.up.railway.app`
- Production - `https://medsim-production.up.railway.app`

**Environment Variables**

| Variable                | Description                                              | Local            | Staging          | Production       |
| ----------------------- | -------------------------------------------------------- | ---------------- | ---------------- | ---------------- |
| `GEMINI_API_KEY`        | Gemini API Key                                           | `Production Key` | `Production Key` | `Production Key` |
| `ELEVENLABS_API_KEY`    | Elevenlabs API Key                                       | `Production Key` | `Production Key` | `Production Key` |
| `VITE_MOCK_VOICE_AGENT` | Flag to block Elevenlabs call and use dummy data instead | `true`           | `true`           | `false`          |

### Version Control

**Git branches**

- `your-feature-branch` - Local Development
- `staging` → STAGING (preview site + staging API)
- `main` → PRODUCTION (prod site + prod API)

**Branch Protection**

- Protect `main` from direct pushes.
- Require PR merge from `staging → main`.

**Deploying to Staging**

1. Merge `your-feature-branch` to `staging` branch:

<pre>
git checkout staging
git merge your-feature-branch
git push origin staging</pre>

2. Application deploys automatically via Railway (staging environment)

**Deploying to Production**

1. Merge `staging` branch to `main` branch:

<pre>
git checkout main
git merge staging
git push origin main</pre>

2. Application deploys automatically via Railway (production environment)
