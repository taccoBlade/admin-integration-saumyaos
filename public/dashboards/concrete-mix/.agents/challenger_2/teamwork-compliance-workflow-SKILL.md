# Teamwork Compliance Workflow

## Overview
A workflow orchestration skill that enforces rigorous quality gates for bug-fixing and engineering tasks. It surrounds the multi-agent `teamwork-preview` system with strict pre-delegation Scope Validation and post-delegation Evidence-Based Verification and Compliance Audits. It ensures tasks are not marked complete without auditable proof and standard conformity.

## Dependencies
- `teamwork-preview` (Required): Used to formulate the implementation prompt and delegate the actual coding execution.
- (Optional): Document/PDF readers, code search tools.

## Quick Start
"Run the teamwork-compliance-workflow for the current project. Here is the list of bugs to fix: [bugs]. Please verify against [standard_doc.pdf]."

## Workflow

### 1. Project Restoration
- Restore the project from its baseline or zip archive.
- **Error Handling:** If a required baseline, zip, or standard doc is missing:
  1. Verify the provided path.
  2. Search the project directory and subdirectories.
  3. If found, proceed and log the location.
  4. If not found, pause and request the missing file from the user (never skip silently).

### 2. Defect Analysis
- Compare the reported defects against the baseline codebase.
- Identify the necessary fixes and updates.

### 3. Scope Validation
- **CRITICAL PRE-CHECK:** Before drafting the prompt, validate the scope.
- Detect missing requirements, contradictory requirements, or referenced files that don't exist.
- Detect impossible acceptance criteria.
- **Error Handling:** If a referenced compliance document (e.g., IS10262) is missing, mark Compliance Audit = BLOCKED and require user action. Do not waste a delegation cycle.

### 4. Prompt Engineering
- Draft a structured implementation prompt (typically via `prompt_draft.md`).
- The exact format is flexible but MUST contain: Project Context, Objectives, Requirements, Measurable Acceptance Criteria, Verification Requirements, Expected Deliverables, and Failure Handling.

### 5. Delegation
- Invoke the `teamwork-preview` subagent to execute the prompt.

### 6. Evidence-Based Verification
- The subagent must generate a Verification Report using `resources/verification_report_template.md`.
- Each verified feature MUST include concrete **Evidence** (e.g., screenshot path, console output, DOM inspection result).
- **Failed Tests:** If verification fails, attempt exactly **one** automatic remediation cycle and re-test. If failures persist, assign a severity (using `resources/severity_matrix.md`) and escalate.

### 7. Compliance Audit
- **Calculation-Change Trigger:** If the defect analysis or subsequent implementation modifies ANY calculation logic (e.g., `engines/`, mathematical formulas in JS/Python), a full Compliance Audit is MANDATORY.
- The subagent must generate a Compliance Audit using `resources/compliance_audit_template.md`.
- Compliance claims must cite the relevant clause, the exact formula used, code location, and test case used.

### 8. Change Log Generation
- Upon completion of verification and compliance, the agent MUST append a structured entry to `CHANGELOG.md` detailing:
  - Modified files and the specific bugs fixed.
  - Architectural or mathematical decisions made during the fix.
  - The final outcome status (e.g., SUCCESS).

### 9. Rollback Policy
- If the Final Outcome evaluates to `FAILED`, `NON-COMPLIANT`, or is `BLOCKED` with no user resolution, the agent MUST trigger a complete rollback to the initial baseline checkpoint (restoring the state to exactly before the workflow began).

## Evaluation & Final Outcome
- The workflow concludes with one of: `SUCCESS`, `SUCCESS_WITH_WARNINGS`, `PARTIAL_SUCCESS`, `FAILED`, `BLOCKED`.
- **Hard Rule:** Never mark a task `SUCCESS` if any CRITICAL issue remains open, if the Compliance Audit is BLOCKED, or if the Compliance Audit is NON-COMPLIANT.

## Common Mistakes
- **Skipping Scope Validation:** Delegating tasks with missing dependencies wastes cycles. Always validate existence of docs before invoking teamwork.
- **Lacking Evidence:** Writing "PASS" without pointing to a console output or DOM snippet. Auditable evidence is required.
- **Infinite Fix Loops:** Retrying failed tests more than once instead of escalating. Fail fast on persistent errors.
