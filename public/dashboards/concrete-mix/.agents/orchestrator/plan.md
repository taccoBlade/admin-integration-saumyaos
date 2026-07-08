# Implementation Plan

## Phase 1: Exploration
- Dispatch an Explorer agent to analyze the repository:
  - Check how the binder cards are currently structured in `templates/index.html` and `static/app.js`.
  - Check how presets are structured and loaded in `static/app.js`.
  - Check the floating status card styling in `static/styles.css`.
  - Understand the calculations in the backend (where they are located, e.g. `app.py` or another module).
  - Run the existing tests in `tests/test_engines.py` to see if they pass.
  - Review the IS10262_2019.pdf content if possible, or locate rules/specifications documents.

## Phase 2: Execution (Milestones 2, 3, 4)
- Milestone 2 (R1): Refactor Material Database & Binders
  - Worker modifies `templates/index.html` and `static/app.js` to dynamically render binder cards from the library instead of hardcoding.
  - Reviewer reviews frontend logic and card interaction.
- Milestone 3 (R2): Fix Presets UI
  - Worker adds '+ Save' button to Quick Mix Presets container and updates `static/app.js` to store custom configurations in `localStorage` and load them on startup.
  - Reviewer checks local storage functionality.
- Milestone 4 (R3): Fix Floating Window
  - Worker updates `static/styles.css` (removing `position: sticky` from `.status-card` and applying it to `.yield-card` / `.chart-card` or appropriate results card).
  - Reviewer confirms visual sticky positioning.

## Phase 3: Compliance & Verification (Milestones 5, 6)
- Milestone 5 (R4): Verification of Calculation Logic against IS10262_2019.pdf
  - Worker/Reviewer verify calculation functions.
  - Challenger tests with various mix parameters (boundary cases, edge cases).
  - Forensic Auditor runs checks for cheating or hardcoding.
- Milestone 6: E2E and Adversarial Coverage
  - Final tests and checks.
