const fs = require("fs");
const path = require("path");

const files = [
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "content", "projects", "generated", "automated-soil-strain-and-settlement-analysis-system-with-iot-integration.json"),
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "data", "projects", "automated-soil-strain-and-settlement-analysis-system-with-iot-integration.json")
];

const newContent = {
  overview: "A laboratory-scale geotechnical monitoring prototype developed to monitor soil deformation and vertical settlement during compaction tests. The project combines embedded sensing, wireless telemetry, computer vision, and a modern web dashboard to provide continuous monitoring, automated data logging, and post-test analysis.",
  problem: "Traditional soil compaction monitoring often relies on manual measurements or observations taken after testing has been completed. This approach provides limited visibility into how the soil behaves during loading and makes it difficult to identify excessive settlement or deformation in real time.",
  mySolution: "I designed and built a wireless telemetry system that continuously acquires strain measurements from an instrumented sensing element and measures vertical settlement using an HC-SR04 ultrasonic sensor. The system transmits data over Wi-Fi to a centralized dashboard using HTTP communication. The platform visualizes strain, settlement, and applied load in real time while automatically recording every testing session for future analysis.",
  role: "I was responsible for the overall system design, hardware selection, sensor integration, testing, calibration, and validation of the prototype.\\n\\nTo accelerate development, I leveraged AI-assisted programming for portions of the firmware and the web application while directing the implementation, integrating the hardware with the software stack, debugging the complete workflow, and ensuring the final system performed as intended.",
  architecture: "The prototype is built around an ESP32-CAM microcontroller connected to foil strain gauges through an HX711 24-bit analog-to-digital converter and an HC-SR04 ultrasonic sensor for top settlement measurement. Sensor readings are processed on the microcontroller before being transmitted via HTTP requests to a Flask backend running on a local server. The backend stores telemetry, manages session data, and powers a responsive dashboard for live visualization and analysis.",
  implementation: "### Hardware\\n* ESP32-CAM with integrated Wi-Fi and 2 MP OV2640 camera\\n* HX711 24-bit ADC\\n* Foil strain gauge\\n* HC-SR04 Ultrasonic Sensor Module (for top settlement measurement)\\n* XL4015 DC-DC buck converter\\n* Power and signal wiring\\n\\n### Software\\n* Flask backend\\n* HTTP-based communication\\n* Live telemetry dashboard\\n* OpenCV image processing\\n* CSV session logging\\n* Automated MP4 timelapse generation\\n* PDF report generation\\n* Historical session analysis\\n* Simulation mode for offline demonstrations\\n\\n### Dashboard Features\\n* Live telemetry for strain, settlement, and applied load\\n* Interactive real-time graphs\\n  * Settlement vs Time\\n  * Load vs Time\\n  * Strain vs Load\\n* Dual camera feeds with raw and processed views\\n* Automatic CSV logging\\n* Frame archiving\\n* One-click export for CSV, PDF, ZIP, and MP4\\n* Historical data upload and visualization\\n* Built-in simulation mode for testing and demonstrations\\n\\n### Technical Specifications\\n* Strain Resolution: Approximately 5–10 µstrain\\n* Settlement Precision: ±1 mm\\n* Sampling Rate: Up to 80 Hz\\n* Camera Resolution: 2 MP\\n* Communication: HTTP over Wi-Fi\\n* Automatic Session Logging\\n* Automated Report Generation\\n* MP4 Timelapse Export",
  challenges: "Integrating the hardware and software into a reliable workflow required multiple rounds of testing and refinement. Sensor noise, calibration consistency, and stable communication between the ESP32 and the backend were the primary engineering challenges. Achieving dependable real-time telemetry required iterative debugging of both the electronics and the software pipeline.",
  whatILearned: "This project gave me practical experience in embedded systems, sensor integration, wireless communication, and real-time data visualization. It also demonstrated how AI-assisted development can significantly accelerate software implementation while still requiring engineering decisions, system integration, testing, and validation to build a functional prototype.",
  currentStatus: "The prototype successfully demonstrates continuous laboratory-scale telemetry with live monitoring, automated session logging, data visualization, and post-test reporting, serving as a proof of concept for real-time geotechnical monitoring.",
  futureImprovements: "* Support multiple distributed sensing nodes. \\n* Improve settlement estimation through advanced computer vision.\\n* Incorporate predictive analytics for anomaly detection and long-term performance monitoring."
};

const detailedOverview = `### Overview
${newContent.overview}

### The Problem
${newContent.problem}

### My Solution
${newContent.mySolution}

### System Architecture
${newContent.architecture}

### Implementation Details
${newContent.implementation}

### Challenges
${newContent.challenges}

### What I Learned
${newContent.whatILearned}

### Current Status
${newContent.currentStatus}

### Future Improvements
${newContent.futureImprovements}`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    
    // Update individual fields
    for (const key in newContent) {
      data[key] = newContent[key];
    }
    
    // Update detailedOverview
    data.detailedOverview = detailedOverview;

    // Update main description to match overview if it's there
    data.description = "A laboratory-scale geotechnical monitoring prototype developed to monitor soil deformation and vertical settlement during compaction tests.";

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("Updated", file);
  }
}
