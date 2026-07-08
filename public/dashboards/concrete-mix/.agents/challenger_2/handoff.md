# Handoff Report

## 1. Observation

- **Existing Tests**: Running the project's standard test suite via pytest completed with 11 passing tests.
  Command and output:
  ```powershell
  python -m pytest tests/test_engines.py
  # Output: 11 passed in 0.12s
  ```
- **New Edge Case Tests**: Added `tests/test_challenger_edge_cases.py` and ran it with pytest.
  Command and output:
  ```powershell
  python -m pytest tests/test_challenger_edge_cases.py
  # Output: 8 passed in 0.04s
  ```
- **Backend Code Findings**:
  - In `engines/is10262_engine.py` line 185:
    ```python
    v_c = mass_cement / (sg_cement * 1000.0)
    ```
    If `sg_cement` is set to `0.0`, a `ZeroDivisionError` is raised.
  - In `engines/geopolymer_engine.py` lines 153-156:
    ```python
    v_ss = mass_ss / (sg_ss * 1000.0)
    v_sh = mass_sh / (sg_sh * 1000.0)
    v_ca = mass_ca_ssd / (sg_ca * 1000.0)
    v_fa = mass_fa_ssd / (sg_fa_aggregate * 1000.0)
    ```
    If `sg_ss`, `sg_sh`, `sg_ca`, or `sg_fa_aggregate` is set to `0.0`, a `ZeroDivisionError` is raised.
- **Frontend Code Findings**:
  - In `static/app.js` under `exportProject()`:
    ```javascript
    const projectData = {
      version: "1.0",
      project_metadata: {
        project_name: document.getElementById('project-name').value || '',
        engineer_name: document.getElementById('engineer-name').value || '',
        export_date: new Date().toISOString(),
        platform_mode: platformMode,
        active_theme: activeTheme
      },
      materials: customMaterials,
      mixes: savedMixes,
      trial_logs: trialLogs,
      calibration_data: {
        revision_counter: mixRevisionCounter
      }
    };
    ```
    The variable `customPresets` (saved in localStorage under `'promix_custom_presets'`) is completely missing from this payload.

## 2. Logic Chain

1. **Backend Crash on Zero SG**:
   - Setting a specific gravity (SG) to `0` or leaving the text field blank in the UI causes the frontend to submit a `0` or `NaN` value for that SG inside the POST request to `/api/calculate`.
   - The backend directly divides the mass of materials by their specific gravities in `is10262_engine.py` (line 185) and `geopolymer_engine.py` (lines 153-156) without first validating that they are strictly positive numbers.
   - This results in a backend crash (`ZeroDivisionError: division by zero`) and returns a HTTP 500 error to the client, causing a silent UI hang since the UI has no error handler for non-200 calculations fetch responses.

2. **Custom Preset Export Omission**:
   - In `static/app.js`, custom presets are successfully saved locally under the `'promix_custom_presets'` localStorage key.
   - However, during a project export via `exportProject()`, only `customMaterials`, `savedMixes`, `trial_logs`, and `mixRevisionCounter` are serialized.
   - Therefore, custom presets are omitted from the export JSON file and are permanently lost when restoring a project on another device or from the exported file.

3. **Restoration of Empty Binder Presets**:
   - In `static/app.js`, when a custom preset with an empty binder list is loaded back for normal concrete, the rebuild logic in `loadBenchmarkIntoCalculator` defaults to setting `OPC 53` binder at 100%. Hence, empty binder lists are not preserved during preset load.

## 3. Caveats

- We did not evaluate the UI under extremely long project names or check potential security vulnerabilities in CSV/PDF export.
- Assumed standard Chrome/Firefox/Edge local storage mechanisms for the preset system.

## 4. Conclusion

- The backend engines calculate yields, cost, and CO2 overrides correctly, but suffer from a critical vulnerability where an SG of 0 crashes the application.
- The preset system functions correctly locally, but lacks support in the project import/export feature, leading to silent data loss of custom presets when transferring projects.
- Recommended fixes include:
  1. Add validator to the Flask endpoint/backend engines to reject specific gravity inputs <= 0.
  2. Include `'promix_custom_presets'` in the exported project JSON and deserialize it back on import.

## 5. Verification Method

To verify these findings:
1. Run all tests (including the new edge case tests):
   ```powershell
   python -m pytest
   ```
2. Inspect the test cases defined in `tests/test_challenger_edge_cases.py` to trace the logic of overrides and zero divisions.
3. Open `static/app.js` and inspect lines 1576–1603 (`exportProject()`) to confirm the omission of the `'promix_custom_presets'` key.
