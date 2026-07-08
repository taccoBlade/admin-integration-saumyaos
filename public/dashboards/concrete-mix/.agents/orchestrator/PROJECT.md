# Project: Concrete Mix Design Bugfixes & Compliance

## Architecture
- A Flask-based web application with:
  - Frontend: `templates/index.html`, `static/app.js`, `static/styles.css`
  - Backend: `app.py` for API/server
  - Calculations: `engines/` (or similar modules, TBD)
  - Unit Tests: `tests/test_engines.py`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Architecture | Scan code, understand calculations, run existing tests | None | DONE |
| 2 | Material Database & Binders (R1) | Refactor frontend binder cards to be dynamic; add library dropdown | M1 | DONE |
| 3 | Presets UI (R2) | Implement custom presets save to localStorage and auto-load on refresh | M1 | DONE |
| 4 | Floating Window Layout (R3) | Correct CSS sticky property for scrolling view | M1 | DONE |
| 5 | Compliance & Verification (R4) | Verify calculation compliance with IS10262_2019.pdf, write/run tests | M2, M3, M4 | DONE |
| 6 | E2E Testing & Hardening | Final verification & adversarial tests | M5 | DONE |

## Interface Contracts
- API endpoints in `app.py` used by `static/app.js` (TBD)

## Code Layout
- `app.py`: Flask application entry point
- `static/app.js`: Main frontend logic
- `static/styles.css`: CSS styling
- `templates/index.html`: Main UI template
- `tests/test_engines.py`: Backend calculation unit tests
- `IS10262_2019.pdf`: Standard specification document for mix design calculations
