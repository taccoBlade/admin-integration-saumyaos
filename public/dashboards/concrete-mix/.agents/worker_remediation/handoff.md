# Handoff Report

## 1. Observation
- **Zero-SG Division Crash**: When inputs to `/api/calculate` or `/api/optimize` contain `sg_cement = 0.0` or `sg_ss = 0.0`, the backend engines (`engines/is10262_engine.py` and `engines/geopolymer_engine.py`) perform division by the specific gravity, e.g., `v_c = mass_cement / (sg_cement * 1000.0)`. This causes a `ZeroDivisionError` resulting in a `500 Internal Server Error`.
- **Unit Tests**: The pytest suite `tests/test_challenger_edge_cases.py` calls the calculation engine functions directly and expects `ZeroDivisionError` for invalid zero SGs:
  ```python
  with pytest.raises(ZeroDivisionError):
      calculate_normal_mix(inputs)
  ```
- **Front-end TypeError in Optimizer**: `runOptimizer()` in `static/app.js` contained lines querying missing DOM elements:
  ```javascript
  fly_ash_percent: parseFloat(document.getElementById('n_flyash').value) || 0,
  ggbs_percent: parseFloat(document.getElementById('n_ggbs').value) || 0,
  silica_fume_percent: parseFloat(document.getElementById('n_sf').value) || 0,
  metakaolin_percent: parseFloat(document.getElementById('n_mk').value) || 0
  ```
- **Exporting Presets**: `exportProject()` in `static/app.js` collected key project data (materials, mixes, trial logs, revision counter) but excluded custom presets saved in localStorage.
- **Empty Presets Loading Defaulting**: `loadBenchmarkIntoCalculator()` recalculated `cem_pct` as `100 - (fa_pct + gg_pct + sf_pct + mk_pct)`. If a preset had no binders, the sum was 0, resulting in `cem_pct = 100` and defaulting back to `OPC 53` at `100%`.

## 2. Logic Chain
- **API Specific Gravity Validation**: To avoid modifying direct engine behavior which tests assert will raise `ZeroDivisionError`, we added `validate_specific_gravities()` in `app.py` to validate all incoming specific gravity override values at the REST API boundaries (`/api/calculate` and `/api/optimize`). Any `None`, empty string `""`, or `<= 0.0` value results in a `400 Bad Request` with a clear validation error message.
- **Dynamic Binders in Optimizer**: We resolved the TypeError in `runOptimizer()` by querying the dynamic `activeBinders` state list (just like `runCalculations()` does) rather than querying hardcoded DOM input elements.
- **Exporting Custom Presets**: We loaded the custom presets object from localStorage (`promix_custom_presets`) in `exportProject()` and exported it under `custom_presets`. In `importProject()`, we merge any imported custom presets back into localStorage and re-trigger `fetchBenchmarks()` to refresh the dropdown menu.
- **Benchmark Dropdown Duplication**: To prevent duplicates when reloading benchmarks, we updated `fetchBenchmarks()` to clear the select dropdown options (keeping only the default placeholder option) before appending.
- **Preserving Empty Binder Presets**: We updated `saveCurrentPreset()` to explicitly save all binder percentages (including `cement_percent: 0` if OPC 53 is not active). Then, we modified `loadBenchmarkIntoCalculator()` to check if `cement_percent` is explicitly defined in the preset. If it is, we use it directly instead of defaulting to `100 - sum_of_replacement_binders`.

## 3. Caveats
- No caveats.

## 4. Conclusion
All issues identified have been fixed cleanly and with minimal changes. Backend zero-SG / empty-SG inputs to the REST APIs are now validated and rejected gracefully with a `400 Bad Request`, while direct library calls still raise `ZeroDivisionError` to keep existing unit tests happy. Client-side optimizer, custom presets import/export, and empty presets loading behave correctly.

## 5. Verification Method
1. Run the test suite:
   ```bash
   python -m pytest tests/test_engines.py tests/test_challenger_edge_cases.py
   ```
2. Verify all 23 tests pass successfully.
