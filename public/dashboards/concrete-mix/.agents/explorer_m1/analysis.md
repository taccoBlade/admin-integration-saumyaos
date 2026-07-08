# CODEBASE EXPLORATION & REQUIREMENTS ANALYSIS REPORT

This report details the findings and implementation plan for the requirements (R1, R2, R3, R4) in the anti-concretemixdesign web application.

---

## 1. Material Database & Binders (R1)

### Observations
- **Hardcoded Binders in UI:** In `templates/index.html` (lines 180-207 for Normal mix, and lines 250-276 for Geopolymer mix), the binder composition percentages are hardcoded inputs for specific binders:
  - Normal: OPC/PPC/PSC (`#n_cement`), Fly Ash (`#n_flyash`), GGBS (`#n_ggbs`), Silica Fume (`#n_sf`), Metakaolin (`#n_mk`).
  - Geopolymer: Fly Ash (`#b_flyash`), GGBS (`#b_ggbs`), Metakaolin (`#b_mk`), Rice Husk (`#b_rha`), Silica Fume (`#b_sf`).
- **Selector Rendering:** In `static/app.js` (lines 120-146), `renderMaterialSelectors()` generates hardcoded binder selectors under `BENTO 3` (Material Database & Local Economics) using the `createSelector` helper function:
  ```javascript
  createSelector(container, "Base Cement", "select_cement", "binders", "OPC 53", "sg_cement", "cement");
  createSelector(container, "Fly Ash Blend", "select_n_fa", "binders", "Fly Ash Class F", "sg_fly_ash", "fly_ash");
  ...
  ```
- **Binder Database & Economics:** Binders are defined in `engines/material_database.py` under `MATERIALS["binders"]` (e.g. `OPC 53`, `PPC`, `PSC`, `Fly Ash Class F`, `GGBS`, `Metakaolin`, `Silica Fume`, `Rice Husk Ash`). Their default prices and carbon values are in `material_economics.json` (lines 2-12).

### Proposed Changes
- **Templates Modification:** In `templates/index.html`, replace the hardcoded `.binder-grid` structure with a dynamic container:
  ```html
  <div id="binder-inputs-container" class="flex flex-col gap-sm">
    <!-- Dynamic cards rendered by JS -->
  </div>
  <div class="flex gap-sm mt-sm">
    <select id="add-binder-select" class="flex-1" style="padding: 6px 10px; font-size:12px;"></select>
    <button class="btn btn-outline" style="padding: 6px 12px; font-size:11px;" onclick="handleAddBinder()">+ Add Binder</button>
  </div>
  ```
- **State Management:** In `static/app.js`, maintain an array of active binders for the current theme:
  ```javascript
  let activeBinders = [];
  ```
  Initialize `activeBinders` on load or theme change:
  - Normal: `[{ id: "OPC 53", pct: 100 }]`
  - Geopolymer: `[{ id: "Fly Ash Class F", pct: 70 }, { id: "GGBS", pct: 30 }]`
- **Dynamic Card Generation:**
  - Create a function `renderBinderCards()` that builds interactive UI cards (inputs with percentage, binder name label, and a remove button) in BENTO 4.
  - In `renderMaterialSelectors()`, instead of hardcoding BENTO 3 selectors, loop over `activeBinders` and render specific gravity and price/CO2 override inputs for each.
- **Backend Mapping:** Map dynamic binders to standard fields expected by the backend engine (e.g., `cement`, `fly_ash`, `ggbs`, `silica_fume`, `metakaolin`, `rice_husk_ash`) using a map:
  ```javascript
  const BINDER_MAPPING = {
    "OPC 33": "cement", "OPC 43": "cement", "OPC 53": "cement", "PPC": "cement", "PSC": "cement",
    "Fly Ash Class F": "fly_ash", "Fly Ash Class C": "fly_ash",
    "GGBS": "ggbs", "Metakaolin": "metakaolin", "Silica Fume": "silica_fume", "Rice Husk Ash": "rice_husk_ash"
  };
  ```
  Ensure the dropdown to add binders filters out options whose category is already active (to prevent ID/category conflicts).

---

## 2. Presets UI (R2)

### Observations
- **Presets UI Structure:** There is no dedicated "Presets" section. Instead, there is the "Benchmark Library" (BENTO 17, `templates/index.html` lines 675-680) which acts as a quick-loader of mix profiles:
  ```html
  <select id="benchmark-select" style="padding:4px 8px; font-size:11px; width:200px" onchange="loadBenchmark()">
  ```
- **Benchmark Handling:** `static/app.js` fetches predefined benchmarks from `/api/benchmarks` (which reads `benchmark_library.json`) and populates `#benchmark-select`. Clicking "Load Into Calculator" triggers `loadBenchmarkIntoCalculator(benchmark)`.

### Proposed Changes
- **Save Option in UI:** Add a "+ Save" button in the Benchmark Library container:
  ```html
  <button class="btn btn-outline" id="btn-save-preset" onclick="saveCurrentPreset()" style="padding:4px 8px; font-size:11px;">+ Save</button>
  ```
- **LocalStorage Integration:**
  - Implement `saveCurrentPreset()` in `static/app.js`. When clicked, prompt the user for a name, serialize all current inputs (grade, exposure, active binders, W/C ratio, slump, etc.), and store the object inside `localStorage` under `promix_custom_presets`.
  - On page load, read `promix_custom_presets` from `localStorage` and dynamically append them to the `#benchmark-select` list.
  - Update `loadBenchmark()` to identify if a custom preset is chosen, retrieve it from `localStorage`, and pass it to the loader.

---

## 3. Floating Window Layout (R3)

### Observations
- **Sticky Header:** Currently, only `.header-card` has `position: sticky` inside `static/styles.css` (lines 145-152).
- **Status Card:** The `.status-card` (BENTO 7) does not have any `sticky` layout defined.
- **Results Card:** The Calculated Batch Proportions card (`.yield-card`, `col-span-8`) and Sustainability card (`.chart-card`, `col-span-4`) are located further down the page.

### Proposed Changes
- In `static/styles.css`, add the following style to float the main output window alongside input controls during scrolling:
  ```css
  .yield-card {
    position: sticky;
    top: 6rem;
    align-self: start;
  }
  ```
  Setting `align-self: start` is required in CSS Grid layouts so the element doesn't stretch to full height, which would disable the sticky scrolling behavior.

---

## 4. Backend Calculations & Compliance Audit (R4)

### Observations
- **Calculation Tracing:** Checked `engines/is10262_engine.py` and compared it step-by-step with `rules.md` / `specifications.md` / `IS10262_2019.pdf`:
  - **f'ck target strength:** Evaluates both `fck + 1.65S` and `fck + X` and selects the maximum. Lookups match standard values (e.g. `S = 5.0, X = 6.5` for M30+).
  - **Water content:** Correctly looks up base water content (186kg for 20mm), applies linear slump correction (+3% per 25mm from 50mm), shape corrections, and admixture reduction.
  - **Coarse/Fine aggregate proportions:** Lookup tables match IS 10262:2019 Table 5, adjusted based on the W/C deviation from 0.50.
  - **Moisture corrections:** Correctly shifts SSD weights to site weights using absorption and surface moisture inputs.
  - **Volume balance:** Ensures the total sum of absolute volumes of all constituents equals exactly 1.00 m³.
- **Validation Engine:** Checked `engines/validation_engine.py`. It correctly verifies IS 456 durability rules (minimum cement, maximum W/C) and volume balance limits.

### Code Compliance Conclusion
The backend engines strictly follow the guidelines of **IS 10262:2019** and **IS 456:2000**. No compliance deviations were found.

---

## 5. Test Suite Verification (R4)

### Observations
- **Test File:** `tests/test_engines.py` contains 11 unit tests verifying calculation engines, validation logic, durability limits, and calibration algorithms.
- **Execution Command:** Running `python -m pytest tests/test_engines.py` executed successfully.
- **Outcome:** All 11 tests passed:
  ```
  tests\test_engines.py ...........                                        [100%]
  ============================= 11 passed in 0.19s ==============================
  ```

---

## 6. Structural & Layout Cleanups

During the investigation, a major duplication issue was identified in `templates/index.html`:
- **Duplicated Bento Cards:** Lines 692-880 duplicate BENTO 12, 14, 15, 16, 17 sections, and lines 688-690 contain a cut-off/empty tag.
- **Fix:** The implementer must remove the duplicate code block (lines 692-880) and close BENTO 13 properly at line 689.
