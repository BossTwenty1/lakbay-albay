# Lakbay Albay Development Instructions

## Project
Lakbay Albay is a responsive Smart Tourism and itinerary-planning prototype for Albay, Philippines.

## Current stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Existing TripProvider for global state
- localStorage persistence
- Existing destination dataset in lib/destinations.ts

## Core rules
- Preserve working Phase 1 and Phase 2 functionality.
- Do not replace the existing TripProvider with another state-management system.
- Do not duplicate the destination dataset.
- Keep selectedIds as the canonical selected-place order.
- Preserve Must Visit and favorites behavior.
- Keep localStorage hydration-safe.
- Maintain mobile, tablet, and desktop responsiveness.
- Reuse existing components and visual system whenever possible.
- Avoid unnecessary dependencies.
- Run typecheck and production build after major changes.

## Product scope
- Pilot area: Albay.
- Initial corridor: Legazpi–Daraga–Camalig.
- Do not expand to full Bicol unless explicitly requested.

## UX terminology
Use:
- Add to Trip
- My Trip
- Must Visit
- Private Vehicle
- Smart Itinerary Generator
- Demo information / Demo estimate

Do not use:
- Add to Cart
- Checkout
- Private Car

## Current phase boundaries
Phase 3:
- Trip Preferences only
- Preference persistence
- Validation
- Accessibility conflict preview
- /itinerary placeholder

Do NOT implement the real Smart Itinerary Generator until Phase 4.