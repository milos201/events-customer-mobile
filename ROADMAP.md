# Events Customer Mobile Roadmap

## Purpose

This repository is the mobile client for the Events platform.

The recommended direction is:

- Expo on top of React Native
- TypeScript
- Expo Router
- TanStack Query
- React Hook Form + Zod
- Generated API client from `openapi/openapi.json`
- `@better-auth/expo` + `expo-secure-store`
- `react-native-maps`
- `expo-notifications`

## Source Of Truth

Use [`/Users/milos/Projects/events-api/USER_STORIES.md`](/Users/milos/Projects/events-api/USER_STORIES.md) as the main product and flow reference while building this app.

That file should drive:

- screen scope
- booking flows
- public vs authenticated behavior
- appointment states
- staff/admin boundaries
- future prioritization

## Why This Stack Fits

- The backend is already TypeScript-based, so staying in TypeScript reduces duplication across DTOs, validation shapes, and API integration.
- The backend already generates OpenAPI, which makes client generation a natural fit.
- Auth is session and cookie based, so Expo is a practical choice when paired with a centralized authenticated fetch layer.
- Push notifications already exist in backend shape and flow, so mobile can plug into that once the core booking journey is working.
- Expo provides the fastest path to shipping iOS and Android while keeping access to native capabilities through development builds.

## Key Implementation Notes

- Use Expo development builds, not just Expo Go, because the app will need native integrations such as maps, auth handling, and notifications.
- Prefer `react-native-maps` over `expo-maps` for this product. `expo-maps` is still alpha and is not the safer choice for a map-centric app.
- Decide early what `pushToken` means. Use either Expo push tokens or native provider tokens consistently. Do not mix both in one field.
- Keep admin-heavy business management on web first. Focus the first mobile release on the customer experience.

## Product Focus For V1

Ship customer mobile first:

- browse nearby approved barber shops on a map
- view barber shop details
- inspect services and employees
- select date, employee or `any employee`, and time slot
- sign in before booking
- create appointment requests
- view appointment status
- cancel upcoming appointments

Keep these primarily on web/admin surfaces at first:

- dense business management
- service management
- employee management
- schedules and shop operations
- global admin approval flows

## Delivery Phases

### Phase 0: Foundation

- Keep Expo + TypeScript as the base app architecture.
- Set up Expo Router route groups for public, auth, and customer flows.
- Add shared environment/config handling.
- Add linting, formatting, and a basic folder structure for features, api, lib, and ui.

### Phase 1: API And Auth

- Generate the API client from `openapi/openapi.json`.
- Create a single API layer with request interceptors/wrappers for cookies and session-aware requests.
- Integrate `@better-auth/expo`.
- Store secure auth state with `expo-secure-store`.
- Confirm how native requests pass and refresh session state against the backend.

### Phase 2: Discovery

- Build the public browsing experience from the user stories.
- Show nearby approved barber shops on a map.
- Handle location granted and denied states.
- Add a shop details screen with core profile information, services, and employees.

### Phase 3: Booking Flow

- Implement date selection and slot browsing.
- Support both specific employee selection and `any employee`.
- Validate booking inputs with React Hook Form + Zod.
- Create the appointment request flow with pending status handling.
- Require sign-in before final booking submission.

### Phase 4: Customer Account

- Show booking history and appointment details.
- Display appointment statuses clearly: pending, confirmed, rejected, cancelled, completed, and no-show.
- Allow customers to cancel their own upcoming appointments.

### Phase 5: Notifications

- Register device push tokens.
- Connect the app to the backend push notification flow.
- Notify customers about booking status changes.

### Phase 6: Hardening

- Improve loading, retry, and offline-adjacent UX with TanStack Query.
- Add error boundaries and empty states.
- Add analytics/event tracking for the main funnel.
- Add tests for booking-critical logic and API integration points.

## Suggested Folder Direction

Example target structure:

- `app/` for routes
- `src/features/` for domain features such as auth, shops, bookings, and account
- `src/api/` for generated client and API wrappers
- `src/lib/` for config, auth helpers, query client, and utilities
- `src/components/ui/` for shared presentation components
- `src/types/` only when types are app-specific and not generated

## Immediate Next Steps

1. Add the generated API client flow from the backend OpenAPI output.
2. Replace remaining hand-written DTOs with generated types.
3. Wire location permission handling into discovery.
4. Add push notification registration and status-change handling.
5. Expand tests around auth, booking, and appointment state transitions.
