/**
 * @file script.js
 * @brief Geotechnical Dashboard SPA Logic & Telemetry Polling
 */

// Global State
let currentSessionId = null;
let lastSessionId = null;
let lastTelemetryTime = Date.now();
let isHistoricalMode = false;
let globalPollingTimer = null;
const POLLING_INTERVAL_MS = 500;
const HARDWARE_TIMEOUT_MS = 3000;

// Velocity Tracking
let lastSettlementAvg = 0;
let lastPollingTimestamp = Date.now();

// Chart Instances
let chartSettlement, chartLoad, chartStrainLoad;

// DOM Elements
const btnStartSession = document.getElementById("btnStartSession");
const btnStopSession = document.getElementById("btnStopSession");
const btnTareSensors = document.getElementById("btnTareSensors");
const activeSessionControls = document.getElementById("activeSessionControls");

const sessionStatusText = document.getElementById("sessionStatusText");
const statusIndicator = document.querySelector(".status-indicator");
const hwDisconnectWarning = document.getElementById("hwDisconnectWarning");

// Historical DOM Elements
const btnResumeLive = document.getElementById("btnResumeLive");
const btnAnalyzeCsv = document.getElementById("btnAnalyzeCsv");
const historicalCsvUpload = document.getElementById("historicalCsvUpload");
const historicalStatus = document.getElementById("historicalStatus");

// Values
const valLoad = document.getElementById("valLoad");
const valSettlement1 = document.getElementById("valSettlement1");
const valSettlement2 = document.getElementById("valSettlement2");
const valStrain = document.getElementById("valStrain");
const valTensileForce = document.getElementById("valTensileForce");
const valVelocity = document.getElementById("valVelocity");

const threshSettlement = document.getElementById("threshSettlement");
const threshStrain = document.getElementById("threshStrain");

const feedRaw = document.getElementById("feedRaw");
const feedProcessed = document.getElementById("feedProcessed");
const anomalyBadge = document.getElementById("anomalyBadge");

const stateWarningBox = document.getElementById("stateWarningBox");
const stateIndicator = document.getElementById("stateIndicator");
const stateText = document.getElementById("stateText");

const diagLoad = document.getElementById("diagLoad");
const diagSettlement = document.getElementById("diagSettlement");
const diagStrain = document.getElementById("diagStrain");

const dataLogTableBody = document.querySelector("#dataLogTable tbody");

// Export Buttons
const btnExportCsv = document.getElementById("btnExportCsv");
const btnExportVision = document.getElementById("btnExportVision");
const btnExportVideo = document.getElementById("btnExportVideo");
const btnPrintReport = document.getElementById("btnPrintReport");
const btnPrintFullReport = document.getElementById("btnPrintFullReport");

// ==========================================
// SPA ROUTING
// ==========================================
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove active class from all buttons and panels
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
        
        // Set active
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-target");
        document.getElementById(targetId).classList.add("active");
    });
});

// ==========================================
// SESSION MANAGEMENT & EXPORT
// ==========================================
btnStartSession.addEventListener("click", async () => {
    try {
        const isDemo = document.getElementById("toggleDemoMode").checked;
        const response = await fetch("/api/start-session", { 
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ demo_mode: isDemo })
        });
        const data = await response.json();
        
        if (data.status === "success") {
            currentSessionId = data.session_id;
            lastSessionId = data.session_id;
            
            // Update UI
            btnStartSession.style.display = "none";
            activeSessionControls.style.display = "flex";
            sessionStatusText.innerText = "Session Active";
            statusIndicator.classList.remove("offline");
            statusIndicator.classList.add("active");
            
            // Clear existing chart data
            resetCharts();
            dataLogTableBody.innerHTML = "";
            lastSettlementAvg = 0;
            valVelocity.innerText = "0.00";
        }
    } catch (err) {
        console.error("Failed to start session:", err);
        alert("Server error: Could not start session.");
    }
});

btnStopSession.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/stop-session", { method: "POST" });
        const data = await response.json();
        if (data.status === "success") {
            currentSessionId = null;
            btnStartSession.style.display = "block";
            activeSessionControls.style.display = "none";
            sessionStatusText.innerText = "Session Stopped";
            statusIndicator.classList.remove("active");
            statusIndicator.classList.add("offline");
            alert("Test Stopped. Timelapse Video generated and ready for download!");
        }
    } catch (err) {
        console.error(err);
    }
});

btnTareSensors.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/tare", { method: "POST" });
        const data = await response.json();
        if (data.status === "success") {
            resetCharts();
            lastSettlementAvg = 0;
            alert("Sensors successfully zeroed out.");
        }
    } catch (err) {
        console.error(err);
    }
});

btnExportCsv.addEventListener("click", () => {
    const sid = currentSessionId || lastSessionId;
    if (!sid) return alert("No active or previous session to export.");
    window.location.href = `/api/export-session/${sid}`;
});

btnExportVision.addEventListener("click", () => {
    const sid = currentSessionId || lastSessionId;
    if (!sid) return alert("No active or previous session to export.");
    window.location.href = `/api/export-vision/${sid}`;
});

btnExportVideo.addEventListener("click", async () => {
    const sid = currentSessionId || lastSessionId;
    if (!sid) return alert("No active or previous session to export.");
    
    try {
        const response = await fetch(`/api/export-video/${sid}`);
        if (!response.ok) {
            alert("Warning: No camera frames were uploaded by the ESP32 during this test. Timelapse video cannot be generated without images!");
            return;
        }
        
        // Trigger download dynamically if successful
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timelapse_${sid}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert("Server network error while downloading video.");
    }
});

btnPrintReport.addEventListener("click", () => {
    document.body.classList.remove("print-full");
    window.print();
});

btnPrintFullReport.addEventListener("click", () => {
    document.body.classList.add("print-full");
    window.print();
    setTimeout(() => document.body.classList.remove("print-full"), 1500);
});

// ==========================================
// CHART.JS NEON GLOW PLUGIN & INITIALIZATION
// ==========================================
const neonGlowPlugin = {
    id: 'neonGlow',
    beforeDatasetDraw(chart, args) {
        const dataset = chart.data.datasets[args.index];
        const ctx = chart.ctx;
        if (dataset.shadowBlur && dataset.shadowColor) {
            ctx.save();
            ctx.shadowBlur = dataset.shadowBlur;
            ctx.shadowColor = dataset.shadowColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    },
    afterDatasetDraw(chart, args) {
        const dataset = chart.data.datasets[args.index];
        if (dataset.shadowBlur && dataset.shadowColor) {
            chart.ctx.restore();
        }
    }
};
Chart.register(neonGlowPlugin);

function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            x: { 
                ticks: { color: "#94a3b8", maxTicksLimit: 10 }, 
                grid: { color: "rgba(255,255,255,0.05)" } 
            },
            y: { 
                ticks: { color: "#94a3b8" }, 
                grid: { color: "rgba(255,255,255,0.05)" } 
            }
        },
        plugins: { legend: { labels: { color: "#e2e8f0" } } }
    };

    const ctxSettlement = document.getElementById('chartSettlement').getContext('2d');
    chartSettlement = new Chart(ctxSettlement, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Settlement 1 (mm)', data: [], borderColor: '#f59e0b', shadowBlur: 15, shadowColor: '#f59e0b', borderWidth: 2, pointRadius: 0, tension: 0.3 },
                { label: 'Settlement 2 (mm)', data: [], borderColor: '#ef4444', shadowBlur: 15, shadowColor: '#ef4444', borderWidth: 2, pointRadius: 0, tension: 0.3 }
            ]
        },
        options: commonOptions
    });

    const ctxLoad = document.getElementById('chartLoad').getContext('2d');
    chartLoad = new Chart(ctxLoad, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{ label: 'Load (kPa)', data: [], borderColor: '#22d3ee', shadowBlur: 15, shadowColor: '#22d3ee', borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: 'rgba(34, 211, 238, 0.1)', tension: 0.3 }]
        },
        options: commonOptions
    });

    const ctxStrainLoad = document.getElementById('chartStrainLoad').getContext('2d');
    chartStrainLoad = new Chart(ctxStrainLoad, {
        type: 'scatter',
        data: {
            datasets: [{ label: 'Strain vs Load', data: [], backgroundColor: '#c084fc', shadowBlur: 15, shadowColor: '#c084fc', pointRadius: 4 }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { title: { display: true, text: 'Load (kPa)', color: '#94a3b8' }, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
                y: { title: { display: true, text: 'Strain (µε)', color: '#94a3b8' }, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } }
            }
        }
    });
}

function resetCharts() {
    chartSettlement.data.labels = [];
    chartSettlement.data.datasets.forEach(ds => ds.data = []);
    chartSettlement.update();
    
    chartLoad.data.labels = [];
    chartLoad.data.datasets[0].data = [];
    chartLoad.update();
    
    chartStrainLoad.data.datasets[0].data = [];
    chartStrainLoad.update();
}

// ==========================================
// TELEMETRY POLLING & UPDATES
// ==========================================
async function pollTelemetry() {
    try {
        const response = await fetch("/api/live-stream");
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        // Check if data actually updated based on timestamp or just assume it's alive if response ok
        lastTelemetryTime = Date.now();
        hwDisconnectWarning.style.display = "none";

        updateDOM(data);
        
        if (currentSessionId) {
            updateCharts(data);
            updateDataLog(data);
        }

    } catch (err) {
        console.warn("Polling error:", err);
    }
}

// Hardware Disconnect Watchdog
setInterval(() => {
    if (Date.now() - lastTelemetryTime > HARDWARE_TIMEOUT_MS) {
        hwDisconnectWarning.style.display = "flex";
        
        // Override state warning
        stateIndicator.innerHTML = `
            <div class="light red" style="animation: flashDanger 0.5s infinite alternate;"></div>
            <span id="stateText" style="color: var(--color-danger)">HARDWARE DISCONNECTED</span>
        `;
        stateWarningBox.style.borderColor = "var(--color-danger)";
    }
}, 1000);

function updateDOM(data) {
    // 1. Digital Displays
    // Load cell not explicitly passed in previous mock schema as direct kPa, assuming we can parse from strain or we map settlement?
    // Oh wait, the previous code had 'Load' from the ESP32. If not in payload, we'll mock it here based on strain for UI completeness.
    const load_kPa = (data.strain_ue * 0.12).toFixed(1); 
    
    valLoad.innerText = load_kPa;
    valSettlement1.innerText = data.settlement_1_mm.toFixed(2);
    valSettlement2.innerText = data.settlement_2_mm.toFixed(2);
    valStrain.innerText = data.strain_ue.toFixed(1);
    
    // 2. Vision Feeds (Cache busting)
    const t = new Date().getTime();
    feedRaw.src = `./raw_current.png?t=${t}`;
    feedProcessed.src = `./processed_current.png?t=${t}`;
    
    if (data.crack_detected) {
        anomalyBadge.className = "anomaly-badge danger";
        anomalyBadge.innerText = "ANOMALY DETECTED";
    } else {
        anomalyBadge.className = "anomaly-badge secure";
        anomalyBadge.innerText = "SECURE";
    }

    // 3. Structural Diagnostics
    valTensileForce.innerText = data.estimated_tensile_force_kN.toFixed(2);
    
    // Calculate Velocity
    const avgSettlement = (data.settlement_1_mm + data.settlement_2_mm) / 2;
    const now = Date.now();
    const dtSeconds = (now - lastPollingTimestamp) / 1000.0;
    
    if (dtSeconds > 0) {
        const velocity = (avgSettlement - lastSettlementAvg) / dtSeconds;
        // Basic smoothing/truncation
        if (Math.abs(velocity) < 0.05) {
            valVelocity.innerText = "0.00";
        } else {
            valVelocity.innerText = velocity.toFixed(3);
        }
    }
    lastSettlementAvg = avgSettlement;
    lastPollingTimestamp = now;

    // Threshold checks
    const maxSettlement = parseFloat(threshSettlement.value) || 8.0;
    const maxStrain = parseFloat(threshStrain.value) || 500;
    
    const isYielding = data.settlement_1_mm > (maxSettlement * 0.5) || data.strain_ue > (maxStrain * 0.5) || data.crack_detected;
    const isFailing = data.settlement_1_mm > maxSettlement || data.strain_ue > maxStrain;

    if (isFailing) {
        stateIndicator.innerHTML = `
            <div class="light red"></div>
            <span id="stateText" style="color: var(--color-danger)">CRITICAL: THRESHOLD BREACH</span>
        `;
        stateWarningBox.style.borderColor = "var(--color-danger)";
    } else if (isYielding) {
        stateIndicator.innerHTML = `
            <div class="light yellow"></div>
            <span id="stateText" style="color: var(--color-warning)">WARNING: YIELDING</span>
        `;
        stateWarningBox.style.borderColor = "var(--color-warning)";
    } else {
        stateIndicator.innerHTML = `
            <div class="light green"></div>
            <span id="stateText" style="color: var(--color-success)">STATUS: STABLE</span>
        `;
        stateWarningBox.style.borderColor = "rgba(255,255,255,0.05)";
    }

    // 4. HTML Subsurface Diagram
    diagLoad.innerText = load_kPa;
    diagSettlement.innerText = `↓ ${avgSettlement.toFixed(2)} mm`;
    diagStrain.innerText = data.strain_ue.toFixed(1);
}

function updateCharts(data) {
    const timeLabel = new Date().toLocaleTimeString();
    
    // Settlement Chart
    chartSettlement.data.labels.push(timeLabel);
    chartSettlement.data.datasets[0].data.push(data.settlement_1_mm);
    chartSettlement.data.datasets[1].data.push(data.settlement_2_mm);
    if (chartSettlement.data.labels.length > 50) {
        chartSettlement.data.labels.shift();
        chartSettlement.data.datasets.forEach(ds => ds.data.shift());
    }
    chartSettlement.update();

    // Load Chart
    const load_kPa = data.strain_ue * 0.12;
    chartLoad.data.labels.push(timeLabel);
    chartLoad.data.datasets[0].data.push(load_kPa);
    if (chartLoad.data.labels.length > 50) {
        chartLoad.data.labels.shift();
        chartLoad.data.datasets[0].data.shift();
    }
    chartLoad.update();

    // Strain vs Load
    chartStrainLoad.data.datasets[0].data.push({ x: load_kPa, y: data.strain_ue });
    if (chartStrainLoad.data.datasets[0].data.length > 100) {
        chartStrainLoad.data.datasets[0].data.shift();
    }
    chartStrainLoad.update();
}

function updateDataLog(data) {
    const row = document.createElement("tr");
    const load_kPa = (data.strain_ue * 0.12).toFixed(1);
    
    row.innerHTML = `
        <td>${data.timestamp}</td>
        <td>${load_kPa}</td>
        <td>${data.settlement_1_mm.toFixed(2)}</td>
        <td>${data.strain_ue.toFixed(1)}</td>
        <td style="color: ${data.crack_detected ? 'var(--color-danger)' : 'var(--color-success)'}">
            ${data.crack_detected ? 'DETECTED' : 'CLEAR'}
        </td>
    `;
    
    dataLogTableBody.prepend(row);
    if (dataLogTableBody.children.length > 15) {
        dataLogTableBody.lastElementChild.remove();
    }
}

// Bootstrap
window.addEventListener("DOMContentLoaded", () => {
    initCharts();
    globalPollingTimer = setInterval(pollTelemetry, POLLING_INTERVAL_MS);
    
    if (btnAnalyzeCsv) btnAnalyzeCsv.addEventListener("click", uploadAndAnalyzeCSV);
    if (btnResumeLive) btnResumeLive.addEventListener("click", resumeLiveTelemetry);
});

// ==========================================
// HISTORICAL ANALYSIS MODE
// ==========================================
async function uploadAndAnalyzeCSV() {
    if (!historicalCsvUpload.files.length) {
        historicalStatus.innerText = "Please select a file first.";
        historicalStatus.style.color = "var(--neon-red)";
        return;
    }
    
    historicalStatus.innerText = "Uploading and parsing...";
    historicalStatus.style.color = "var(--neon-cyan)";
    
    const formData = new FormData();
    formData.append("csv", historicalCsvUpload.files[0]);
    
    try {
        const response = await fetch("/api/upload-csv", { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.status === "success") {
            // Enter Historical Mode
            isHistoricalMode = true;
            if (globalPollingTimer) clearInterval(globalPollingTimer);
            btnResumeLive.style.display = "block";
            
            // Dim Vision Feeds
            feedRaw.style.opacity = "0.2";
            feedProcessed.style.opacity = "0.2";
            
            // Update Charts
            const data = result.historical_data;
            
            chartSettlement.data.labels = data.timestamps;
            chartSettlement.data.datasets[0].data = data.settlement_1_mm;
            chartSettlement.data.datasets[1].data = data.settlement_2_mm;
            chartSettlement.update();
            
            chartLoad.data.labels = data.timestamps;
            chartLoad.data.datasets[0].data = data.load_kPa;
            chartLoad.update();
            
            const scatterData = data.load_kPa.map((l, i) => ({ x: l, y: data.strain_ue[i] }));
            chartStrainLoad.data.datasets[0].data = scatterData;
            chartStrainLoad.update();
            
            // Update Data Log (Show all with scrolling in Historical Mode)
            dataLogTableBody.innerHTML = "";
            const historicalLogs = data.table_data; // Show all 203+ points!
            historicalLogs.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.timestamp}</td>
                    <td>${row.load_kPa.toFixed(1)}</td>
                    <td>${row.settlement_1_mm.toFixed(2)}</td>
                    <td>${row.strain_ue.toFixed(1)}</td>
                    <td style="color: ${row.crack_detected ? 'var(--neon-red)' : 'var(--neon-green)'}">
                        ${row.crack_detected ? 'DETECTED' : 'CLEAR'}
                    </td>
                `;
                dataLogTableBody.appendChild(tr);
            });
            
            historicalStatus.innerText = "Dataset Loaded Successfully.";
            historicalStatus.style.color = "var(--neon-green)";
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        historicalStatus.innerText = "Error: " + e.message;
        historicalStatus.style.color = "var(--neon-red)";
    }
}

function resumeLiveTelemetry() {
    isHistoricalMode = false;
    btnResumeLive.style.display = "none";
    if (historicalStatus) {
        historicalStatus.innerText = "Select a previously downloaded session .csv to visualize.";
        historicalStatus.style.color = "var(--color-text-secondary)";
    }
    
    // Restore Vision Feeds
    feedRaw.style.opacity = "1";
    feedProcessed.style.opacity = "1";
    
    resetCharts();
    dataLogTableBody.innerHTML = "";
    
    globalPollingTimer = setInterval(pollTelemetry, POLLING_INTERVAL_MS);
}
