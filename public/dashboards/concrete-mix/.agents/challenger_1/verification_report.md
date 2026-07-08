# VERIFICATION REPORT — 2026-06-18

This verification report documents the empirical findings, logic chains, and verification results for the concrete mix design calculator platform with the new dynamic binders.

---

## 1. Pytest Verification
We ran the project test suite using `pytest`.
- **Command**: `python -m pytest tests/test_engines.py`
- **Result**: `11 passed in 0.14s`
- **Conclusion**: Backend calculations for target strength, air content, water content, binder split, aggregate ratio lookups, validation engine, calibration, and reviewer rules function as expected under testing.

---

## 2. Calculation Verification (Plain & Blended Mixes)

### 2.1 Volume Yield Sum (Exactly 1.0 m³)
For both plain and blended mixes, we verified that the absolute volume yield sums up to exactly `1.0 m³`.
- **Plain Cement Mix (M30)**:
  - Total absolute volume: **1.000000 m³**
  - Cement content: **350.51 kg** (OPC 53)
- **Blended Mix (60% OPC, 30% Fly Ash, 10% GGBS)**:
  - Total absolute volume: **1.000000 m³**
  - Cement split: **210.31 kg**
  - Fly Ash split: **105.15 kg**
  - GGBS split: **35.05 kg**
  - Total binder mass: **350.51 kg**

### 2.2 IS10262:2019 / IS 456 Rules Compliance
The validation engine checks the compliance criteria correctly:
- **Volume Balance**: Within `1.00 ± 0.01 m³` (Passed: `1.000 m³`).
- **Durability Compliance (IS 456 Table 5)**:
  - For **Severe** exposure: Max W/C ratio allowed is `0.45`, minimum binder content is `320 kg/m³`, minimum grade is `M30`.
  - Tested W/C `0.45` and grade `M30` with `350.51 kg/m³` binder content -> Passed durability check.
  - Tested W/C `0.55` under Severe exposure -> Correctly failed compliance and triggered "W/C ratio exceeds max allowed 0.45" warning/failure.
- **Cement Limit**: Verified that plain cement content is capped at `450 kg/m³` to prevent thermal cracking per IS 10262 guidelines.
- **Aggregate Ratios**: Verified that coarse aggregate to fine aggregate split follows zone classification (e.g. Zone II ratio lookup adjusted for W/C ratio).

---

## 3. Dynamic Binders, Specific Gravity & Economics Updates

### 3.1 Dynamic Specific Gravity updates
We programmatically tested updating the specific gravity (SG) of Fly Ash from `2.20` to `2.30`.
- **Observation**:
  - Base Coarse Agg SSD: **1212.7674 kg**
  - Base Fine Agg SSD: **688.8648 kg**
  - Updated Coarse Agg SSD: **1216.3546 kg** (+3.5872 kg)
  - Updated Fine Agg SSD: **690.9024 kg** (+2.0376 kg)
  - Updated Volume Total: **1.000000 m³**
- **Logic**: Increasing the specific gravity of Fly Ash (while keeping the mass the same) decreases its absolute volume. To maintain a total mix volume of exactly 1.0 m³, the volume of aggregates must increase. The engine correctly re-allocates the vacant volume to Coarse and Fine aggregates based on their defined ratios and SGs, and the total volume remains exactly balanced.

### 3.2 Dynamic Economics updates
We verified the pricing and carbon calculation updates when cost and emission factors are modified.
- **Observation**:
  - Base Fly Ash Cost: **Rs. 1.20 / kg** -> Total Mix Cost: **Rs. 4914.49**
  - Updated Fly Ash Cost: **Rs. 2.50 / kg** -> Total Mix Cost: **Rs. 5051.19**
  - Delta: **+Rs. 136.70**
- **Validation**:
  - The mass of Fly Ash in the mix is **105.153 kg**.
  - Price change: `2.50 - 1.20 = 1.30 Rs/kg`.
  - Expected cost increase: `105.153 * 1.30 = Rs. 136.6989`.
  - The calculated cost delta matches the expected change exactly.

---

## 4. Client-side Exception Analysis (`static/app.js`)

We performed a deep-dive scan on `static/app.js` and `templates/index.html` to find potential client-side exceptions.

### 4.1 Fatal Exception Found: `runOptimizer()`
- **File**: `static/app.js`
- **Lines**: 1326 - 1329
- **Code**:
  ```javascript
  fly_ash_percent: parseFloat(document.getElementById('n_flyash').value) || 0,
  ggbs_percent: parseFloat(document.getElementById('n_ggbs').value) || 0,
  silica_fume_percent: parseFloat(document.getElementById('n_sf').value) || 0,
  metakaolin_percent: parseFloat(document.getElementById('n_mk').value) || 0
  ```
- **Issue**: The elements with IDs `n_flyash`, `n_ggbs`, `n_sf`, and `n_mk` do not exist in `templates/index.html`. In the dynamic binder rewrite, binder percentages are stored in the global array `activeBinders`.
- **Impact**: Clicking the "Run Optimizer" button triggers `runOptimizer()`, which immediately fails with:
  `TypeError: Cannot read properties of null (reading 'value')`
  This prevents the optimizer from executing on the client side.

### 4.2 Other Script Sections
The remainder of `static/app.js` (including standard calculations rendering, sustainability progress bars, chart updates, and theme toggling) is robust:
- Elements in `runCalculations()` are correctly queried and exist in the DOM.
- Values for specific gravities and costs are properly guarded with optional chaining `?.value` and defaults.
- Chart.js updates are correctly protected against null objects.
