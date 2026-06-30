const fs = require("fs");
const path = require("path");

const files = [
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "content", "projects", "generated", "automation-intelligent-machine-guided-construction.json"),
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "data", "projects", "automation-intelligent-machine-guided-construction.json")
];

const newContent = {
  title: "Universal Intelligent Compaction (UIC) Kit",
  project_name: "Universal Intelligent Compaction (UIC) Kit",
  overview: "A research-driven engineering concept developed for the 5th NHAI Innovation Hackathon under the Automation & Intelligent Machine Guided Construction (AIMC) challenge. The project proposes a retrofit system capable of transforming conventional vibratory road rollers into intelligent compaction platforms using sensor fusion, edge computing, and real-time operator guidance.",
  problem: "Conventional pavement compaction quality control relies on destructive testing methods performed after construction. This creates delayed feedback, incomplete quality records, and increases the risk of under-compaction, over-compaction, and premature pavement failure. The hackathon challenged participants to develop a technology-driven, self-sustaining monitoring system that combines geospatial positioning with electronic sensors to automate quality assurance.",
  mySolution: "I proposed the Universal Intelligent Compaction (UIC) Kit—a hardware-agnostic retrofit module designed to add intelligent monitoring capabilities to existing road rollers rather than replacing them. The concept combines multiple sensors, edge computing, and a centralized dashboard to estimate compaction quality, monitor material thickness, and assist operators during construction.",
  role: "I independently researched intelligent compaction systems, studied existing literature, analysed the NHAI problem statement, designed the proposed system architecture, selected the hardware stack, prepared the technical documentation, and developed the overall product concept.\n\nTo accelerate development, I used AI-assisted development for the dashboard interface and software visualization while directing the architecture, feature planning, user experience, and complete system workflow.",
  architecture: "The proposed system integrates vibration sensing, geospatial positioning, material thickness measurement, and temperature monitoring into an edge-computing platform. Sensor data would be processed locally before generating live compaction metrics and operator guidance through a centralized dashboard. The design emphasizes modularity, retrofit compatibility, and scalable deployment across existing construction fleets.",
  implementation: "### Hardware\n* Industrial ICP Accelerometer\n* RTK-GPS + IMU\n* Time-of-Flight LiDAR\n* Infrared Temperature Sensor\n* Industrial Edge Computing Module\n* Ruggedized Operator Display\n\n### Software\n* Python\n* NumPy\n* Flask\n* Interactive Dashboard\n* Telemetry Visualization\n* Geospatial Mapping\n* AI-assisted UI Development\n\n### Dashboard Features\n* Live roller trajectory visualization\n* Pass-count monitoring\n* Compaction value mapping\n* Material thickness visualization\n* Geospatial coverage map\n* Speed guidance interface\n* Simulated telemetry playback\n* Interactive operator dashboard\n\n### Key Engineering Ideas\n* Hardware-agnostic retrofit architecture\n* Edge computing for low-latency processing\n* Sensor fusion for intelligent compaction monitoring\n* Geospatial quality mapping\n* Unified digital records for quality assurance\n* Cost-effective deployment using commercially available hardware",
  challenges: "The primary challenge was designing a technically feasible solution that balanced accuracy, scalability, and affordability. Considerable research was required to understand intelligent compaction technologies, identify suitable sensing methods, and integrate them into a coherent system architecture aligned with the hackathon objectives.",
  whatILearned: "This project introduced me to intelligent compaction systems, sensor fusion, edge computing, geospatial monitoring, and infrastructure automation. It also strengthened my ability to transform an open-ended engineering problem into a structured technical proposal supported by research, system architecture, and implementation planning.",
  currentStatus: "The UIC Kit is a research and concept proposal developed for the NHAI Innovation Hackathon. While no physical prototype was constructed, the project includes a detailed architecture, hardware selection, workflow design, feasibility analysis, cost estimation, and an interactive software demonstration to communicate the proposed solution.",
  futureImprovements: "* Build a functional hardware prototype.\n* Validate sensing algorithms through laboratory testing.\n* Develop the edge-computing software stack.\n* Integrate live telemetry from physical sensors.\n* Conduct field trials on construction equipment.\n* Evaluate performance against conventional compaction methods.",
  description: "A research-driven engineering concept proposing a retrofit module to transform conventional vibratory road rollers into intelligent compaction platforms using sensor fusion, edge computing, and live guidance."
};

const detailedOverview = `### Overview
${newContent.overview}

### The Problem
${newContent.problem}

### The Proposal
${newContent.mySolution}

### Proposed Architecture
${newContent.architecture}

### Proposed Technology Stack & Implementation
${newContent.implementation}

### Challenges
${newContent.challenges}

### What I Learned
${newContent.whatILearned}

### Current Status
${newContent.currentStatus}

### Future Work
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

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("Updated", file);
  } else {
    console.log("Not found", file);
  }
}
