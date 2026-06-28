import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "content/projects/generated/soil-analysis-project-with-iot-integration.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

data.content = `
## Overview
A geotechnical monitoring prototype designed to track real-time soil deformation and vertical settlement during compaction processes using embedded telemetry.

## Problem
In geotechnical engineering, monitoring soil settlement historically involves manual surveying or post-compaction core sampling. This reactive approach creates data gaps and delays critical feedback during the actual compaction phase, risking structural failure.

## My Solution
I developed an automated soil monitoring telemetry system that continuously captures strain data and transmits it wirelessly to a centralized dashboard. This provides immediate visibility into the consolidation behavior of the soil mass under load.

## Architecture
The system relies on a localized edge-computing architecture. Strain gauges (coupled with HX711 amplifiers) collect analog deformation data, which is processed by an ESP32 microcontroller and broadcast over MQTT to a Flask-based backend for storage and visualization.

## Implementation
### Hardware List
*   **ESP32 Microcontroller:** Selected for built-in Wi-Fi and lower power consumption compared to a Raspberry Pi.
*   **HX711 Load Cell Amplifier:** Used for high-precision 24-bit analog-to-digital conversion of the strain gauge signals.
*   **Foil Strain Gauges:** Embedded within the soil matrix to measure micro-strains.

### Telemetry Concept
The ESP32 samples data at a high frequency, applies a moving average filter to reduce mechanical noise, and publishes the payload via MQTT. The Flask server subscribes to these topics and updates the UI via WebSockets.

## Screenshots / Dashboard
*(A live data dashboard visualizes the real-time strain curve and vertical settlement mm vs time.)*

## Challenges I Faced
Hardware integration proved much harder than pure software. Dealing with signal noise from the HX711 required implementing digital low-pass filtering. Furthermore, calibrating the raw strain data to physical settlement (mm) required developing a custom regression model against known lab weights.

## What I Learned
I gained a deep understanding of embedded systems, specifically how to manage power, bandwidth, and noise when designing hardware for harsh physical environments like soil matrices. 

## Current Status
The prototype successfully demonstrates continuous telemetry under laboratory-scale load tests.

## Future Improvements
Future iterations should explore integrating LoRaWAN for long-range deployment on actual construction sites, bypassing the limitations of local Wi-Fi networks.
`;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Updated Soil Monitoring JSON with standardized layout.");

// Also update the other soil json file just in case it's used
const file2 = path.join(process.cwd(), "content/projects/generated/automated-soil-strain-and-settlement-analysis-system-with-iot-integration.json");
if (fs.existsSync(file2)) {
  const data2 = JSON.parse(fs.readFileSync(file2, "utf8"));
  data2.content = data.content;
  fs.writeFileSync(file2, JSON.stringify(data2, null, 2));
}
