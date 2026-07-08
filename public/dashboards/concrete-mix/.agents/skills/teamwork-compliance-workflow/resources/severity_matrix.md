# Severity Matrix

Use this matrix to assign a severity level to outstanding issues found during Verification or Compliance checks.

### CRITICAL
- Core functionality is completely broken or unavailable.
- Calculation outputs are mathematically incorrect or unsafe.
- App crashes unconditionally during the core user journey.
- **Action:** MUST be fixed immediately. Final verdict cannot be SUCCESS if a CRITICAL issue remains.

### HIGH
- A major feature is broken, but there is a reasonable workaround.
- Data loss occurs under specific conditions.
- Severe performance degradation.
- **Action:** Should be fixed before release. Verdict is FAILED or PARTIAL_SUCCESS depending on scope.

### MEDIUM
- A secondary feature is malfunctioning or behaving incorrectly.
- UI layouts are broken but the app remains usable.
- Non-critical persistence issues (e.g., preference saving).
- **Action:** Will result in SUCCESS_WITH_WARNINGS.

### LOW
- Minor visual spacing or styling issues.
- Typos in non-critical user-facing text.
- Slightly inefficient, but functional behavior.
- **Action:** Can be safely ignored for this cycle. Verdict can be SUCCESS.
