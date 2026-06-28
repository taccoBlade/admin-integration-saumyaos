import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "content/projects/generated/automation-intelligent-machine-guided-construction.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

data.content = `
## Overview
The Universal Intelligent Compaction (UIC) Kit is a prototype concept to transform standard vibration road rollers into intelligent compaction systems using non-invasive sensor fusion, bridging the gap between legacy machinery and modern quality control.

## Problem
Current compaction quality control in flexible pavements (like highways) relies on manual, destructive core-cutting methods. These discrete tests leave vast pavement areas unverified and create delayed feedback loops, leading to either under-compaction or over-compaction.

## My Solution
I proposed the UIC Kit, a hardware-agnostic retrofit pod that mounts onto existing traditional rollers. It uses a deterministic physics model to estimate compaction density in real-time, transforming reactive testing into proactive machine guidance.

## Architecture
The system architecture centers on "Sensor Fusion at the Edge".
*   **The Edge Brain:** A ruggedized Raspberry Pi IPC processing data with zero latency.
*   **JSON Data Cloud:** A unified data ledger to eliminate vendor silos.
*   **Real-Time Dashboard:** Centralized monitoring for pass-count verification and stiffness mapping.

## Implementation
### Sensor Placement & Function
*   **Accelerometer Array:** Triaxial sensors (Industrial ICP) on the drum capture 30Hz harmonics to estimate stiffness.
*   **RTK-GPS Positioning:** Roof-mounted module for centimeter-accurate X/Y coverage mapping.
*   **Downward ToF LiDAR:** Calculates real-time material bed thickness.
*   **Infrared Thermometry:** Monitors live asphalt cooling windows.

### Machine Guidance Workflow
The edge node ingests the sensor data and applies a deterministic physics model. It uses an **Extended Kalman Filter (EKF)** and Fast Fourier Transform (FFT) to isolate drum frequencies from engine noise, dynamically calculating the Compaction Meter Value (CMV) and displaying it on a live grid for the operator.

## Screenshots / Dashboard
*(Dashboard visualizes a live grid mapping pass-counts, current speed, stiffness (CMV), and layer thickness.)*

## Challenges I Faced
Designing a system that is truly "hardware-agnostic" required deep consideration of vibration transfer across different roller chassis types. Additionally, isolating the actual compaction frequency from the raw mechanical noise of a heavy diesel machine is mathematically complex.

## What I Learned
I learned the critical importance of sensor fusion (combining GPS, LiDAR, and accelerometers) to cross-validate noisy real-world data. Implementing the theoretical math behind the Extended Kalman Filter (EKF) significantly leveled up my understanding of state estimation algorithms.

## Current Status
This project remains an academic prototype and system architecture design proposed for the NHAI Hackathon. It has not been deployed for field testing.

## Future Improvements
The next phase requires building a physical bench-scale model to perform controlled validation of the EKF algorithm against actual Plate Load Tests before moving to heavy machinery.
`;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Updated UIC JSON with standardized layout.");
