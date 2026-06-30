const fs = require("fs");
const path = require("path");

const files = [
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "content", "projects", "generated", "soil-analysis-project-with-iot-integration.json"),
  path.join("c:", "Users", "saumy", "OneDrive", "Documents", "personalsite", "data", "projects", "soil-analysis-project-with-iot-integration.json")
];

const newContent = {
  title: "Smart Crop & Scheme Advisor",
  project_name: "Smart Crop & Scheme Advisor",
  overview: "The Smart Crop & Scheme Advisor is an AI-powered agricultural decision support platform developed for the IIT Gandhinagar AgriTech Hackathon. Designed for Indian farmers, the platform combines Machine Learning, IoT sensor integration, Generative AI, weather intelligence, financial forecasting, and government scheme recommendations into a single digital assistant that supports informed farming decisions from sowing to harvest.",
  problem: "Indian agriculture faces challenges including unpredictable weather, rising cultivation costs, fragmented landholdings, fluctuating market prices, and limited access to reliable advisory services. The hackathon challenged participants to develop a scalable, farmer-centric platform capable of integrating weather intelligence, soil analysis, crop recommendations, market awareness, and government support while remaining accessible in low-connectivity environments and regional languages.",
  mySolution: "Our team developed the Smart Crop & Scheme Advisor, a full-stack agricultural intelligence platform that combines IoT-enabled soil monitoring, machine learning-based crop prediction, AI-generated advisory, financial analysis, weather forecasting, and government scheme matching into a unified web application.\n\nThe platform provides personalized crop recommendations, weather-based farming alerts, estimated profitability, multilingual voice guidance, and eligibility recommendations for government schemes, helping farmers make informed agricultural decisions through a simple and accessible interface.",
  teamSize: "3 Members",
  role: "We collaborated throughout the complete development lifecycle, from planning and system design to implementation, testing, and documentation.\n\n### Team Members:\n- Saumya Parekh\n- Hetansh\n- Daxes\n\n### Our responsibilities included:\n- Designing the overall system architecture and application workflow.\n- Integrating IoT sensor data with the machine learning prediction pipeline.\n- Researching agricultural datasets and crop recommendation models.\n- Researching Indian government agricultural schemes, eligibility criteria, benefits, and required documentation to build the recommendation engine.\n- Integrating weather forecasting, financial analysis, multilingual support, and AI-powered advisory into a unified platform.\n- Using AI-assisted development to accelerate portions of the backend, dashboard, and application logic while collectively directing the application's architecture, feature implementation, testing, and user experience.",
  architecture: "The platform follows a modular architecture consisting of an IoT data acquisition layer, a Flask backend, a machine learning prediction engine, and multiple intelligent service modules.\n\nReal-time sensor readings, environmental information, and user inputs are combined to generate personalized crop recommendations, AI-generated farming guidance, financial insights, weather alerts, and government scheme recommendations through a centralized dashboard.",
  implementation: "### Backend\n* Python\n* Flask\n* Pandas\n* NumPy\n* Scikit-learn\n\n### AI & Machine Learning\n* Crop Recommendation Model\n* Google Gemini API\n* Prompt Engineering\n* AI-generated Agricultural Advisory\n\n### APIs\n* OpenWeatherMap API\n* Google Text-to-Speech\n\n### Frontend\n* HTML5\n* CSS3\n* JavaScript\n* Jinja2 Templates\n\n### IoT\n* ESP8266\n* Soil Moisture Sensor\n* Temperature Sensor\n* Humidity Sensor\n* pH Sensor\n\n### Platform Features\n**AI Crop Recommendation**\n* Machine Learning-based crop prediction\n* Hybrid manual and live IoT sensor inputs\n* Recommendations across multiple crop varieties\n\n**AI Farming Advisor**\n* Personalized crop explanations\n* Dynamic irrigation recommendations\n* Fertilizer guidance\n* Profit optimization strategies\n\n**Weather Intelligence**\n* Five-day localized weather forecasts\n* Rainfall probability analysis\n* Heat stress warnings\n* Dry spell detection\n* Thunderstorm alerts\n\n**Government Scheme Advisor**\n* Automatic eligibility matching\n* Subsidy recommendations\n* Crop insurance guidance\n* Required document assistance\n* Direct application references\n\n**Financial Analysis**\n* Revenue estimation\n* Expense tracking\n* Net profit forecasting\n* Interactive financial dashboard\n\n**Accessibility**\n* Multilingual interface\n* Voice-based advisory\n* Text-to-speech support\n* Downloadable PDF reports\n* Session persistence\n* Responsive mobile-friendly design",
  challenges: "One of the biggest challenges was integrating multiple independent systems into a seamless user experience. Combining IoT sensor inputs, machine learning predictions, weather services, AI-generated advisory, financial analysis, and government scheme recommendations required careful coordination between data processing, API integration, and frontend design while maintaining a responsive application.\n\nAnother major challenge involved researching and structuring reliable information for agricultural schemes so that recommendations remained relevant and useful for different farmer profiles.",
  whatILearned: "This project strengthened our understanding of precision agriculture, full-stack application development, machine learning integration, API orchestration, IoT systems, and AI-assisted software development. More importantly, it demonstrated how combining multiple technologies into a unified workflow can create practical solutions for real-world agricultural challenges.",
  currentStatus: "The project successfully demonstrates a functional proof of concept capable of generating AI-assisted crop recommendations, weather advisories, financial forecasts, multilingual voice guidance, and government scheme recommendations through a unified agricultural dashboard. It was developed as part of the IIT Gandhinagar AgriTech Hackathon.",
  futureImprovements: "N/A",
  description: "An AI-powered agricultural decision support platform for farmers combining ML, IoT, weather, financials, and scheme recommendations."
};

const detailedOverview = `### Overview
${newContent.overview}

### The Problem
${newContent.problem}

### Our Solution
${newContent.mySolution}

### Team & Role
${newContent.role}

### System Architecture
${newContent.architecture}

### Technology Stack & Implementation
${newContent.implementation}

### Challenges
${newContent.challenges}

### What We Learned
${newContent.whatILearned}

### Current Status
${newContent.currentStatus}`;

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
