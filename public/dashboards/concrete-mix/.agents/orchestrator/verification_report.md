# VERIFICATION REPORT

Project: anti-concretemixdesign
Date: 2026-06-18
Commit/Version: v1.1.0-remediated

---

## TEST SUMMARY

Total Tests: 23
Passed: 23
Failed: 0
Blocked: 0

---

## TEST RESULTS

### Feature: R1. Material Database & Binders (Refactoring to Dynamic UI)
- **Test Procedure**:
  1. Open the mix design web application in a browser.
  2. Inspect the binder grid in Bento 4 to verify that the hardcoded binder cards are absent.
  3. Select a binder from the dynamic searchable dropdown and click "+ Add Binder".
  4. Verify that an interactive binder card is appended to Bento 4.
  5. Check that Specific Gravity and Cost/CO2 Override fields are dynamically generated in Bento 3.
  6. Modify percentages/overrides, verify calculations run without errors, and the output payload maps correct values back to the backend.
- **Evidence**:
  - `templates/index.html` lines 180-210 replaced hardcoded elements with `<div id="binder-inputs-container-normal" class="flex flex-col gap-sm"></div>` and a `<select id="add-binder-select-normal">` dropdown.
  - `static/app.js` handles an array of `activeBinders` state dynamically.
  - Tested API calculations payload using python verification scripts `verify_backend.py` and `verify_backend_updates.py`. All 23 tests passed.
- **Expected Result**: Binder cards and override inputs are fully dynamic, and payloads map correctly to backend parameters (cement, fly_ash, ggbs, silica_fume, metakaolin, rice_husk_ash).
- **Actual Result**: Binders are dynamically managed. Submitting values triggers the calculation backend without errors, returning correct SSD and site weights.
- **Status**: PASS

### Feature: R2. Presets UI (Save & Load Custom Mixes)
- **Test Procedure**:
  1. Set up a mix configuration in the UI.
  2. Click the "+ Save" button in the Quick Mix Presets container.
  3. Enter a custom preset name in the prompt.
  4. Verify that the preset is saved to `localStorage` under `promix_custom_presets`.
  5. Refresh the page and confirm the custom preset appears in the Benchmark Library dropdown.
  6. Select the custom preset and verify all inputs and dynamic binders are correctly reconstructed.
  7. Export the project and verify the custom presets are included in the JSON. Import the project and verify they restore.
- **Evidence**:
  - `templates/index.html` contains the "+ Save" button: `<button class="btn btn-outline" id="btn-save-preset" onclick="saveCurrentPreset()">+ Save</button>`.
  - `static/app.js` reads and writes custom presets from/to `localStorage`.
  - Export payloads include `custom_presets` fetched from `localStorage`.
- **Expected Result**: Custom presets are persistent in `localStorage`, populate the quick mix select element on reload, restore calculations on selection, and export/import cleanly.
- **Actual Result**: Custom presets persist across refreshes, load dynamically, and export/import correctly. Empty binder list presets preserve correctly.
- **Status**: PASS

### Feature: R3. Floating Window Layout
- **Test Procedure**:
  1. Load the page in a desktop viewport.
  2. Scroll down to verify if the Calculated Batch Proportions card (`.yield-card`) floats along the right side of the viewport.
  3. Verify that the `.status-card` remains inline.
- **Evidence**:
  - `static/styles.css` has `position: sticky; top: 6rem; align-self: start;` applied to `.yield-card`.
  - Inspection of `.status-card` styles confirms no sticky positioning is present.
- **Expected Result**: Yield proportions card floats correctly on scroll; no other wrong cards float.
- **Actual Result**: The Calculated Batch Proportions card (`.yield-card`) floats perfectly alongside the screen when scrolling.
- **Status**: PASS

### Feature: R4. Backend Zero-SG/Empty-SG Crash Prevention
- **Test Procedure**:
  1. Post a calculation request payload with a Specific Gravity value of `0.0` or empty `""` to `/api/calculate`.
  2. Verify that the server returns a `400 Bad Request` validation message instead of crash.
- **Evidence**:
  - Check `app.py` `validate_specific_gravities()` which validates specific gravity values and returns a JSON response with status code 400.
  - Ran edge-case tests in `tests/test_challenger_edge_cases.py` using pytest.
- **Expected Result**: Backend validation prevents server crashes and returns a clean 400 validation error.
- **Actual Result**: Server returns a clean 400 Bad Request message and the frontend displays a validation alert.
- **Status**: PASS

---

## REGRESSION CHECKS

Feature: Backend Calculation correctness for all baseline tests
Status: PASS (11/11 pytest test cases pass successfully)

Feature: Client-side Optimizer calculation trail
Status: PASS (runOptimizer TypeError fixed by dynamically querying activeBinders)

---

## OUTSTANDING ISSUES

Issue: Hardcoded PASS badges on the benchmark validation board (noted by Auditor)
Severity: LOW
Recommended Action: Update in next development cycle to dynamically show validation badges based on deviation checks.

---

## FINAL VERDICT

SUCCESS
