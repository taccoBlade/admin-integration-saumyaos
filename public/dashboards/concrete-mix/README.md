# PRO-MIX: Industrial Concrete Design & Compliance Engine

PRO-MIX is an advanced, web-based concrete mix design and auditing platform. It is engineered to perform rigorous mix proportion calculations for both standard Normal Concrete and experimental Geopolymer Concrete, ensuring mathematical precision, cost optimization, and environmental sustainability tracking.

⚠️ **Disclaimer:** This software is designed for educational, research, and theoretical modeling purposes. It is not intended for direct site use without professional engineering validation.

## 🚀 Key Features

*   **Dual Computation Engines**: 
    *   **Normal Concrete Mode**: Strictly calculates proportions according to the Indian Standard **IS 10262:2019** and **IS 456:2000** durability guidelines.
    *   **Geopolymer Mode**: Utilizes advanced research models to determine ratios for non-Portland cement alternative binders activated by silicate/hydroxide solutions.
*   **Dynamic Material Database**: Fully customizable binder library (OPC, Fly Ash, GGBS, Metakaolin, Silica Fume). Mix and match your active binders with dynamic specific gravity, cost, and CO₂ override tracking.
*   **AI Optimizer Engine**: Input your target constraints and the optimizer will return the top generated candidates that balance cost, CO₂ emissions, and compressive strength, complete with a 1-click "Use" button to instantly apply the design.
*   **System-Wide Compliance Auditing**: Automatically verifies absolute volume balancing, moisture correction for aggregates, and maximum water-cement ratio limits. 
*   **Presets & State Management**: Save your active configuration as a custom preset. Import and Export entire project states via JSON to seamlessly share configurations.
*   **Report Generation**: Export calculated batch proportions, charts, and validation checklists directly to PDF.

## 🏗️ Technical Stack

*   **Backend**: Python, Flask REST API
*   **Calculations**: Modular Python calculation engines (`engines/`)
*   **Frontend**: Vanilla JavaScript (`static/app.js`), HTML5 (`templates/index.html`), and custom CSS variables for themes.
*   **Visualizations**: Chart.js for mix proportion donut charts and binder stacked bars.

## ⚙️ Installation & Usage

1. **Clone the Repository** and navigate to the root directory.
2. **Install Dependencies** (Ensure you have Python installed):
   ```bash
   pip install flask
   ```
3. **Run the Server**:
   ```bash
   python app.py
   ```
4. **Access the Application**: Open your browser and navigate to `http://localhost:5000`

## 🧪 Testing

The codebase includes programmatic verification tests to ensure that the IS 10262 calculations do not drift and remain fully compliant.

```bash
python verify_backend.py
```

## 📜 Compliance Auditing

This project strictly follows the **Teamwork Compliance Workflow**. Any adjustments made to the mathematical calculation engines are subjected to an evidence-based Verification Report and a Code Compliance Audit prior to merging.
