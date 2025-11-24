Production-Ready Cleanup Plan

     Phase 1: Critical Security Fixes (done)

     1. Fix password field exposure in app/profile/page.tsx:303 (change type="text" to type="password")
     2. Add role to registration in app/register/page.tsx or remove UI field
     3. Add environment variable validation - create startup check for required env vars
     4. Fix API client auth redirect - handle 401 properly in src/lib/api-client.ts

     Phase 2: Remove All Console Statements (131 total) (done)

     Remove console.log/error/warn from:
     - All page files (app/*)
     - All hooks (src/hooks/*)
     - All components (src/components/*)
     - All services (src/services/*)
     - Auth context and lib files

     Phase 3: Error Handling & Boundaries

     1. Create error boundary component for app-level errors
     2. Add app/error.tsx for Next.js error handling
     3. Add app/not-found.tsx for 404 page
     4. Replace alert() with better UX - create simple toast/notification component
     5. Improve error messages across all API calls

     Phase 4: Navigation & Router Fixes (done)

     - Replace all window.location.href with router.push()
     - Replace window.location.reload() with state updates
     - Fix missing router imports where needed

     Phase 8: Production Configuration

     1. Add WebSocket fallback check - fail in production if env missing
     2. Improve cleanup logic in hooks (use refs for stable values)
     3. Add input validation (password min length, character counters)
     4. Standardize error response handling across services

     Phase 9: Extract Duplicate Code

     - Create shared utility for status color/label functions
     - Extract product showcase logic to shared hook
     - Move category lists to constants file
