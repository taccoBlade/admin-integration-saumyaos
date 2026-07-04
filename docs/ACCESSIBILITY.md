# Accessibility

This project targets **WCAG 2.1 Level AA** compliance.

---

## Standards & Rules Enforced

| Area | Rule / Standard |
|---|---|
| Images | All `<Image>` / `<img>` elements must have a descriptive `alt` attribute (`jsx-a11y/alt-text`) |
| ARIA | `aria-*` attributes must be valid (`jsx-a11y/aria-props`) |
| Roles | Only valid ARIA roles are used (`jsx-a11y/aria-role`) |
| Focus | All interactive elements are keyboard-focusable (`jsx-a11y/interactive-supports-focus`) |
| Labels | All form inputs have an associated `<label>` or `aria-label` (`jsx-a11y/label-has-associated-control`) |
| Dialogs | `alert()`/`confirm()` replaced with `ConfirmModal` (role="dialog", aria-modal, focus-trapped) |
| Contrast | Design tokens (`attention-500` #d4af37 on `charcoal-950` #08090b) meet ≥ 4.5:1 ratio for normal text |
| Motion | Framer Motion animations respect `prefers-reduced-motion` where applied |

---

## Running the Accessibility Audit

```bash
npm run lint:accessibility
```

This runs ESLint with the `jsx-a11y` plugin across `app/` and `components/` and writes a report to:

```
reports/a11y-report.txt
```

---

## Manual Checks (required before each release)

- [ ] Tab through every interactive element on the home, projects, logbook, and contact pages — confirm logical focus order and visible focus ring.
- [ ] Test with macOS VoiceOver: navigate sections with `VO+Right`, confirm all headings, buttons, and images are announced correctly.
- [ ] Test with NVDA (Windows) in Firefox — same checks as above.
- [ ] Run Chrome Lighthouse → Accessibility score ≥ 90.
- [ ] Verify mobile touch targets are ≥ 44 × 44 px (iOS and Android).
- [ ] Confirm skip-to-content link is the first focusable element on every page.

---

## Known Remaining Items

| Issue | Priority | Notes |
|---|---|---|
| Three.js canvas (`<canvas>`) lacks ARIA fallback text | Medium | Add `aria-label="3D background animation"` and `role="img"` |
| Some framer-motion exit animations don't respect `prefers-reduced-motion` | Low | Wrap with `useReducedMotion()` hook from Framer Motion |
| Logbook filter buttons missing `aria-pressed` state | Medium | Add `aria-pressed={isActive}` to each filter chip |
