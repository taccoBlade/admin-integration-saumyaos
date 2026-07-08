# COMPLIANCE AUDIT REPORT

Standard: IS 10262:2019 (Concrete Mix Proportioning — Guidelines)
Project: anti-concretemixdesign
Date: 2026-06-18

---

## CLAUSE REVIEW

Requirement: Target Strength Calculation (Clause 4.2)
Implementation Location: `engines/is10262_engine.py` (lines 40-75)
Compliant: YES
Notes: The engine computes target mean strength using both standard deviation ($f'_{ck} = f_{ck} + 1.65 S$) and factor $X$ ($f'_{ck} = f_{ck} + X$) and takes the maximum of the two. This strictly complies with IS 10262:2019 Clause 4.2.

Requirement: Air Content estimation (Clause 5.2)
Implementation Location: `engines/is10262_engine.py` (lines 80-92)
Compliant: YES
Notes: Entrapped air is looked up from Table 3 based on maximum nominal size of aggregate (e.g. 1.0% for 20mm, 1.5% for 10mm).

Requirement: Selection of Water Content & Slump Correction (Clause 5.3)
Implementation Location: `engines/is10262_engine.py` (lines 95-125)
Compliant: YES
Notes: Base water content is looked up from Table 4 (e.g. 186 kg/m3 for 20mm aggregate). Adjustments are applied: +3% per 25mm slump deviation above 50mm, reduction for superplasticizer (admixture), and shape adjustments.

Requirement: Water-Cementitious Materials Ratio (Clause 5.4)
Implementation Location: `engines/is10262_engine.py` (lines 127-140)
Compliant: YES
Notes: Enforces maximum W/C ratios based on exposure conditions from IS 456 Table 5 durability guidelines.

Requirement: Estimation of Coarse & Fine Aggregate Proportions (Clause 5.5)
Implementation Location: `engines/is10262_engine.py` (lines 142-178)
Compliant: YES
Notes: Base volume of coarse aggregate is looked up from Table 5 based on Zone of fine aggregate and nominal maximum size of aggregate. Adjustments are applied linearly: -0.01 for every +0.05 change in W/C ratio from 0.50 (Clause 5.5.2).

Requirement: Volume Balance Calculations (Clause 5.6)
Implementation Location: `engines/is10262_engine.py` (lines 180-210)
Compliant: YES
Notes: Absolute volumes of cement, fly ash, ggbs, water, chemical admixture, and air are calculated. The remaining volume ($1.0 - V_{constituents}$) is divided between coarse and fine aggregates based on their proportions. Sum of all volumes is exactly 1.00 m³.

Requirement: Moisture and Water Absorption Correction (Clause 7)
Implementation Location: `engines/is10262_engine.py` (moisture adjustment functions)
Compliant: YES
Notes: The application performs dry-to-SSD and site adjustment calculations accurately based on absorption rates and surface moisture inputs.

---

## CALCULATION VALIDATION

Input Set 1: M30 Grade, Mild Exposure, 20mm Aggregate, Slump 100mm, OPC 53 Cement
Expected Result: 
- Target Strength: 38.25 N/mm² (using $S = 5.0$ and $X = 6.5$)
- Base Water: 197.16 kg (186 + 6% correction for 100mm slump)
Application Result:
- Target Strength: 38.25 N/mm²
- Water: 197.16 kg
Match: YES

Input Set 2: M40 Grade, Severe Exposure, 20mm Aggregate, Slump 75mm, OPC 53 + 30% Fly Ash
Expected Result:
- Durability check: Minimum cementitious content >= 320 kg/m3 (IS 456 Table 5), Maximum W/C ratio <= 0.45.
Application Result:
- Check passed, calculations run successfully and enforce limits.
Match: YES

---

## DEVIATIONS

Deviation: None
Impact: N/A
Recommendation: N/A

---

## FINAL COMPLIANCE STATUS

COMPLIANT
