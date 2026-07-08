# VERIFICATION REPORT

Project: Anti-Concrete Mix Design Platform (PRO-MIX)
Date: 2026-06-18
Version: 1.0 (Bento 3 Integration Review)

---

## TEST SUMMARY

Total Tests: 19 (11 standard engine tests + 8 new edge case and override tests)
Passed: 19
Failed: 0 (The tests checking expected crashes like ZeroDivisionError using pytest.raises passed successfully)
Blocked: 0

---

## TEST RESULTS

### Feature: Backend Core Engines Correctness
- **Test Procedure**: Run standard pytest suite on backend calculation engine.
  Command: `python -m pytest tests/test_engines.py`
- **Evidence**:
  ```
  tests\test_engines.py ...........                                        [100%]
  ============================= 11 passed in 0.12s ==============================
  ```
- **Expected Result**: All 11 tests check f'ck, volume balance, durability failures, blended binders, research mode, grade recommendation, calibration, trial mix acceptance, and AI reviews, and they must pass.
- **Actual Result**: 11/11 tests passed.
- **Status**: PASS

### Feature: Dynamic Binder 0% Edge Cases
- **Test Procedure**:
  1. Call `calculate_normal_mix` with all binder percentages (cement, fly ash, ggbs, silica fume, metakaolin) set to 0%.
  2. Call `calculate_geopolymer_mix` with all binder percentages set to 0%.
  3. Validate both output mixes using the validation engine `validate_mix`.
- **Evidence**:
  Tests `test_normal_mix_0_percent_binder` and `test_geopolymer_mix_0_percent_binder` in `tests/test_challenger_edge_cases.py` pass.
- **Expected Result**: Engines should run without python crashes. Validation engine should flag the mixes as invalid since binder sum is 0% (fails binder sum = 100% check, and geopolymer fails volume balance check).
- **Actual Result**: Matches expectations exactly.
  - Normal mix: Validation checklist item `aggregate_ratios_valid` has status = False and message "Binder percentages sum to 0.0% (must be 100%)".
  - Geopolymer mix: Validation checklist items `aggregate_ratios_valid` and `volume_balanced` both evaluate to False.
- **Status**: PASS

### Feature: 100% Cement Replacement
- **Test Procedure**:
  - Run normal concrete engine with `cement_percent = 0` and `fly_ash_percent = 100`.
- **Evidence**:
  Test `test_normal_mix_100_percent_replacement` in `tests/test_challenger_edge_cases.py` passes.
- **Expected Result**: OPC cement mass is 0, Fly ash mass is > 0, volume balances, and validation checklist passes.
- **Actual Result**: `results["mass_cement_ssd"]["value"]` is 0.0, fly ash mass is 350.5 kg, and validation checklist passes.
- **Status**: PASS

### Feature: Multiple Binders of Different Categories
- **Test Procedure**:
  - Run normal concrete engine with `cement_percent = 50`, `fly_ash_percent = 25`, `ggbs_percent = 15`, `silica_fume_percent = 10`.
- **Evidence**:
  Test `test_normal_mix_multiple_binders` in `tests/test_challenger_edge_cases.py` passes.
- **Expected Result**: All four binders are assigned positive mass values, volume balances, and validation passes.
- **Actual Result**: All binder categories split correctly and sum to 100% total binder. Volume balance is exactly 1.00 m³.
- **Status**: PASS

### Feature: Specific Gravity overrides and Volumetric Changes
- **Test Procedure**:
  - Override `sg_cement` from default 3.15 to 2.50. Run calculations and verify aggregate yields.
- **Evidence**:
  Test `test_sg_override_volumetric_change` in `tests/test_challenger_edge_cases.py` passes.
- **Expected Result**: Lower specific gravity increases binder volume, leaving less volume for aggregates. Coarse and fine aggregate weights must decrease.
- **Actual Result**:
  - Default CA mass: 1162.77 kg
  - Overridden CA mass: 1111.45 kg (lower, as expected).
- **Status**: PASS

### Feature: Cost/CO2 overrides
- **Test Procedure**:
  - Run normal concrete engine with economics overrides for cement price (overriding default 7.0/kg to 20.0/kg) and verify total cost increases proportionally.
- **Evidence**:
  Test `test_economics_override_cost` in `tests/test_challenger_edge_cases.py` passes.
- **Expected Result**: Cost increases by exactly the difference in cement price times the cement mass.
- **Actual Result**: Default cost: ₹3136.21/m³, overridden cost: ₹7692.68/m³. The increase matches `cement_mass * (20 - 7)` exactly.
- **Status**: PASS

---

## REGRESSION CHECKS

- **Feature**: IS 456 Durability Compliance Validation
  - **Status**: PASS (Verified in test suite)
- **Feature**: Optimizer candidate sorting by Cost
  - **Status**: PASS (Verified in test suite)
- **Feature**: Calibration factor calculation
  - **Status**: PASS (Verified in test suite)

---

## OUTSTANDING ISSUES

### 1. Issue: ZeroDivisionError Crash on SG = 0 or Empty
- **Severity**: CRITICAL
- **Description**: Setting specific gravity inputs to 0 or leaving them empty causes a `ZeroDivisionError` in the backend calculation engines. Specifically, `is10262_engine.py` line 185 `v_c = mass_cement / (sg_cement * 1000.0)` does not check for `sg_cement > 0`. Similarly, `geopolymer_engine.py` contains multiple divisions by specific gravities (`sg_ss`, `sg_sh`, `sg_ca`, `sg_fa_aggregate`) without validating if they are positive.
- **Impact**: Server throws 500 error, and UI fails silently without presenting any error to the user.
- **Recommended Action**: Update calculations in the backend to validate all specific gravity inputs to be strictly positive (> 0) before performing divisions, or validate them on the Flask endpoint level. Update frontend to validate that input fields are positive numbers before calling `/api/calculate`.

### 2. Issue: Custom Presets Omitted from Project Export/Import
- **Severity**: MEDIUM
- **Description**: Custom presets created by the user are stored in localStorage under `'promix_custom_presets'`. However, `exportProject()` in `static/app.js` only exports `customMaterials`, `savedMixes`, `trial_logs`, and calibration revision counters. It completely omits `'promix_custom_presets'`.
- **Impact**: Users lose all their saved custom presets when exporting and importing their project to another device or file.
- **Recommended Action**: Include `'promix_custom_presets'` (parsed from localStorage) in the JSON object inside `exportProject()`, and restore it in localStorage in `importProject()`.

### 3. Issue: Empty Binder List Preset Restores to 100% OPC
- **Severity**: MEDIUM
- **Description**: In normal concrete mode, saving a custom preset when `activeBinders` is an empty list, and then loading it, restores the binder list to `OPC 53` at 100% instead of maintaining the empty list.
- **Impact**: Custom presets with 0% binders cannot be preserved for normal concrete.
- **Recommended Action**: Adjust benchmark load logic to explicitly handle the empty binder list case if that is a desired state.

---

## FINAL VERDICT

SUCCESS_WITH_WARNINGS (Backend calculations and overrides operate correctly, but the system is vulnerable to ZeroDivisionErrors under zero specific gravity inputs, and custom presets are lost during project export/import).
