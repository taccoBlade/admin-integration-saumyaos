# Changelog

## [1.1.0] - 2026-06-18

### Added
- Dynamic binder addition system to select, add, and configure binder materials from the selection library.
- "+ Save" option to presets UI, enabling custom mix design saving, loading, and persistence in `localStorage`.
- Export/Import support for custom presets in the JSON import/export payloads.
- Backend input validation for Specific Gravity overrides, returning `400 Bad Request` validation warnings on 0.0 or empty values.

### Changed
- Refactored `templates/index.html` to remove all hardcoded binder cards.
- Restructured `static/app.js` to manage active binders in a dynamic state array, dynamically rendering cards and Specific Gravity / cost override fields in Bento 3.
- Map dynamic binders back to standard backend fields upon serialization to maintain full compatibility.
- Set Calculated Batch Proportions card (`.yield-card`) to be sticky with `position: sticky; top: 6rem; align-self: start;` so it floats along the screen during scroll.

### Fixed
- Cleaned up duplicate Bento card structures in `templates/index.html` (original lines 692-880) and closed Bento 13 correctly.
- Fixed `ZeroDivisionError` backend crash (500 Internal Server Error) when specific gravity overrides were 0.0 or blank.
- Fixed client-side JavaScript TypeError crash in `runOptimizer()` where removed hardcoded DOM inputs were being queried.
- Fixed empty binder presets loading issue which previously defaulted back to 100% OPC 53.

### Architectural Decisions
- **REST API Validation Boundary**: Validated specific gravity inputs at the API controller wrapper level in `app.py` instead of the core engines, preserving existing direct-call unit test expectations (raising `ZeroDivisionError`) while shielding the web client from server crashes.
- **Dynamic Binder Mapping**: Maintained backward compatibility with backend calculation payloads by translating dynamic user-selected binders into standard properties (`cement`, `fly_ash`, `ggbs`, etc.) on payload serialization in JavaScript.

**Final Outcome Status**: SUCCESS / COMPLIANT
