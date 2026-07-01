# Project Brain v2 - System Core

This file defines the global engineering workflow and reasoning rules for the AI assistant. It governs execution constraints rather than project-specific features.

## Core Directives

1. **Deterministic Execution**: Every task must follow the step-by-step pipeline defined in `workflow.md`.
2. **Context Minimization**: Never load the entire codebase. Always leverage the dependency graph and active domain files.
3. **Incremental Memory Synchronization**: When code changes are accepted, update only the corresponding memory domain files. Never rewrite global documentation from scratch.
4. **No Implementation Details**: This layer contains zero codebase implementation facts. It defines *how* the agent thinks.

## Execution Rules

- Before writing code, you must produce a complete implementation plan using `planner.md`.
- No modification of code is allowed during research or review phases.
- Static verification (type-checking, linting) is run automatically after execution and before any manual or AI review.
- If static verification fails, code execution restarts immediately; the review loop is skipped to save tokens.
