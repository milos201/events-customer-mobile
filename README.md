# events-customer-mobile

Expo Router mobile client for customer discovery, booking, and account flows.

## Development

Install dependencies:

```bash
pnpm install
```

Start the app:

```bash
pnpm start
```

Common checks:

```bash
pnpm lint
pnpm test --runInBand
bunx tsc --noEmit
```

## Project layout

- `app/`: Expo Router route files and layouts
- `src/features/`: screen logic, queries, and feature-specific UI
- `src/components/`: shared UI primitives
- `src/theme/`: theme tokens and styling primitives

## Notes

- This repo uses `pnpm`, not `npm`.
- The old Expo starter reset flow has been removed because it did not match this project structure.
