const socket = io();

const alertBar = document.getElementById('alert-bar');
const cardCmv = document.getElementById('card-cmv');
const valSpeed = document.getElementById('val-speed');
const valCmv = document.getElementById('val-cmv');
const valThickness = document.getElementById('val-thickness');
const weatherDataEl = document.getElementById('weather-data');

// --- CANVAS GRAPHICS SETUP ---
const canvas = document.getElementById('compaction-map');
const ctx = canvas.getContext('2d');

const rollerWidth = 80;
const rollerHeight = 40;
let rollerX = canvas.width / 2; 
let rollerY = canvas.height - 20; 

let pathHistory = [];
let currentLat = 0.0;
let currentLng = 0.0;

// --- WEATHER API ---
async function fetchWeather(lat, lng) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await response.json();
        weatherDataEl.innerText = `${data.current_weather.temperature}°C | WIND: ${data.current_weather.windspeed} km/h`;
    } catch (error) {
        weatherDataEl.innerText = "SENSOR OFFLINE";
    }
}
fetchWeather(23.0225, 72.5714);

// --- LIVE WEBSOCKET DATA ---
socket.on('roller_update', function(data) {
    
    currentLat = data.lat;
    currentLng = data.lng;

    // Update Dashboard Metrics
    valSpeed.innerText = Number(data.speed).toFixed(1);
    valCmv.innerText = Number(data.cmv).toFixed(1);
    valThickness.innerText = Math.round(data.thickness);
    alertBar.innerText = data.message;

    // Color Logic
    let paintColor = "#4a4e69"; 
    if (data.color === "red") paintColor = "#ff3333";
    if (data.color === "green") paintColor = "#39ff14";
    if (data.color === "blue") paintColor = "#00e5ff";

    alertBar.style.backgroundColor = paintColor;
    alertBar.style.color = (data.color === "green" || data.color === "blue") ? "#0b0c10" : "white";
    cardCmv.style.borderColor = paintColor;
    cardCmv.style.boxShadow = `inset 0 0 20px ${paintColor}40`;

    // Move Roller visually up the screen
    rollerY -= 2; 

    // Reset loop if it drives off the top edge
    if (rollerY < -rollerHeight) {
        rollerY = canvas.height;
        pathHistory = []; 
    }

    // Save history for painting
    pathHistory.push({ x: rollerX, y: rollerY, color: paintColor });

    drawMap();
});

// --- RENDER ENGINE ---
function drawMap() {
    // 1. Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Radar Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // 3. Paint the Trail (Smooth Line Method)
    if (pathHistory.length > 1) {
        ctx.lineCap = "butt"; // Flat edges for the roller drum
        ctx.lineJoin = "miter";
        ctx.lineWidth = rollerWidth;

        for (let i = 1; i < pathHistory.length; i++) {
            let prev = pathHistory[i - 1];
            let current = pathHistory[i];

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(current.x, current.y);
            ctx.strokeStyle = current.color;
            ctx.stroke();
        }
    }

    // 4. Draw the Roller Avatar
    // Drum (Steel)
    ctx.fillStyle = "#cccccc"; 
    ctx.fillRect(rollerX - (rollerWidth / 2), rollerY, rollerWidth, 15);
    // Body (Yellow)
    ctx.fillStyle = "#f39c12"; 
    ctx.fillRect(rollerX - (rollerWidth / 2) + 10, rollerY + 15, rollerWidth - 20, rollerHeight - 15);
    // Cab (Black Glass)
    ctx.fillStyle = "#111111"; 
    ctx.fillRect(rollerX - 15, rollerY + 20, 30, 15);

    // 5. Draw Geospatial HUD Overlay
    ctx.fillStyle = "rgba(0, 229, 255, 0.8)"; // Neon Blue
    ctx.font = "14px Orbitron";
    ctx.textAlign = "left";
    
    ctx.fillText("GPS_TRK: ACTIVE", 15, 25);
    ctx.fillText(`LAT: ${currentLat.toFixed(6)}`, 15, 45);
    ctx.fillText(`LNG: ${currentLng.toFixed(6)}`, 15, 65);
    
    // Center targeting line
    ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]); 
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); 
}