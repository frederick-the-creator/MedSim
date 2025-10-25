# MedSim - Medical Communication Training Platform

## Overview

MedSim is a web-based medical education platform that enables healthcare professionals to practice patient communication skills through AI-simulated conversations. The application provides realistic medical case scenarios where users can conduct simulated consultations with AI-powered virtual patients and receive structured feedback on their communication and clinical reasoning abilities.

The platform focuses on ophthalmology cases (eye clinic scenarios) and evaluates users across multiple competency areas including history taking, clinical reasoning, communication & empathy, and patient-centered care (ICE - Ideas, Concerns, Expectations).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Client-side routing with Wouter (lightweight alternative to React Router)

**UI Component Library**: Shadcn/ui built on Radix UI primitives
- Material Design influenced with healthcare-specific customizations
- Custom design tokens defined in Tailwind CSS configuration
- Professional, clean aesthetic prioritizing information clarity
- Responsive layouts optimized for desktop medical professional workflows

**State Management**:
- TanStack Query (React Query) for server state and API data fetching
- Local component state with React hooks for UI interactions
- No global state management library (Redux/Zustand) - intentionally kept simple

**Styling Strategy**:
- Tailwind CSS utility-first approach
- Custom design system based on Material Design principles
- Typography: Inter font for body text, JetBrains Mono for medical codes
- Spacing primitives follow Tailwind's standard scale (2, 4, 6, 8, 12, 16)
- Color system uses HSL CSS variables for theme consistency

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Design**: RESTful API pattern with `/api` prefix for all endpoints
- Currently minimal routes defined - placeholder structure exists
- Designed for future CRUD operations on medical cases and user data

**Session Management**: Express session middleware with connect-pg-simple
- PostgreSQL-backed session storage
- Prepared for authentication/authorization implementation

**Development Environment**:
- Hot Module Replacement (HMR) via Vite in development
- Replit-specific plugins for error overlays and development banners
- Custom logging middleware for API request tracking

### Data Storage Solutions

**Database**: PostgreSQL via Neon serverless
- Drizzle ORM for type-safe database operations
- Schema-first approach with migrations in `/migrations` directory
- Current schema includes basic user table (username/password)
- Medical cases currently stored as TypeScript constants (not yet in database)

**Storage Interface Pattern**:
- Abstract `IStorage` interface defining CRUD methods
- `MemStorage` in-memory implementation for development
- Designed to be swapped with database-backed implementation
- Located in `server/storage.ts`

**Database Schema** (`shared/schema.ts`):
- Users table with UUID primary keys
- Zod schemas for runtime validation
- TypeScript types inferred from Drizzle schema definitions

### External Dependencies

**Voice AI Integration**: ElevenLabs Conversational AI
- `@elevenlabs/client` and `@elevenlabs/react` packages
- WebSocket-based real-time voice conversations
- Agent IDs configured per medical case scenario
- Handles voice input/output for patient simulations

**Medical Case Data Structure**:
- Predefined case scenarios in `shared/cases.ts`
- Each case includes: patient demographics, clinical findings, triage notes, patient personality profile
- Patient profile defines background, symptoms, concerns, expectations, and personality traits
- Key findings structure supports both single values and arrays (for multi-item findings)

**Form Validation**: 
- React Hook Form for form state management
- Hookform/resolvers with Zod schemas for validation
- Type-safe form inputs matching database schemas

**Design System Components**:
- Extensive Radix UI primitives (40+ components)
- Custom variants using class-variance-authority
- Accessible by default (ARIA attributes, keyboard navigation)
- Examples directory for component documentation

### Authentication & Authorization

**Current State**: Basic user schema defined but not fully implemented
- User table with username/password fields exists
- No active authentication middleware or routes
- Session infrastructure prepared but not connected

**Intended Design**:
- Username/password authentication
- Session-based authorization
- PostgreSQL session store for persistence

### Key Architectural Decisions

**Monorepo Structure**:
- `/client` - React frontend application
- `/server` - Express backend application  
- `/shared` - Shared TypeScript types and schemas
- Unified TypeScript configuration with path aliases

**Type Safety Strategy**:
- Shared schemas between frontend and backend via `/shared`
- Drizzle ORM provides database type inference
- Zod runtime validation matches TypeScript compile-time types
- Path aliases (@/, @shared/, @assets/) for clean imports

**Development vs Production**:
- Vite dev server with middleware mode in development
- Production builds to `/dist/public` for static assets
- esbuild bundles server code to `/dist/index.js`
- Environment-based plugin loading (Replit features only in dev)

**Medical Case Design Pattern**:
- Statically defined cases in TypeScript
- Each case maps to specific ElevenLabs agent ID
- Structured feedback system with category-based scoring
- Patient profiles guide AI agent behavior and responses

**Code Organization Philosophy**:
- Feature-based component structure
- Shared UI components in `/components/ui`
- Page-level components in `/pages`
- Examples directory for component playground/documentation