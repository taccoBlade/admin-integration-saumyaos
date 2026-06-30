const fs = require("fs");
const path = require("path");

const files = [
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "content", "projects", "generated", "promix-concrete-mix-design-compliance-dashboard.json"),
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "data", "projects", "promix-concrete-mix-design-compliance-dashboard.json")
];

const newContent = {
  overview: "PRO-MIX is a web-based computational platform developed to automate concrete mix design calculations and streamline engineering workflows. The application combines standards-based concrete mix design with analytical modules for supplementary cementitious materials (SCMs) and geopolymer mixtures, allowing users to evaluate both conventional and alternative binder systems within a single interface.",
  problem: "The platform replaces repetitive manual calculations and spreadsheet-based workflows with a centralized computational engine capable of performing engineering calculations, validating user inputs, generating reports, and comparing material alternatives in real time.",
  architecture: "The platform follows a modular client-server architecture that separates engineering calculations from the user interface.\n\n### Backend\nA Python-Flask application performs all engineering calculations, validation, report generation, and data processing through independent computational modules.\n\n### Frontend\nA lightweight HTML, CSS, and JavaScript interface presents engineering data using an interactive dashboard optimized for rapid parameter input and result visualization.\n\n### Design Philosophy\nA lightweight technology stack was selected to simplify deployment, reduce dependencies, and maintain portability across laboratory, academic, and research environments while keeping the engineering logic independent from the presentation layer.",
  implementation: "### Engineering Decisions\n\n#### Independent Calculation Modules\nThe platform separates conventional concrete mix design from geopolymer analysis to ensure each workflow follows its own engineering methodology.\n\n*   **IS 10262:2019 Module** performs conventional concrete mix design calculations following the relevant provisions of the Indian Standard, including water-cement ratio evaluation, volume balancing, aggregate proportioning, and material quantity calculations.\n*   **Geopolymer Analysis Module** provides analytical calculations for alkali-activated binder systems using research-based design methodologies without treating these calculations as IS 10262 compliance.\n\nSeparating these workflows prevents experimental material studies from affecting standards-based concrete calculations while allowing both modules to coexist within a unified platform.\n\n#### Dynamic Material Management\nRather than relying on predefined material templates, the application stores constituent materials through a configurable data structure.\n\nThis enables users to create custom combinations of cement, fly ash, GGBS, silica fume, and other supplementary cementitious materials while automatically recalculating material properties, estimated costs, and environmental metrics throughout the application.\n\nThe modular approach also allows additional materials to be introduced without modifying the core calculation engine.\n\n#### Engineering Validation\nReliable engineering software depends on preventing invalid calculations before they occur.\n\nTo improve calculation reliability, multiple validation layers were implemented throughout the application. User inputs are verified before entering the computational engine, ensuring invalid values, incomplete datasets, or unrealistic parameter combinations cannot generate misleading engineering results.\n\nThis validation framework improves stability while maintaining consistency across all calculation modules.\n\n### AI-Assisted Development\nAI-assisted development was used to accelerate implementation of the user interface, backend scaffolding, and repetitive development tasks.\n\nThe engineering workflow, application architecture, calculation sequence, validation strategy, and implementation of engineering standards were independently designed and continuously verified throughout development. Additional validation and testing layers were incorporated to ensure that AI-assisted implementation did not compromise engineering calculations or platform reliability.\n\n### Current Capabilities\nThe current version of PRO-MIX includes:\n*   Automated conventional concrete mix design based on IS 10262:2019.\n*   Packing density calculations using the Toufar model.\n*   Comparative analysis of supplementary cementitious materials.\n*   Geopolymer mix analysis and activator calculations.\n*   Dynamic material database and configurable material management.\n*   Automatic engineering report generation.\n*   Excel export for laboratory documentation.\n*   Integrated engineering validation and input protection.\n*   Interactive dashboard for rapid design iteration.",
  futureImprovements: "Future development will focus on expanding the platform beyond standards-based calculations by introducing intelligent engineering assistance.\n\nPlanned improvements include:\n*   Machine learning models for compressive strength prediction.\n*   Cost optimization using regional material prices.\n*   Carbon footprint estimation and sustainability analysis.\n*   Support for additional international concrete design standards such as ACI and Eurocode.\n*   Cloud-based project management and collaboration.\n*   REST API integration for laboratory information systems and batching plant software.",
  description: "A web-based computational platform developed to automate concrete mix design calculations and streamline engineering workflows."
};

const detailedOverview = `### Overview
${newContent.overview}

### The Problem
${newContent.problem}

### Architecture & Design Philosophy
${newContent.architecture}

### Implementation & Engineering Decisions
${newContent.implementation}

### Future Roadmap
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
    
    // Clear unused fields since they are not in the new provided text
    data.challenges = "";
    data.mySolution = "";
    data.whatILearned = "";
    data.currentStatus = "";
    data.role = "";

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("Updated", file);
  } else {
    console.log("Not found", file);
  }
}
