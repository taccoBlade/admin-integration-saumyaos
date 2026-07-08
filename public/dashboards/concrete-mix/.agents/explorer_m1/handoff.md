# Handoff Report — explorer_m1

## 1. Observation

- **R1: Binder Cards in UI:**
  `templates/index.html` (lines 182-186) defines:
  ```html
  <div class="binder-grid">
    <div class="flex flex-col">
      <label class="body-xs">OPC/PPC/PSC</label>
      <input type="number" id="n_cement" value="100" min="0" max="100" oninput="updateBinderSum('normal'); runCalculations()">
  ```
  `static/app.js` (lines 124-127) defines:
  ```javascript
  if (activeTheme === 'normal') {
    // Blended binders for Normal Concrete
    createSelector(container, "Base Cement", "select_cement", "binders", "OPC 53", "sg_cement", "cement");
  ```
- **R2: Presets:**
  `templates/index.html` (lines 675-679) contains:
  ```html
  <div class="flex justify-between items-center mb-sm">
    <span class="label-caps text-dim">Benchmark Library</span>
    <select id="benchmark-select" style="padding:4px 8px; font-size:11px; width:200px" onchange="loadBenchmark()">
  ```
- **R3: Floating Window:**
  `static/styles.css` contains only one sticky layout rule:
  ```css
  .header-card {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.03) 0%, var(--card-bg) 100%);
    position: sticky;
    top: 1rem;
    z-index: 100;
  }
  ```
  There is no `sticky` or `position: sticky` style applied to `.status-card` or `.yield-card` or `.chart-card`.
- **R4: Testing:**
  Ran the command:
  ```powershell
  python -m pytest tests/test_engines.py
  ```
  Result:
  ```
  tests\test_engines.py ...........                                        [100%]
  ============================= 11 passed in 0.19s ==============================
  ```
- **Code Duplication in index.html:**
  `templates/index.html` contains duplicated sections for BENTO 12, 14, 15, 16, 17 in lines 692-880, and a broken BENTO 13 header is at line 688.

## 2. Logic Chain

1. **R1 Dynamic Binders:** Since binders are currently hardcoded in `templates/index.html` and `static/app.js` (OPC, Fly Ash, GGBS, Silica Fume, Metakaolin), we need to replace these hardcoded fields with dynamic containers. Since the backend calculation engines in `is10262_engine.py` and `geopolymer_engine.py` receive these parameters through fixed inputs (e.g. `fly_ash_percent`, `ggbs_percent`, etc.), we can store an array of active binders in JavaScript (`activeBinders`) and map their names (e.g. "Fly Ash Class F" -> "fly_ash") using a mapping dictionary (`BINDER_MAPPING`) so the payload structure sent to the backend remains completely backward-compatible.
2. **R2 Presets UI:** Since the predefined benchmarks are loaded into the calculator using `loadBenchmarkIntoCalculator(benchmark)`, we can replicate this structure for custom presets. By adding a "+ Save" button to the Benchmark Library section, we can prompt for a custom preset name, read current inputs, save the config object to `localStorage`, and read/load it into the dropdown on page load.
3. **R3 Sticky Card:** To make the yield proportions float on scrolling, we should apply `position: sticky` and `top: 6rem` to `.yield-card`. Additionally, `align-self: start` must be added so the card does not stretch to fill the grid row height (which disables sticky behavior).
4. **Duplication Cleanup:** The duplicate block in `templates/index.html` (lines 692-880) must be deleted, and BENTO 13 closed properly to prevent DOM layout bugs.

## 3. Caveats

- We assumed that users will not need to mix multiple binders of the same category (e.g., mixing OPC 53 and PPC) in a single design. The dropdown should filter out categories already active to prevent variable collisions.
- No actual code modifications were made during this read-only phase.

## 4. Conclusion

The codebase is ready for implementing R1-R4. A detailed step-by-step implementation guide has been written to `analysis.md` inside this working directory.

## 5. Verification Method

- **Tests:** Run `python -m pytest tests/test_engines.py` to ensure no backend regression.
- **Dynamic Binders:** Select a binder (e.g. Fly Ash Class C) from the dropdown, click "+ Add", verify a new card appears in the list, enter a percentage, and check that specific gravity and economics update in BENTO 3, and yield calculations recalculate correctly.
- **Custom Presets:** Set inputs, click "+ Save", enter a name, refresh page, verify the custom preset is present in the dropdown, select it, and confirm the inputs are loaded correctly.
- **Sticky Layout:** Scroll down the page on a desktop viewport and verify the Calculated Batch Proportions card (`.yield-card`) floats along the right side of the screen.

## 6. Remaining Work

1. Implement dynamic binder cards in `templates/index.html` and `static/app.js`.
2. Add the "+ Save" option to presets UI and wire it to `localStorage` in `static/app.js`.
3. Set `.yield-card` to sticky in `static/styles.css`.
4. Delete duplicate bento sections (lines 692-880) and fix BENTO 13 closing tag in `templates/index.html`.
