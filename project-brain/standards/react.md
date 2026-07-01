# Engineering Standards: React

- **Client vs Server**: Declare `"use client"` only for components requiring hooks (state, effects). Keep structural page logic server-side.
- **Clean Effects**: Clean up intervals, timeouts, and listeners inside `useEffect` return statements.
- **State Flow**: Lift shared states to context providers (`os-context.tsx`) rather than prop-drilling.
