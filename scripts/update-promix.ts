import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "content/projects/generated/promix-concrete-mix-design-compliance-dashboard.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

data.content = `
## Overview
An engineering dashboard designed to perform IS 10262:2019 compliant concrete mix proportioning, automate packing density calculations using Toufar modeling, and manage geopolymer binder replacement scenarios.

## Problem
Traditional mix design processes rely heavily on manual Excel sheets and iterative trial-and-error calculations. Ensuring compliance with the strict water-cement ratios, aggregate gradation limits, and binder split specifications defined in IS 10262 is tedious and error-prone.

## My Solution
I built ProMix, a computational dashboard that codifies the IS 10262 guidelines into a robust algorithmic engine. It takes raw material properties and strength requirements as inputs and mathematically computes the optimal mix proportions.

## Architecture
The system is built on a modular Python architecture. The core computational engine handles the mathematical modeling (Toufar model for particle packing) and code compliance, while the frontend provides an intuitive interface for parameter input.

## Implementation
The application implements strict compliance checking against IS 10262. It calculates precise aggregate splits, admixture dosages, and water content based on standard nominal maximum aggregate size (NMAS) parameters.

## Screenshots / Dashboard

![ProMix Dashboard Input](/assets/promix/Screenshot%202026-06-28%20130052.png)

![ProMix Analytics](/assets/promix/Screenshot%202026-06-28%20130100.png)

![Mix Design Outputs](/assets/promix/Screenshot%202026-06-28%20130111.png)

![Material Breakdown](/assets/promix/Screenshot%202026-06-28%20130120.png)

### Concrete Mix Calculations Output

Here is a sample of the generated mix design compliance output from the result excel sheet:

| Material | SSD Weight (kg/m3) | Reference Source |
| :--- | :--- | :--- |
| **ADMIXTURE** | 4.5 | IS 10262:2019 Clause 5.6 |
| **CA** | 1168.3 | IS 10262:2019 Clause 5.6 |
| **CEMENT** | 89.6 | IS 10262:2019 Clause 5.4 (Plain Cement split) |
| **FA** | 602.2 | IS 10262:2019 Clause 5.6 |
| **FLY_ASH** | 134.4 | IS 10262:2019 Clause 5.4 (Fly Ash split) |
| **GGBS** | 224.0 | IS 10262:2019 Clause 5.4 (GGBS split) |
| **WATER** | 161.3 | IS 10262:2019 Clause 5.3 |

## Challenges I Faced
Translating the rigid, text-based specifications of the IS code into flexible algorithms required extensive validation. Handling edge cases for different binder combinations (like ternary blends of Cement + Fly Ash + GGBS) required significant architectural refactoring.

## What I Learned
I developed a deep appreciation for the intersection of civil engineering standards and software design. Architecting mathematical models for particle packing density (Toufar) taught me how to bridge theoretical mechanics with practical computational tools.

## Current Status
ProMix successfully generates IS-compliant mix proportions and exports the calculation traces for auditing.

## Future Improvements
Next steps involve adding cost-optimization algorithms to dynamically minimize material costs while satisfying the strength and durability constraints.
`;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Updated ProMix JSON with standardized layout.");
