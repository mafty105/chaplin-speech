# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Charlie Talk is a Japanese speech practice application using the "Chaplin method" - a technique where users generate word association chains from given topics to inspire impromptu speeches. The app is built with Next.js 15 App Router and integrates with Google Gemini AI.

## Development Commands

```bash
pnpm dev        # Start development server on port 3000
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Architecture Overview

### API Routes Pattern
All AI interactions go through server-side route handlers to keep the API key secure:
- `/api/generate-topics` - POST endpoint expecting `{ participants: number }`
- `/api/generate-associations` - POST endpoint expecting `{ topic: string }`

Client components use `/src/lib/api-client.ts` functions instead of direct API calls.

### Component Architecture
Components follow a compound pattern with variants managed by CVA:
- UI components in `/src/components/ui/` are generic, reusable atoms
- Feature components like `TopicsList` handle business logic and state
- All components use the design token system from `/src/lib/design-tokens.ts`

### Styling System
The app uses Atlassian Design System principles:
- 8px base spacing unit
- Specific color palette (#0052CC primary, #172B4D text, etc.)
- Components use `cn()` utility for className merging
- Avoid inline styles; use Tailwind classes

### AI Integration Pattern
Gemini API calls follow this structure:
1. Structured prompts with good/bad examples
2. JSON response format expected
3. Fallback data for rate limiting or errors
4. Temperature settings: 0.8 for topics, 0.9 for associations

## Key Technical Decisions

### Why Server-Side API Routes
The Gemini API key must never be exposed to the client. All AI operations happen server-side with structured error handling and fallbacks.

### Session Storage Strategy
Topics and associations are cached in sessionStorage to:
- Reduce API calls
- Provide instant loading on page refresh
- Maintain state without a database

### Mobile-First Design
Max-width constraint of 480px ensures optimal mobile experience while remaining usable on desktop.

## Common Tasks

### Adding New UI Components
1. Create in `/src/components/ui/` following existing patterns
2. Use CVA for variants
3. Include proper TypeScript interfaces
4. Follow Atlassian color tokens

### Modifying AI Prompts
Edit prompts in `/src/app/api/generate-*/route.ts` files. Always include:
- Clear instructions in Japanese
- Good and bad examples
- JSON output format specification

### Updating Fallback Data
Fallback topics and associations are defined in the respective route handlers. Ensure variety and appropriateness for speech practice.

## Important Constraints

### API Rate Limits
- 15 requests/minute
- 1400 requests/day (safety limit)
- Always provide fallback data

### Japanese Language Focus
All user-facing text and AI-generated content should be in Japanese. The app is specifically designed for Japanese speakers practicing speeches.

### No Authentication
Currently stateless - no user accounts or persistent storage. All data is session-based.

## Testing Approach

Manual testing is currently used. When testing:
1. Check both successful API responses and fallback scenarios
2. Verify mobile responsiveness
3. Test with different participant counts (1-10)
4. Ensure smooth animations on all interactions