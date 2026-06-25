// PRO-MIX App logic: Handles sieve analysis, economics, scaling, comparisons, validation evidence, and charts.

let materialsDb = {};
let defaultEcon = {};
let activeTheme = 'normal';
let compositionChart = null;
let calculationData = null;

let activeBinders = [];

const BINDER_MAPPING = {
  "OPC 33": "cement",
  "OPC 43": "cement",
  "OPC 53": "cement",
  "PPC": "cement",
  "PSC": "cement",
  "Fly Ash Class F": "fly_ash",
  "Fly Ash Class C": "fly_ash",
  "GGBS": "ggbs",
  "Metakaolin": "metakaolin",
  "Silica Fume": "silica_fume",
  "Rice Husk Ash": "rice_husk_ash"
};

const BINDER_DETAILS = {
  "cement": { label: "Base Cement", sgId: "sg_cement", econKey: "cement" },
  "fly_ash": { label: "Fly Ash Blend", sgId: "sg_fly_ash", econKey: "fly_ash" },
  "ggbs": { label: "GGBS Blend", sgId: "sg_ggbs", econKey: "ggbs" },
  "silica_fume": { label: "Silica Fume Blend", sgId: "sg_silica_fume", econKey: "silica_fume" },
  "metakaolin": { label: "Metakaolin Blend", sgId: "sg_metakaolin", econKey: "metakaolin" },
  "rice_husk_ash": { label: "Rice Husk Binder", sgId: "sg_rice_husk_ash", econKey: "rice_husk_ash" }
};

// Memory storage to compare mixes
let lastNormalResults = null;
let lastGeopolymerResults = null;
let platformMode = 'compliance';
let savedMixes = JSON.parse(localStorage.getItem('promix_mixes') || '[]');
let trialLogs = JSON.parse(localStorage.getItem('promix_trials') || '[]');
let customMaterials = JSON.parse(localStorage.getItem('promix_materials') || '{}');
let benchmarkLibrary = [];
let mixRevisionCounter = JSON.parse(localStorage.getItem('promix_revision_counter') || '{}');

// IS 383 Grading Zone Limits
const IS383_LIMITS = {
  "Zone I":   { s475: [90, 100], s236: [60, 95],  s118: [30, 70],  s600: [15, 34], s300: [5, 20],  s150: [0, 10] },
  "Zone II":  { s475: [90, 100], s236: [75, 100], s118: [55, 90],  s600: [35, 59], s300: [8, 30],  s150: [0, 10] },
  "Zone III": { s475: [90, 100], s236: [85, 100], s118: [75, 100], s600: [60, 79], s300: [12, 40], s150: [0, 10] },
  "Zone IV":  { s475: [95, 100], s236: [95, 100], s118: [90, 100], s600: [80, 100],s300: [15, 50], s150: [0, 15] }
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchEconomics();
  await fetchMaterials();
  await fetchBenchmarks();
  runSieveAnalysis();
  runGradeRecommendation();
  renderTrialLog();
  setMode('compliance');
});

// Fetch default cost/CO2 from server
async function fetchEconomics() {
  try {
    const res = await fetch("/api/economics");
    defaultEcon = await res.json();
  } catch (err) {
    console.error("Error loading economics:", err);
  }
}

// Fetch materials
// Fetch materials
async function fetchMaterials() {
  try {
    const res = await fetch("/api/materials");
    materialsDb = await res.json();
    initializeActiveBinders(activeTheme);
    renderBinderCards();
    renderMaterialSelectors();
  } catch (err) {
    console.error("Error loading materials DB:", err);
  }
}

async function fetchBenchmarks() {
  try {
    const res = await fetch("/api/benchmarks");
    const data = await res.json();
    benchmarkLibrary = data.benchmarks || [];
    const select = document.getElementById('benchmark-select');
    if (select) {
      select.innerHTML = '<option value="">Select benchmark...</option>';
      benchmarkLibrary.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.innerText = b.name;
        select.appendChild(opt);
      });
      // Load custom presets from localStorage
      const customPresets = JSON.parse(localStorage.getItem('promix_custom_presets') || '{}');
      Object.values(customPresets).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = p.name;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error loading benchmarks:", err);
  }
}

// Set theme
function setTheme(theme) {
  activeTheme = theme;
  document.body.setAttribute('data-theme', theme);
  
  document.getElementById('btn-normal').classList.toggle('active', theme === 'normal');
  document.getElementById('btn-geopolymer').classList.toggle('active', theme === 'geopolymer');

  document.getElementById('inputs-normal-card').classList.toggle('hidden', theme === 'geopolymer');
  document.getElementById('inputs-geopolymer-card').classList.toggle('hidden', theme === 'normal');

  // Update report status
  const statusBadge = document.getElementById("report-status");
  const confBadge = document.getElementById("calc-confidence");
  
  if (theme === 'normal') {
    statusBadge.innerText = "✓ Code Compliant";
    statusBadge.className = "badge badge-success";
    confBadge.innerText = "High (Validated)";
    confBadge.className = "badge badge-accent";
  } else {
    statusBadge.innerText = "⚠️ Research Methodology";
    statusBadge.className = "badge badge-error";
    confBadge.innerText = "Medium (Research)";
    confBadge.className = "badge badge-accent";
  }

  initializeActiveBinders(theme);
  renderBinderCards();
  renderMaterialSelectors();
  runSieveAnalysis();
}

function setMode(mode) {
  platformMode = mode;
  document.getElementById('mode-compliance').classList.toggle('active', mode === 'compliance');
  document.getElementById('mode-research').classList.toggle('active', mode === 'research');
  
  const optimizerCard = document.getElementById('optimizer-card');
  if (optimizerCard) {
    optimizerCard.style.display = '';
  }
  
  runCalculations();
}

function initializeActiveBinders(theme) {
  if (theme === 'normal') {
    activeBinders = [{ id: "OPC 53", pct: 100 }];
  } else {
    activeBinders = [{ id: "Fly Ash Class F", pct: 70 }, { id: "GGBS", pct: 30 }];
  }
}

function renderBinderCards() {
  const containerId = activeTheme === 'normal' ? 'binder-inputs-container-normal' : 'binder-inputs-container-geo';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  activeBinders.forEach((b, index) => {
    const card = document.createElement("div");
    card.className = "flex items-center justify-between gap-sm mb-xs";
    card.style.background = "rgba(255, 255, 255, 0.02)";
    card.style.padding = "6px 12px";
    card.style.borderRadius = "var(--radius-sm)";
    card.style.border = "1px solid rgba(255, 255, 255, 0.05)";

    const label = document.createElement("span");
    label.className = "body-xs text-main flex-1";
    label.innerText = b.id;

    const input = document.createElement("input");
    input.type = "number";
    input.style.width = "70px";
    input.style.padding = "4px 8px";
    input.style.textAlign = "right";
    input.value = b.pct;
    input.min = 0;
    input.max = 100;
    input.oninput = (e) => {
      let val = parseFloat(e.target.value) || 0;
      b.pct = val;
      if (activeTheme === 'normal') {
        const otherSum = activeBinders
          .filter(ob => BINDER_MAPPING[ob.id] !== 'cement')
          .reduce((sum, ob) => sum + ob.pct, 0);
        const cementIndex = activeBinders.findIndex(ob => BINDER_MAPPING[ob.id] === 'cement');
        if (cementIndex !== -1) {
          activeBinders[cementIndex].pct = Math.max(0, 100 - otherSum);
          const cementInput = container.querySelector(`[data-binder-id="${activeBinders[cementIndex].id}"]`);
          if (cementInput) cementInput.value = activeBinders[cementIndex].pct;
        }
      }
      updateBinderSum(activeTheme);
      runCalculations();
    };
    input.setAttribute("data-binder-id", b.id);
    if (activeTheme === 'normal' && BINDER_MAPPING[b.id] === 'cement') {
      input.readOnly = true;
      input.style.opacity = "0.7";
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.color = "var(--error)";
    deleteBtn.style.border = "none";
    deleteBtn.style.fontSize = "16px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.onclick = () => {
      activeBinders.splice(index, 1);
      renderBinderCards();
      renderMaterialSelectors();
      updateBinderSum(activeTheme);
      runCalculations();
    };

    card.appendChild(label);
    card.appendChild(input);
    card.appendChild(deleteBtn);
    container.appendChild(card);
  });

  populateBinderDropdown();
}

function populateBinderDropdown() {
  const selectId = activeTheme === 'normal' ? 'add-binder-select-normal' : 'add-binder-select-geo';
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "<option value=''>Select binder...</option>";

  const binders = materialsDb["binders"] || {};
  const activeCategories = activeBinders.map(b => BINDER_MAPPING[b.id]);
  const allowedCategories = activeTheme === 'normal' 
    ? ['cement', 'fly_ash', 'ggbs', 'silica_fume', 'metakaolin']
    : ['fly_ash', 'ggbs', 'metakaolin', 'rice_husk_ash', 'silica_fume'];

  for (let key in binders) {
    const cat = BINDER_MAPPING[key];
    if (allowedCategories.includes(cat) && !activeCategories.includes(cat)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.innerText = key;
      select.appendChild(opt);
    }
  }
}

function handleAddBinder(theme) {
  const selectId = theme === 'normal' ? 'add-binder-select-normal' : 'add-binder-select-geo';
  const select = document.getElementById(selectId);
  if (!select) return;
  const val = select.value;
  if (!val) return;

  activeBinders.push({ id: val, pct: 0 });

  renderBinderCards();
  renderMaterialSelectors();
  updateBinderSum(theme);
  runCalculations();
}

// Render dynamic Material selectors with economics overrides
function renderMaterialSelectors() {
  const container = document.getElementById("material-db-container");
  container.innerHTML = "";

  activeBinders.forEach(b => {
    const cat = BINDER_MAPPING[b.id];
    const details = BINDER_DETAILS[cat];
    if (details) {
      let label = details.label;
      if (activeTheme === 'normal' && cat === 'cement') label = "Base Cement";
      else if (activeTheme === 'geopolymer' && cat === 'fly_ash') label = "Primary Binder";
      else if (activeTheme === 'geopolymer' && cat === 'ggbs') label = "Slag Binder";
      else if (activeTheme === 'geopolymer' && cat === 'metakaolin') label = "Metakaolin Binder";

      const selectId = "select_" + (activeTheme === 'normal' ? 'n_' : 'gp_') + cat;
      createSelector(container, label, selectId, "binders", b.id, details.sgId, details.econKey);
    }
  });

  if (activeTheme === 'normal') {
    createSelector(container, "Fine Aggregate", "select_fa", "fine_aggregates", "River Sand", "sg_fa", "fa");
    createSelector(container, "Coarse Aggregate", "select_ca", "coarse_aggregates", "20 mm", "sg_ca", "ca");
    createSelector(container, "Chemical Admixture", "select_adm", "admixtures", "Superplasticizer", "sg_admixture", "admixture");
  } else {
    createSelector(container, "Silicate Solution", "select_gp_ss", "silicates", "Sodium Silicate", "sg_ss", "sodium_silicate");
    createSelector(container, "Hydroxide Solution", "select_gp_sh", "activators", "NaOH", "sg_sh", "sodium_hydroxide");
    createSelector(container, "Coarse Aggregate", "select_ca", "coarse_aggregates", "20 mm", "sg_ca", "ca");
    createSelector(container, "Fine Aggregate", "select_fa", "fine_aggregates", "M Sand Zone II", "sg_fa", "fa");
  }
}

function adjustBinders(changedId) {
  runCalculations();
}

function updateBinderSum(mode) {
  const total = activeBinders.reduce((sum, b) => sum + b.pct, 0);
  const elId = mode === 'normal' ? 'binder-sum-normal' : 'binder-sum-geo';
  const el = document.getElementById(elId);
  if (el) {
    el.innerText = `Total: ${total.toFixed(0)}%`;
    el.className = Math.abs(total - 100) < 0.01 ? 'binder-sum-ok' : 'binder-sum-error';
  }
}

// Create individual drop-down with SG override input & economics
function createSelector(parent, label, selectId, category, defaultVal, targetInputId, econKey) {
  const div = document.createElement("div");
  div.className = "flex flex-col mb-sm pb-sm";
  div.style.borderBottom = "1px solid rgba(255, 255, 255, 0.04)";

  const row1 = document.createElement("div");
  row1.className = "flex justify-between items-center mb-xs";
  
  const labelEl = document.createElement("span");
  labelEl.className = "body-xs text-dim";
  labelEl.innerText = label;
  
  const select = document.createElement("select");
  select.id = selectId;
  select.style.padding = "4px 8px";
  select.style.width = "180px";
  
  const items = materialsDb[category] || {};
  const targetCategory = BINDER_MAPPING[defaultVal];
  for (let key in items) {
    if (category === "binders" && BINDER_MAPPING[key] !== targetCategory) {
      continue;
    }
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerText = key;
    if (key === defaultVal) opt.selected = true;
    select.appendChild(opt);
  }
  
  row1.appendChild(labelEl);
  row1.appendChild(select);
  div.appendChild(row1);

  const row2 = document.createElement("div");
  row2.className = "grid grid-cols-3 gap-xs";

  const initialSg = items[defaultVal] ? items[defaultVal].sg : 1.0;
  const sgCol = createInputCol("SG", targetInputId, initialSg, "0.01");
  
  const initialCost = defaultEcon[defaultVal] ? defaultEcon[defaultVal].cost : 1.0;
  const costCol = createInputCol("₹/kg", `cost_${econKey}`, initialCost, "0.1");

  const initialCo2 = defaultEcon[defaultVal] ? defaultEcon[defaultVal].co2 : 0.0;
  const co2Col = createInputCol("CO₂/kg", `co2_${econKey}`, initialCo2, "0.001");

  row2.appendChild(sgCol);
  row2.appendChild(costCol);
  row2.appendChild(co2Col);
  div.appendChild(row2);

  select.onchange = () => {
    const val = select.value;
    const itemSg = items[val] ? items[val].sg : 1.0;
    const itemCost = defaultEcon[val] ? defaultEcon[val].cost : 1.0;
    const itemCo2 = defaultEcon[val] ? defaultEcon[val].co2 : 0.0;

    const sgInput = document.getElementById(targetInputId);
    if (sgInput) sgInput.value = itemSg;
    const costInput = document.getElementById(`cost_${econKey}`);
    if (costInput) costInput.value = itemCost;
    const co2Input = document.getElementById(`co2_${econKey}`);
    if (co2Input) co2Input.value = itemCo2;

    if (category === "binders") {
      const idx = activeBinders.findIndex(b => BINDER_MAPPING[b.id] === econKey);
      if (idx !== -1) {
        activeBinders[idx].id = val;
        renderBinderCards();
      }
    }
    runCalculations();
  };

  parent.appendChild(div);
}

function createInputCol(label, inputId, value, step) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-xs";
  
  const lbl = document.createElement("span");
  lbl.className = "body-xs text-dim";
  lbl.style.fontSize = "9px";
  lbl.innerText = label + ":";
  
  const input = document.createElement("input");
  input.type = "number";
  input.id = inputId;
  input.value = value;
  input.step = step;
  input.style.padding = "2px 6px";
  input.style.fontSize = "11px";
  input.style.textAlign = "right";
  input.oninput = () => runCalculations();

  wrapper.appendChild(lbl);
  wrapper.appendChild(input);
  return wrapper;
}

// Perform Fine Aggregate Sieve Grading Classifier
function setSieveFromZone() {
  const zone = document.getElementById("fa_zone").value;
  const vals = {
    'I': { s475: 95, s236: 80, s118: 60, s600: 25, s300: 10, s150: 5 },
    'II': { s475: 95, s236: 85, s118: 70, s600: 45, s300: 15, s150: 5 },
    'III': { s475: 95, s236: 90, s118: 90, s600: 70, s300: 20, s150: 5 },
    'IV': { s475: 95, s236: 97, s118: 95, s600: 90, s300: 30, s150: 7 }
  };
  if (vals[zone]) {
    document.getElementById("s_475").value = vals[zone].s475;
    document.getElementById("s_236").value = vals[zone].s236;
    document.getElementById("s_118").value = vals[zone].s118;
    document.getElementById("s_600").value = vals[zone].s600;
    document.getElementById("s_300").value = vals[zone].s300;
    document.getElementById("s_150").value = vals[zone].s150;
    runSieveAnalysis();
  }
}

function runSieveAnalysis() {
  const s475 = parseFloat(document.getElementById("s_475").value) || 0;
  const s236 = parseFloat(document.getElementById("s_236").value) || 0;
  const s118 = parseFloat(document.getElementById("s_118").value) || 0;
  const s600 = parseFloat(document.getElementById("s_600").value) || 0;
  const s300 = parseFloat(document.getElementById("s_300").value) || 0;
  const s150 = parseFloat(document.getElementById("s_150").value) || 0;

  let zone = "Zone II";
  if (s600 >= 15 && s600 <= 34) zone = "Zone I";
  else if (s600 >= 35 && s600 <= 59) zone = "Zone II";
  else if (s600 >= 60 && s600 <= 79) zone = "Zone III";
  else if (s600 >= 80 && s600 <= 100) zone = "Zone IV";

  document.getElementById("sieve-zone-badge").innerText = zone;

  if (document.getElementById("link-zone").checked && activeTheme === 'normal') {
    const zoneSelect = document.getElementById("fa_zone");
    if (zoneSelect) {
      zoneSelect.value = zone.replace("Zone ", "");
    }
  }

  runCalculations();
}

// Master calculation runner
async function runCalculations() {
  const payload = {
    mix_type: activeTheme,
    inputs: {},
    economics: {}
  };

  payload.platform_mode = platformMode;

  // Common moisture inputs
  payload.inputs.wa_ca = parseFloat(document.getElementById("wa_ca").value) || 0;
  payload.inputs.fm_ca = parseFloat(document.getElementById("fm_ca").value) || 0;
  payload.inputs.wa_fa = parseFloat(document.getElementById("wa_fa").value) || 0;
  payload.inputs.fm_fa = parseFloat(document.getElementById("fm_fa").value) || 0;

  const loadEconOverride = (key, defaultName) => {
    const elCost = document.getElementById(`cost_${key}`);
    const elCo2 = document.getElementById(`co2_${key}`);
    if (elCost && elCo2) {
      return {
        cost: parseFloat(elCost.value) || 0,
        co2: parseFloat(elCo2.value) || 0
      };
    }
    let name = defaultName;
    if (key === "cement" || key === "fly_ash" || key === "ggbs" || key === "silica_fume" || key === "metakaolin" || key === "rice_husk_ash") {
      const active = activeBinders.find(b => BINDER_MAPPING[b.id] === key);
      if (active) name = active.id;
    }
    return {
      cost: defaultEcon[name] ? defaultEcon[name].cost : 0,
      co2: defaultEcon[name] ? defaultEcon[name].co2 : 0
    };
  };

  let cement_percent = 0;
  let fly_ash_percent = 0;
  let ggbs_percent = 0;
  let silica_fume_percent = 0;
  let metakaolin_percent = 0;
  let rice_husk_ash_percent = 0;

  activeBinders.forEach(b => {
    const cat = BINDER_MAPPING[b.id];
    if (cat === "cement") cement_percent = b.pct;
    else if (cat === "fly_ash") fly_ash_percent = b.pct;
    else if (cat === "ggbs") ggbs_percent = b.pct;
    else if (cat === "silica_fume") silica_fume_percent = b.pct;
    else if (cat === "metakaolin") metakaolin_percent = b.pct;
    else if (cat === "rice_husk_ash") rice_husk_ash_percent = b.pct;
  });

  if (activeTheme === 'normal') {
    const otherSum = fly_ash_percent + ggbs_percent + silica_fume_percent + metakaolin_percent;
    const cementIndex = activeBinders.findIndex(b => BINDER_MAPPING[b.id] === 'cement');
    if (cementIndex !== -1) {
      cement_percent = Math.max(0, 100 - otherSum);
      activeBinders[cementIndex].pct = cement_percent;
      const containerId = 'binder-inputs-container-normal';
      const container = document.getElementById(containerId);
      if (container) {
        const cementInput = container.querySelector(`[data-binder-id="${activeBinders[cementIndex].id}"]`);
        if (cementInput) cementInput.value = cement_percent;
      }
    } else {
      cement_percent = 0;
    }
  }

  const getSg = (cat, defaultSg) => {
    const active = activeBinders.find(b => BINDER_MAPPING[b.id] === cat);
    if (active) {
      const el = document.getElementById(BINDER_DETAILS[cat].sgId);
      if (el) return parseFloat(el.value) || defaultSg;
      return materialsDb.binders && materialsDb.binders[active.id] ? materialsDb.binders[active.id].sg : defaultSg;
    }
    return defaultSg;
  };

  if (activeTheme === 'normal') {
    payload.inputs.grade = parseFloat(document.getElementById("grade").value) || 30;
    payload.inputs.exposure = document.getElementById("exposure").value || "severe";
    payload.inputs.msa = parseInt(document.getElementById("msa").value) || 20;
    payload.inputs.fa_zone = document.getElementById("fa_zone").value || "II";
    payload.inputs.slump = parseFloat(document.getElementById("slump").value) || 100;
    payload.inputs.agg_shape = document.getElementById("agg_shape").value || "angular";
    payload.inputs.wc_ratio = parseFloat(document.getElementById("wc_ratio").value) || 0.45;
    payload.inputs.sp_dosage = parseFloat(document.getElementById("sp_dosage").value) || 1.0;
    payload.inputs.sp_percent = parseFloat(document.getElementById("sp_percent").value) || 0;
    payload.inputs.is_pumped = document.getElementById("is_pumped").checked;

    payload.inputs.fly_ash_percent = fly_ash_percent;
    payload.inputs.ggbs_percent = ggbs_percent;
    payload.inputs.silica_fume_percent = silica_fume_percent;
    payload.inputs.metakaolin_percent = metakaolin_percent;
    payload.inputs.cement_percent = cement_percent;

    payload.inputs.sg_cement = getSg("cement", 3.15);
    payload.inputs.sg_fly_ash = getSg("fly_ash", 2.20);
    payload.inputs.sg_ggbs = getSg("ggbs", 2.90);
    payload.inputs.sg_silica_fume = getSg("silica_fume", 2.20);
    payload.inputs.sg_metakaolin = getSg("metakaolin", 2.60);

    payload.inputs.sg_ca = parseFloat(document.getElementById("sg_ca")?.value) || 2.74;
    payload.inputs.sg_fa = parseFloat(document.getElementById("sg_fa")?.value) || 2.65;
    payload.inputs.sg_admixture = parseFloat(document.getElementById("sg_admixture")?.value) || 1.145;

    payload.inputs.economics = {
      cement: loadEconOverride("cement", "OPC 53"),
      fly_ash: loadEconOverride("fly_ash", "Fly Ash Class F"),
      ggbs: loadEconOverride("ggbs", "GGBS"),
      silica_fume: loadEconOverride("silica_fume", "Silica Fume"),
      metakaolin: loadEconOverride("metakaolin", "Metakaolin"),
      water: { cost: 0.05, co2: 0.0001 },
      ca: loadEconOverride("ca", document.getElementById("select_ca")?.value || "20 mm"),
      fa: loadEconOverride("fa", document.getElementById("select_fa")?.value || "River Sand"),
      admixture: loadEconOverride("admixture", document.getElementById("select_adm")?.value || "Superplasticizer")
    };

    updateBinderSum('normal');

  } else {
    payload.inputs.density = parseFloat(document.getElementById("density").value) || 2520;
    payload.inputs.ca_percent = parseFloat(document.getElementById("ca_percent").value) || 65;
    payload.inputs.fa_percent = 100 - payload.inputs.ca_percent;
    payload.inputs.aas_binder_ratio = parseFloat(document.getElementById("aas_binder_ratio").value) || 0.45;
    payload.inputs.ss_sh_ratio = parseFloat(document.getElementById("ss_sh_ratio").value) || 2.5;
    payload.inputs.naoh_molarity = document.getElementById("naoh_molarity").value || "12M";
    payload.inputs.extra_water = parseFloat(document.getElementById("extra_water").value) || 0;

    payload.inputs.fly_ash_percent = fly_ash_percent;
    payload.inputs.ggbs_percent = ggbs_percent;
    payload.inputs.metakaolin_percent = metakaolin_percent;
    payload.inputs.rice_husk_ash_percent = rice_husk_ash_percent;
    payload.inputs.silica_fume_percent = silica_fume_percent;

    payload.inputs.sg_fly_ash = getSg("fly_ash", 2.20);
    payload.inputs.sg_ggbs = getSg("ggbs", 2.90);
    payload.inputs.sg_metakaolin = getSg("metakaolin", 2.60);
    payload.inputs.sg_rice_husk_ash = getSg("rice_husk_ash", 2.10);
    payload.inputs.sg_silica_fume = getSg("silica_fume", 2.20);

    payload.inputs.sg_ca = parseFloat(document.getElementById("sg_ca")?.value) || 2.74;
    payload.inputs.sg_fa = parseFloat(document.getElementById("sg_fa")?.value) || 2.65;
    payload.inputs.sg_ss = parseFloat(document.getElementById("sg_ss")?.value) || 1.60;
    payload.inputs.sg_sh = parseFloat(document.getElementById("sg_sh")?.value) || 1.50;

    payload.inputs.economics = {
      fly_ash: loadEconOverride("fly_ash", "Fly Ash Class F"),
      ggbs: loadEconOverride("ggbs", "GGBS"),
      metakaolin: loadEconOverride("metakaolin", "Metakaolin"),
      rice_husk_ash: loadEconOverride("rice_husk_ash", "Rice Husk Ash"),
      silica_fume: loadEconOverride("silica_fume", "Silica Fume"),
      sodium_silicate: loadEconOverride("sodium_silicate", document.getElementById("select_gp_ss")?.value || "Sodium Silicate"),
      sodium_hydroxide: loadEconOverride("sodium_hydroxide", document.getElementById("select_gp_sh")?.value || "NaOH"),
      ca: loadEconOverride("ca", document.getElementById("select_ca")?.value || "20 mm"),
      fa: loadEconOverride("fa", document.getElementById("select_fa")?.value || "M Sand Zone II"),
      water: { cost: 0.05, co2: 0.0001 }
    };

    updateBinderSum('geopolymer');
  }

  try {
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      calculationData = data;
      
      if (activeTheme === 'normal') {
        lastNormalResults = data;
      } else {
        lastGeopolymerResults = data;
      }
      
      renderOutputs(data);
    }
  } catch (err) {
    console.error("Calculation Error:", err);
  }
}

// Render dynamic elements
function renderOutputs(data) {
  document.getElementById("mix-id").innerText = data.trace_id;
  document.getElementById("timestamp").innerText = `Calculated: ${data.timestamp}`;

  const results = data.results;
  const validation = data.validation;

  // 1. Checklist
  document.getElementById("val-score").innerText = validation.score;
  const checklistBox = document.getElementById("checklist-items");
  checklistBox.innerHTML = "";
  for (let key in validation.checklist) {
    const item = validation.checklist[key];
    const itemDiv = document.createElement("div");
    itemDiv.className = `checklist-item ${item.status ? 'pass' : 'fail'}`;
    itemDiv.innerHTML = `<span class="checklist-icon">${item.status ? "✓" : "❌"}</span><span class="body-xs">${formatChecklistLabel(key)}: ${item.message}</span>`;
    checklistBox.appendChild(itemDiv);
  }

  // 2. Volume Balance Tag
  const balTag = document.getElementById("vol-balanced-tag");
  const volBalanced = validation.checklist.volume_balanced.status;
  balTag.className = volBalanced ? "badge badge-success" : "badge badge-error";
  balTag.innerText = volBalanced ? "Volume Balanced" : "Volume Imbalance";

  // 3. Assumptions Log
  const assumptionsBox = document.getElementById("assumptions-log");
  assumptionsBox.innerHTML = "";
  renderAssumptions(assumptionsBox, data.inputs);

  // 4. Yield Proportions Table
  renderProportionsTable(results);

  // 5. Update Donut Chart
  updateChart(results);

  // 6. Step-by-Step Calculation Trail
  renderCalculationTrail(results);

  // 7. Render validation evidence board actuals & deviations
  renderValidationEvidence(results);

  // 8. Render Sustainability parameters (Total Cost & Carbon)
  renderSustainability(results);

  // 9. Update Mix Comparison Grid
  renderMixComparison();

  // 10. Render AI Reviewer
  if (data.review) {
    renderReviewer(data.review);
  }
}

function formatChecklistLabel(key) {
  const labels = {
    volume_balanced: "Volume Balance",
    material_data_complete: "Material Data",
    is_10262_compliant: "IS 10262 Guidelines",
    is_456_compliant: "IS 456 Durability",
    cement_limit_satisfied: "Cement content cap",
    aggregate_ratios_valid: "Aggregate & Binder ratios"
  };
  return labels[key] || key;
}

function renderAssumptions(container, inputs) {
  const addAssump = (name, val) => {
    const div = document.createElement("div");
    div.className = "assumption-item";
    div.innerHTML = `<span class="text-dim">${name}</span><span>${val}</span>`;
    container.appendChild(div);
  };

  if (activeTheme === 'normal') {
    addAssump("Standard Referenced", "IS 10262:2019 / IS 456:2000");
    addAssump("Aggregate Shape", document.getElementById("agg_shape").value);
    addAssump("Target Slump", `${inputs.slump} mm`);
    addAssump("Exposure Condition", inputs.exposure.toUpperCase());
    addAssump("Target W/C Ratio", inputs.wc_ratio);
  } else {
    addAssump("Standard Referenced", "Pavithra et al. (2016) Model");
    addAssump("Design Target Density", `${inputs.density} kg/m³`);
    addAssump("AAS / Binder Ratio", inputs.aas_binder_ratio);
    addAssump("SS / SH Solution Ratio", inputs.ss_sh_ratio);
    addAssump("NaOH Solution Concentration", inputs.naoh_molarity);
  }
}

// Render Proportions Table (SSD, Site, and scaled Batch weights)
function renderProportionsTable(results) {
  const tbody = document.getElementById("yield-tbody");
  tbody.innerHTML = "";

  const scaleMode = document.getElementById("scale-mode").value;
  const scaleVal = parseFloat(document.getElementById("scale-value").value) || 1.0;
  
  let scaleFactor = 1.0;
  if (scaleMode === 'vol') {
    scaleFactor = scaleVal;
    document.getElementById("batch-header-lbl").innerText = `Scaled Batch (${scaleVal.toFixed(2)} m³)`;
  } else {
    // Bag-Based Cement scaling
    const targetBinder = 50.0 * scaleVal;
    const actualBinder = activeTheme === 'normal' ? results.mass_cement_ssd.value : results.total_binder_mass.value;
    scaleFactor = targetBinder / actualBinder;
    document.getElementById("batch-header-lbl").innerText = `Scaled Batch (${scaleVal.toFixed(0)} Bag${scaleVal > 1 ? 's' : ''})`;
  }

  const renderRow = (material, ssdKey, siteKey) => {
    if (!results[ssdKey]) return;
    const ssdVal = results[ssdKey].value;
    const siteVal = results[siteKey] ? results[siteKey].value : ssdVal;
    const batchVal = siteVal * scaleFactor;
    const ref = results[ssdKey].source + " (" + results[ssdKey].revision + ")";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:left; font-weight:600">${material}</td>
      <td class="data-tabular">${ssdVal.toFixed(1)}</td>
      <td class="data-tabular">${siteVal.toFixed(1)}</td>
      <td class="data-tabular text-accent" style="font-weight:700">${batchVal.toFixed(1)}</td>
      <td class="text-dim body-xs" style="font-size:10px">${ref}</td>
    `;
    tbody.appendChild(tr);
  };

  if (activeTheme === 'normal') {
    renderRow("Base Cement", "mass_cement_ssd", "mass_cement_ssd");
    if (results.mass_fly_ash_ssd && results.mass_fly_ash_ssd.value > 0) renderRow("Fly Ash Blend", "mass_fly_ash_ssd", "mass_fly_ash_ssd");
    if (results.mass_ggbs_ssd && results.mass_ggbs_ssd.value > 0) renderRow("GGBS Blend", "mass_ggbs_ssd", "mass_ggbs_ssd");
    if (results.mass_silica_fume_ssd && results.mass_silica_fume_ssd.value > 0) renderRow("Silica Fume Blend", "mass_silica_fume_ssd", "mass_silica_fume_ssd");
    if (results.mass_metakaolin_ssd && results.mass_metakaolin_ssd.value > 0) renderRow("Metakaolin Blend", "mass_metakaolin_ssd", "mass_metakaolin_ssd");
    renderRow("Water", "mass_water_ssd", "mass_water_site");
    renderRow("Coarse Aggregate", "mass_ca_ssd", "mass_ca_site");
    renderRow("Fine Aggregate", "mass_fa_ssd", "mass_fa_site");
    renderRow("Chemical Admixture", "mass_admixture_ssd", "mass_admixture_ssd");
  } else {
    if (results.mass_fly_ash && results.mass_fly_ash.value > 0) renderRow("Fly Ash", "mass_fly_ash", "mass_fly_ash");
    if (results.mass_ggbs && results.mass_ggbs.value > 0) renderRow("GGBS", "mass_ggbs", "mass_ggbs");
    if (results.mass_metakaolin && results.mass_metakaolin.value > 0) renderRow("Metakaolin", "mass_metakaolin", "mass_metakaolin");
    if (results.mass_rice_husk_ash && results.mass_rice_husk_ash.value > 0) renderRow("Rice Husk Ash", "mass_rice_husk_ash", "mass_rice_husk_ash");
    if (results.mass_silica_fume && results.mass_silica_fume.value > 0) renderRow("Silica Fume", "mass_silica_fume", "mass_silica_fume");
    
    renderRow("Sodium Silicate Solution", "mass_ss_solution", "mass_ss_solution");
    renderRow("Sodium Hydroxide Solution", "mass_sh_solution", "mass_aas_site");
    renderRow("Coarse Aggregate", "mass_ca_ssd", "mass_ca_site");
    renderRow("Fine Aggregate", "mass_fa_ssd", "mass_fa_site");
  }
}

// Render Validation Evidence
function renderValidationEvidence(results) {
  const updateBenchmark = (actId, devId, actualVal, expectedVal) => {
    const actEl = document.getElementById(actId);
    const devEl = document.getElementById(devId);
    if (!actEl || !devEl) return;

    actEl.innerText = actualVal.toFixed(1);
    const deviation = Math.abs(actualVal - expectedVal) / expectedVal * 100;
    devEl.innerText = deviation.toFixed(2) + "%";
  };

  if (activeTheme === 'normal') {
    // Expected plain cement content benchmark checks
    const cement = results.mass_cement_ssd.value;
    const water = results.mass_water_ssd.value;
    updateBenchmark("val-c30-act", "val-c30-dev", cement, 350.0);
    updateBenchmark("val-c40-act", "val-c40-dev", water, 148.0);
  } else {
    const binder = results.total_binder_mass.value;
    updateBenchmark("val-geo-act", "val-geo-dev", binder, 347.6);
  }
}

// Render Sustainability parameters
function renderSustainability(results) {
  const econ = results.economics;
  if (!econ) return;

  document.getElementById("total-cost-val").innerText = `₹ ${econ.total_cost.value.toFixed(2)}`;
  document.getElementById("total-co2-val").innerText = `${econ.total_co2.value.toFixed(0)} kg`;

  const container = document.getElementById("co2-progress-bars");
  container.innerHTML = "";

  const breakdown = econ.breakdown.co2;
  const total = econ.total_co2.value;

  for (let key in breakdown) {
    const val = breakdown[key];
    if (val <= 0) continue; // Skip displaying zero-emission components
    
    const pct = total > 0 ? (val / total * 100) : 0;
    
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col gap-xs";
    wrapper.style.margin = "4px 0";

    const labelRow = document.createElement("div");
    labelRow.className = "flex justify-between body-xs text-dim";
    labelRow.innerHTML = `<span>${key.toUpperCase().replace("_", " ")}</span><span>${pct.toFixed(0)}%</span>`;

    const progressBg = document.createElement("div");
    progressBg.className = "progress-bar-container";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-bar-fill";
    progressFill.style.width = `${pct}%`;

    progressBg.appendChild(progressFill);
    wrapper.appendChild(labelRow);
    wrapper.appendChild(progressBg);
    container.appendChild(wrapper);
  }
}

// Side-by-Side Mix Comparison Grid
function renderMixComparison() {
  const setCell = (id, val, suffix = "") => {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== null && val !== undefined ? `${val}${suffix}` : "--";
  };
  const setDelta = (id, a, b) => {
    const el = document.getElementById(id);
    if (!el || a == null || b == null || a === 0) { if(el) el.innerText = "--"; return; }
    const delta = ((b - a) / a * 100).toFixed(1);
    el.innerText = delta > 0 ? `+${delta}%` : `${delta}%`;
  };

  const nr = lastNormalResults?.results;
  const ni = lastNormalResults?.inputs;
  const gr = lastGeopolymerResults?.results;
  const gi = lastGeopolymerResults?.inputs;

  const nCost = nr?.economics?.total_cost?.value;
  const gCost = gr?.economics?.total_cost?.value;
  setCell("comp-cost-conv", nCost ? nCost.toFixed(1) : null, " ₹");
  setCell("comp-cost-geo", gCost ? gCost.toFixed(1) : null, " ₹");
  setDelta("comp-cost-delta", nCost, gCost);

  const nCo2 = nr?.economics?.total_co2?.value;
  const gCo2 = gr?.economics?.total_co2?.value;
  setCell("comp-co2-conv", nCo2 ? nCo2.toFixed(0) : null, " kg");
  setCell("comp-co2-geo", gCo2 ? gCo2.toFixed(0) : null, " kg");
  setDelta("comp-co2-delta", nCo2, gCo2);

  const nBinder = nr?.cement_content?.value;
  const gBinder = gr?.total_binder_mass?.value;
  setCell("comp-binder-conv", nBinder ? nBinder.toFixed(1) : null, " kg");
  setCell("comp-binder-geo", gBinder ? gBinder.toFixed(1) : null, " kg");
  setDelta("comp-binder-delta", nBinder, gBinder);

  const nWater = nr?.mass_water_ssd?.value;
  const gWater = gr?.water_total?.value;
  setCell("comp-water-conv", nWater ? nWater.toFixed(1) : null, " kg");
  setCell("comp-water-geo", gWater ? gWater.toFixed(1) : null, " kg");
  setDelta("comp-water-delta", nWater, gWater);

  const nOpc = ni ? (100 - (parseFloat(ni.fly_ash_percent)||0) - (parseFloat(ni.ggbs_percent)||0) - (parseFloat(ni.silica_fume_percent)||0) - (parseFloat(ni.metakaolin_percent)||0)) : null;
  setCell("comp-opc-conv", nOpc !== null ? nOpc.toFixed(0) : null, "%");
  setCell("comp-opc-geo", "N/A");
  setCell("comp-opc-delta", "--");

  setCell("comp-fa-conv", ni ? (parseFloat(ni.fly_ash_percent)||0).toFixed(0) : null, "%");
  setCell("comp-fa-geo", gi ? (parseFloat(gi.fly_ash_percent)||0).toFixed(0) : null, "%");
  setCell("comp-fa-delta", "--");

  setCell("comp-ggbs-conv", ni ? (parseFloat(ni.ggbs_percent)||0).toFixed(0) : null, "%");
  setCell("comp-ggbs-geo", gi ? (parseFloat(gi.ggbs_percent)||0).toFixed(0) : null, "%");
  setCell("comp-ggbs-delta", "--");

  const nWc = ni?.wc_ratio;
  setCell("comp-wc-conv", nWc ? parseFloat(nWc).toFixed(2) : null);
  setCell("comp-wc-geo", "N/A");
  setCell("comp-wc-delta", "--");

  const nSlump = ni?.slump;
  setCell("comp-slump-conv", nSlump ? parseFloat(nSlump).toFixed(0) : null);
  setCell("comp-slump-geo", "N/A");
  setCell("comp-slump-delta", "--");

  setCell("comp-density-conv", 2400);
  setCell("comp-density-geo", gi?.density);
  setDelta("comp-density-delta", 2400, gi?.density);
}

// Update composition chart
function updateChart(results) {
  const ctx = document.getElementById("compositionChart").getContext("2d");
  
  let labels = [];
  let values = [];
  let colors = [];

  const accentColor = activeTheme === 'normal' ? '#64748b' : '#10b981';

  if (activeTheme === 'normal') {
    const cementVol = (results.mass_cement_ssd.value / (parseFloat(document.getElementById("sg_cement")?.value || 3.15) * 1000)).toFixed(3);
    const faVol = (results.mass_fly_ash_ssd.value / (parseFloat(document.getElementById("sg_fly_ash")?.value || 2.2) * 1000)).toFixed(3);
    const ggbsVol = (results.mass_ggbs_ssd.value / (parseFloat(document.getElementById("sg_ggbs")?.value || 2.9) * 1000)).toFixed(3);
    const sfVol = (results.mass_silica_fume_ssd.value / (parseFloat(document.getElementById("sg_silica_fume")?.value || 2.2) * 1000)).toFixed(3);
    const mkVol = (results.mass_metakaolin_ssd.value / (parseFloat(document.getElementById("sg_metakaolin")?.value || 2.6) * 1000)).toFixed(3);
    const waterVol = (results.mass_water_ssd.value / 1000).toFixed(3);
    const caVol = (results.mass_ca_ssd.value / (parseFloat(document.getElementById("sg_ca")?.value || 2.74) * 1000)).toFixed(3);
    const faAggVol = (results.mass_fa_ssd.value / (parseFloat(document.getElementById("sg_fa")?.value || 2.65) * 1000)).toFixed(3);
    
    labels = ["OPC/PPC/PSC"];
    values = [cementVol];
    colors = [accentColor];

    if (parseFloat(faVol) > 0) { labels.push("Fly Ash"); values.push(faVol); colors.push("#a78bfa"); }
    if (parseFloat(ggbsVol) > 0) { labels.push("GGBS"); values.push(ggbsVol); colors.push("#34d399"); }
    if (parseFloat(sfVol) > 0) { labels.push("Silica Fume"); values.push(sfVol); colors.push("#fb7185"); }
    if (parseFloat(mkVol) > 0) { labels.push("Metakaolin"); values.push(mkVol); colors.push("#f59e0b"); }
    
    labels.push("Water", "Coarse Agg", "Fine Agg");
    values.push(waterVol, caVol, faAggVol);
    colors.push("#38bdf8", "#475569", "#1e293b");
  } else {
    const bindersVol = (
      (results.mass_fly_ash.value / (parseFloat(document.getElementById("sg_fly_ash")?.value || 2.2) * 1000)) + 
      (results.mass_ggbs.value / (parseFloat(document.getElementById("sg_ggbs")?.value || 2.9) * 1000)) +
      (results.mass_metakaolin.value / (parseFloat(document.getElementById("sg_metakaolin")?.value || 2.6) * 1000)) +
      (results.mass_rice_husk_ash.value / (parseFloat(document.getElementById("sg_rice_husk_ash")?.value || 2.1) * 1000)) +
      (results.mass_silica_fume.value / (parseFloat(document.getElementById("sg_silica_fume")?.value || 2.2) * 1000))
    ).toFixed(3);
    
    const ssVol = (results.mass_ss_solution.value / (parseFloat(document.getElementById("sg_ss")?.value || 1.60) * 1000)).toFixed(3);
    const shVol = (results.mass_sh_solution.value / (parseFloat(document.getElementById("sg_sh")?.value || 1.50) * 1000)).toFixed(3);
    const caVol = (results.mass_ca_ssd.value / (parseFloat(document.getElementById("sg_ca")?.value || 2.74) * 1000)).toFixed(3);
    const faVol = (results.mass_fa_ssd.value / (parseFloat(document.getElementById("sg_fa")?.value || 2.65) * 1000)).toFixed(3);

    labels = ["Binders", "Sodium Silicate", "Sodium Hydroxide", "Coarse Agg", "Fine Agg"];
    values = [bindersVol, ssVol, shVol, caVol, faVol];
    colors = [accentColor, "#34d399", "#047857", "#064e3b", "#022c22"];
  }

  if (compositionChart) {
    compositionChart.destroy();
  }

  compositionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      cutout: '65%'
    }
  });
}

function renderCalculationTrail(results) {
  const container = document.getElementById("calculation-trail");
  container.innerHTML = "";

  const addStep = (title, equation, resultVal) => {
    const div = document.createElement("div");
    div.className = "trail-step";
    div.innerHTML = `
      <h5>${title}</h5>
      <p class="trail-formula">${equation}</p>
      <p>Result: <strong>${resultVal}</strong></p>
    `;
    container.appendChild(div);
  };

  if (activeTheme === 'normal') {
    addStep(
      "Step 1: Target Mean Compressive Strength (f'ck)",
      `f'_{ck} = \\max(f_{ck} + 1.65S, f_{ck} + X)`,
      `${results.target_strength.value.toFixed(2)} MPa (${results.target_strength.source})`
    );
    addStep(
      "Step 2: Base Water Content Formulation",
      `W_{base} = Table lookup by MSA`,
      `${results.base_water.value} kg (${results.base_water.source})`
    );
    addStep(
      "Step 3: Adjusted Water Content (W_final)",
      `W_{final} = [W_{base} + Slump\\_Adj + Shape\\_Adj] \\times (1 - SP\\%/100)`,
      `${results.water_content.value.toFixed(1)} kg (${results.water_content.source})`
    );
    addStep(
      "Step 4: Cement Content (C)",
      `C = W_{final} / Target\\ W/C`,
      `${results.cement_content.value.toFixed(1)} kg/m³`
    );
    addStep(
      "Step 5: Coarse Aggregate Volume Ratio (V_ca)",
      `V_{ca} = V_{ca\\_base} + ((0.50 - W/C)/0.05) \\times 0.01`,
      `${results.coarse_agg_ratio.value.toFixed(3)}`
    );
    addStep(
      "Step 6: Absolute Volume Yield Verification",
      `V_{agg} = 1 - (V_{air} + V_{binders} + V_w + V_{adm})`,
      `${results.volume_all_aggregates.value.toFixed(3)} m³ (Total volume sum: ${results.absolute_volume_total.value.toFixed(3)} m³)`
    );
  } else {
    addStep(
      "Step 1: Fixed Global Aggregate Constraints",
      `Total Aggregate Mass = Density \\times 0.80`,
      `${results.total_aggregate_mass.value.toFixed(1)} kg/m³`
    );
    addStep(
      "Step 2: Total Binder Paste Content",
      `Binder Mass = Total Paste / (1 + AAS/Binder Ratio)`,
      `${results.total_binder_mass.value.toFixed(1)} kg/m³`
    );
    addStep(
      "Step 3: Alkaline Solution Content",
      `AAS Mass = Total Paste - Binder Mass`,
      `${results.total_activator_mass.value.toFixed(1)} kg/m³`
    );
    addStep(
      "Step 4: Alkaline Solutions Partitioning",
      `NaOH Mass = AAS / (1 + ss/sh Ratio); Na2SiO3 Mass = AAS - NaOH`,
      `NaOH: ${results.mass_sh_solution.value.toFixed(1)} kg, Na2SiO3: ${results.mass_ss_solution.value.toFixed(1)} kg`
    );
    addStep(
      "Step 5: Water-to-Geopolymer Solids Ratio (W/GS)",
      `W/GS = Water_{total} / Solids_{total} (evaluated from solution solids & free water)`,
      `W/GS Ratio: ${results.w_gs_ratio.value.toFixed(3)}`
    );
  }
}

function exportCSV() {
  if (!calculationData) return;
  const results = calculationData.results;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "PRO-MIX Concrete Design Report\n";
  csvContent += `Mix Trace ID,${calculationData.trace_id}\n`;
  csvContent += `Calculated Timestamp,${calculationData.timestamp}\n`;
  csvContent += `Design Standard,${activeTheme === 'normal' ? 'IS 10262:2019' : 'Pavithra et al. (2016)'}\n\n`;
  
  csvContent += "Material,SSD Weight (kg/m3),Reference Source\n";
  for (let key in results) {
    if (key.includes("mass") && key.includes("ssd")) {
      const formattedName = key.replace("mass_", "").replace("_ssd", "").toUpperCase();
      csvContent += `${formattedName},${results[key].value.toFixed(1)},${results[key].source}\n`;
    }
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PRO-MIX_${calculationData.trace_id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDF() {
  const projectName = document.getElementById('project-name').value || 'Untitled Project';
  const engineerName = document.getElementById('engineer-name').value || 'Not specified';
  
  const element = document.getElementById("report-content");
  const opt = {
    margin:       10,
    filename:     `PRO-MIX_${projectName.replace(/\s+/g, '_')}_${calculationData ? calculationData.trace_id : 'report'}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, backgroundColor: '#0b0f19' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
}

// === AI Reviewer ===
function renderReviewer(review) {
  const container = document.getElementById('reviewer-container');
  container.innerHTML = '';
  
  const allItems = [];
  if (review.observations) {
    review.observations.forEach(obs => {
      allItems.push({type: 'observation', ...obs});
    });
  }
  if (review.recommendations) {
    review.recommendations.forEach(rec => {
      if (rec) {
        allItems.push({
          type: 'recommendation', 
          rule_id: 'RECOMMENDATION',
          recommendation: typeof rec === 'string' ? rec : rec.recommendation
        });
      }
    });
  }
  
  document.getElementById('review-count').innerText = `${review.observations ? review.observations.length : 0} Issues`;
  
  if (allItems.length === 0) {
    container.innerHTML = '<div class="text-dim body-xs" style="text-align:center; padding:20px 0">✓ No issues detected</div>';
    return;
  }
  
  allItems.forEach(item => {
    const div = document.createElement('div');
    div.className = `reviewer-item ${item.type === 'recommendation' ? 'recommendation' : ''}`;
    div.innerHTML = `
      <div class="flex items-center gap-xs">
        <span class="reviewer-rule-id">${item.rule_id}</span>
        <span class="body-xs">${item.observation || item.recommendation}</span>
      </div>
      ${item.trigger ? `<div class="reviewer-trigger">Trigger: ${item.trigger}</div>` : ''}
    `;
    container.appendChild(div);
  });
}

// === Trial Mix Lab ===
function addTrialEntry() {
  const entry = {
    id: Date.now(),
    trialNo: document.getElementById('trial-no').value || `T-${trialLogs.length + 1}`,
    slump: parseFloat(document.getElementById('trial-slump').value) || 0,
    density: parseFloat(document.getElementById('trial-density').value) || 0,
    strength7d: parseFloat(document.getElementById('trial-7d').value) || 0,
    strength28d: parseFloat(document.getElementById('trial-28d').value) || 0,
    remarks: document.getElementById('trial-remarks').value || '',
    date: new Date().toISOString().split('T')[0],
    mixRevision: getCurrentMixRevision(),
    targetStrength: calculationData ? calculationData.results.target_strength.value : 0
  };
  
  trialLogs.push(entry);
  localStorage.setItem('promix_trials', JSON.stringify(trialLogs));
  renderTrialLog();
  
  // Clear inputs
  document.getElementById('trial-no').value = '';
  document.getElementById('trial-slump').value = '';
  document.getElementById('trial-density').value = '';
  document.getElementById('trial-7d').value = '';
  document.getElementById('trial-28d').value = '';
  document.getElementById('trial-remarks').value = '';
}

function getCurrentMixRevision() {
  const grade = activeTheme === 'normal' ? `M${document.getElementById('grade').value}` : 'GEO';
  if (!mixRevisionCounter[grade]) mixRevisionCounter[grade] = 0;
  mixRevisionCounter[grade]++;
  localStorage.setItem('promix_revision_counter', JSON.stringify(mixRevisionCounter));
  return `${grade}-R${mixRevisionCounter[grade]}`;
}

function renderTrialLog() {
  const container = document.getElementById('trial-log-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (trialLogs.length === 0) {
    container.innerHTML = '<div class="text-dim body-xs" style="text-align:center; padding:10px">No trial entries yet</div>';
    return;
  }
  
  // Create table
  const table = document.createElement('table');
  table.className = 'yield-table';
  table.style.fontSize = '11px';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left">Trial</th>
        <th>Date</th>
        <th>Slump</th>
        <th>Density</th>
        <th>7d MPa</th>
        <th>28d MPa</th>
        <th>Target</th>
        <th>Status</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');
  
  trialLogs.slice().reverse().forEach(entry => {
    const deviation = entry.targetStrength > 0 ? ((entry.strength28d - entry.targetStrength) / entry.targetStrength * 100).toFixed(1) : '--';
    let status = 'FAIL';
    let badgeClass = 'trial-fail';
    if (entry.strength28d >= entry.targetStrength) {
      status = 'PASS'; badgeClass = 'trial-pass';
    } else if (entry.strength28d >= entry.targetStrength * 0.95) {
      status = 'MARGINAL'; badgeClass = 'trial-marginal';
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:left; font-weight:600">${entry.trialNo}</td>
      <td class="text-dim">${entry.date}</td>
      <td class="data-tabular">${entry.slump}</td>
      <td class="data-tabular">${entry.density}</td>
      <td class="data-tabular">${entry.strength7d}</td>
      <td class="data-tabular">${entry.strength28d}</td>
      <td class="data-tabular">${entry.targetStrength.toFixed(1)}</td>
      <td><span class="badge ${badgeClass}">${status} (${deviation}%)</span></td>
    `;
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}

function exportTrialLog() {
  if (trialLogs.length === 0) return;
  let csv = "data:text/csv;charset=utf-8,";
  csv += "Trial No,Date,Mix Revision,Slump (mm),Density (kg/m³),7-Day (MPa),28-Day (MPa),Target (MPa),Remarks\n";
  trialLogs.forEach(e => {
    csv += `${e.trialNo},${e.date},${e.mixRevision},${e.slump},${e.density},${e.strength7d},${e.strength28d},${e.targetStrength.toFixed(1)},${e.remarks}\n`;
  });
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', 'PRO-MIX_TrialLog.csv');
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

// === Optimizer ===
async function runOptimizer() {
  const objective = document.getElementById('optimize-objective').value;
  const statusEl = document.getElementById('optimizer-status');
  const resultsEl = document.getElementById('optimizer-results');
  statusEl.innerText = 'Running...';
  statusEl.className = 'badge badge-accent';
  
  let cement_percent = 0;
  let fly_ash_percent = 0;
  let ggbs_percent = 0;
  let silica_fume_percent = 0;
  let metakaolin_percent = 0;

  activeBinders.forEach(b => {
    const cat = BINDER_MAPPING[b.id];
    if (cat === "cement") cement_percent = b.pct;
    else if (cat === "fly_ash") fly_ash_percent = b.pct;
    else if (cat === "ggbs") ggbs_percent = b.pct;
    else if (cat === "silica_fume") silica_fume_percent = b.pct;
    else if (cat === "metakaolin") metakaolin_percent = b.pct;
  });

  // Build current inputs from the normal concrete form
  const inputs = {
    grade: parseFloat(document.getElementById('grade').value) || 30,
    msa: parseInt(document.getElementById('msa').value) || 20,
    slump: parseFloat(document.getElementById('slump').value) || 100,
    agg_shape: document.getElementById('agg_shape').value || 'angular',
    sp_percent: parseFloat(document.getElementById('sp_percent').value) || 0,
    sp_dosage: parseFloat(document.getElementById('sp_dosage').value) || 1.0,
    wc_ratio: parseFloat(document.getElementById('wc_ratio').value) || 0.45,
    fa_zone: document.getElementById('fa_zone').value || 'II',
    is_pumped: document.getElementById('is_pumped').checked,
    sg_cement: parseFloat(document.getElementById('sg_cement')?.value) || 3.15,
    sg_fly_ash: parseFloat(document.getElementById('sg_fly_ash')?.value) || 2.20,
    sg_ggbs: parseFloat(document.getElementById('sg_ggbs')?.value) || 2.90,
    sg_silica_fume: parseFloat(document.getElementById('sg_silica_fume')?.value) || 2.20,
    sg_metakaolin: parseFloat(document.getElementById('sg_metakaolin')?.value) || 2.60,
    sg_ca: parseFloat(document.getElementById('sg_ca')?.value) || 2.74,
    sg_fa: parseFloat(document.getElementById('sg_fa')?.value) || 2.65,
    sg_admixture: parseFloat(document.getElementById('sg_admixture')?.value) || 1.145,
    wa_ca: parseFloat(document.getElementById('wa_ca').value) || 0.5,
    fm_ca: parseFloat(document.getElementById('fm_ca').value) || 0,
    wa_fa: parseFloat(document.getElementById('wa_fa').value) || 1.0,
    fm_fa: parseFloat(document.getElementById('fm_fa').value) || 2.0,
    exposure: document.getElementById('exposure').value || 'severe',
    cement_percent: cement_percent,
    fly_ash_percent: fly_ash_percent,
    ggbs_percent: ggbs_percent,
    silica_fume_percent: silica_fume_percent,
    metakaolin_percent: metakaolin_percent
  };
  
  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, objective })
    });
    const data = await res.json();
    
    if (data.error) {
      statusEl.innerText = 'Error';
      statusEl.className = 'badge badge-error';
      resultsEl.innerHTML = `<div class="text-dim body-xs">${data.error}</div>`;
      return;
    }
    
    statusEl.innerText = `${data.candidates.length} Found`;
    statusEl.className = 'badge badge-success';
    resultsEl.innerHTML = '';
    
    data.candidates.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'optimizer-candidate flex items-center gap-md';
      div.innerHTML = `
        <span class="rank">#${i + 1}</span>
        <div class="flex-1">
          <div class="flex gap-sm body-xs" style="flex-wrap:wrap">
            <span>OPC ${c.binder_split.cement}%</span>
            ${c.binder_split.fly_ash > 0 ? `<span>FA ${c.binder_split.fly_ash}%</span>` : ''}
            ${c.binder_split.ggbs > 0 ? `<span>GGBS ${c.binder_split.ggbs}%</span>` : ''}
            ${c.binder_split.silica_fume > 0 ? `<span>SF ${c.binder_split.silica_fume}%</span>` : ''}
            ${c.binder_split.metakaolin > 0 ? `<span>MK ${c.binder_split.metakaolin}%</span>` : ''}
          </div>
          <div class="flex gap-md mt-sm body-xs text-dim">
            <span>₹${c.cost.toFixed(0)}/m³ (${c.delta_cost_pct > 0 ? '+' : ''}${c.delta_cost_pct.toFixed(1)}%)</span>
            <span>${c.co2.toFixed(0)} kg CO₂ (${c.delta_co2_pct > 0 ? '+' : ''}${c.delta_co2_pct.toFixed(1)}%)</span>
            <span>Score: ${c.score.toFixed(3)}</span>
          </div>
        </div>
      `;
      
      const useBtn = document.createElement('button');
      useBtn.className = 'btn btn-outline';
      useBtn.style.padding = '4px 10px';
      useBtn.style.fontSize = '10px';
      useBtn.style.marginLeft = 'auto';
      useBtn.innerText = 'Use';
      useBtn.onclick = () => applyOptimizerCandidate(c);
      div.appendChild(useBtn);
      
      resultsEl.appendChild(div);
    });
  } catch (err) {
    statusEl.innerText = 'Error';
    statusEl.className = 'badge badge-error';
    console.error(err);
  }
}

function applyOptimizerCandidate(c) {
  activeBinders = [];
  if (c.binder_split.cement > 0) activeBinders.push({ name: "OPC 53", pct: c.binder_split.cement });
  if (c.binder_split.fly_ash > 0) activeBinders.push({ name: "Fly Ash Class F", pct: c.binder_split.fly_ash });
  if (c.binder_split.ggbs > 0) activeBinders.push({ name: "GGBS", pct: c.binder_split.ggbs });
  if (c.binder_split.silica_fume > 0) activeBinders.push({ name: "Silica Fume", pct: c.binder_split.silica_fume });
  if (c.binder_split.metakaolin > 0) activeBinders.push({ name: "Metakaolin", pct: c.binder_split.metakaolin });
  
  renderMaterialSelectors();
  runCalculations();
}

// === Grade Recommendation ===
async function runGradeRecommendation() {
  const exposure = document.getElementById('rec-exposure').value;
  const strength = parseFloat(document.getElementById('rec-strength').value) || 30;
  
  try {
    const res = await fetch('/api/recommend-grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exposure, target_strength: strength })
    });
    const data = await res.json();
    
    document.getElementById('rec-grade').innerText = data.min_grade || '--';
    document.getElementById('rec-wc').innerText = data.max_wc || '--';
    document.getElementById('rec-binder').innerText = data.min_binder ? `${data.min_binder} kg/m³` : '--';
    document.getElementById('rec-source').innerText = data.source || '--';
  } catch (err) {
    console.error(err);
  }
}

// Attach grade recommendation listener
document.getElementById('rec-exposure')?.addEventListener('change', runGradeRecommendation);

// === Benchmark Library ===
function loadBenchmark() {
  const select = document.getElementById('benchmark-select');
  const id = select.value;
  if (!id) return;
  
  let benchmark = benchmarkLibrary.find(b => b.id === id);
  if (!benchmark) {
    const customPresets = JSON.parse(localStorage.getItem('promix_custom_presets') || '{}');
    benchmark = customPresets[id];
  }
  if (!benchmark) return;
  
  const output = document.getElementById('benchmark-output');
  output.innerHTML = '';
  
  const desc = document.createElement('div');
  desc.className = 'body-xs text-dim mb-sm';
  desc.innerText = benchmark.description;
  output.appendChild(desc);
  
  if (benchmark.expected) {
    const table = document.createElement('table');
    table.className = 'yield-table';
    table.style.fontSize = '11px';
    table.innerHTML = `<thead><tr><th style="text-align:left">Parameter</th><th>Expected (kg/m³)</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    for (const [key, val] of Object.entries(benchmark.expected)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="text-align:left">${key.charAt(0).toUpperCase() + key.slice(1)}</td><td class="data-tabular">${val}</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    output.appendChild(table);
  }
  
  // Add "Load into Calculator" button
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline w-full mt-sm';
  btn.style.fontSize = '11px';
  btn.innerText = 'Load Into Calculator';
  btn.onclick = () => loadBenchmarkIntoCalculator(benchmark);
  output.appendChild(btn);
}

function loadBenchmarkIntoCalculator(benchmark) {
  if (benchmark.type === 'normal') {
    setTheme('normal');
    const inp = benchmark.inputs;
    if (inp.grade) document.getElementById('grade').value = inp.grade;
    if (inp.msa) document.getElementById('msa').value = inp.msa;
    if (inp.slump) document.getElementById('slump').value = inp.slump;
    if (inp.wc_ratio) document.getElementById('wc_ratio').value = inp.wc_ratio;
    if (inp.agg_shape) document.getElementById('agg_shape').value = inp.agg_shape;
    if (inp.fa_zone) document.getElementById('fa_zone').value = inp.fa_zone;
    if (inp.sp_percent != null) { document.getElementById('sp_percent').value = inp.sp_percent; document.getElementById('sp-perc-val').innerText = inp.sp_percent + '%'; }
    if (inp.sp_dosage != null) document.getElementById('sp_dosage').value = inp.sp_dosage;
    document.getElementById('is_pumped').checked = !!inp.is_pumped;
    
    // Rebuild activeBinders
    activeBinders = [];
    const fa_pct = inp.fly_ash_percent || 0;
    const gg_pct = inp.ggbs_percent || 0;
    const sf_pct = inp.silica_fume_percent || 0;
    const mk_pct = inp.metakaolin_percent || 0;
    
    let cem_pct = 0;
    if (inp.cement_percent !== undefined) {
      cem_pct = inp.cement_percent || 0;
    } else {
      if (fa_pct === 0 && gg_pct === 0 && sf_pct === 0 && mk_pct === 0) {
        cem_pct = 100;
      } else {
        cem_pct = 100 - (fa_pct + gg_pct + sf_pct + mk_pct);
      }
    }

    if (cem_pct > 0) activeBinders.push({ id: "OPC 53", pct: cem_pct });
    if (fa_pct > 0) activeBinders.push({ id: "Fly Ash Class F", pct: fa_pct });
    if (gg_pct > 0) activeBinders.push({ id: "GGBS", pct: gg_pct });
    if (sf_pct > 0) activeBinders.push({ id: "Silica Fume", pct: sf_pct });
    if (mk_pct > 0) activeBinders.push({ id: "Metakaolin", pct: mk_pct });

  } else if (benchmark.type === 'geopolymer') {
    setTheme('geopolymer');
    const inp = benchmark.inputs;
    if (inp.density) document.getElementById('density').value = inp.density;
    if (inp.ca_percent) document.getElementById('ca_percent').value = inp.ca_percent;
    if (inp.fa_percent) document.getElementById('fa_percent').value = inp.fa_percent;
    if (inp.aas_binder_ratio) document.getElementById('aas_binder_ratio').value = inp.aas_binder_ratio;
    if (inp.ss_sh_ratio) document.getElementById('ss_sh_ratio').value = inp.ss_sh_ratio;
    if (inp.naoh_molarity) document.getElementById('naoh_molarity').value = inp.naoh_molarity;
    if (inp.extra_water != null) document.getElementById('extra_water').value = inp.extra_water;

    // Rebuild activeBinders
    activeBinders = [];
    const fa_pct = inp.fly_ash_percent || 0;
    const gg_pct = inp.ggbs_percent || 0;
    const mk_pct = inp.metakaolin_percent || 0;
    const rha_pct = inp.rice_husk_ash_percent || 0;
    const sf_pct = inp.silica_fume_percent || 0;

    if (fa_pct > 0) activeBinders.push({ id: "Fly Ash Class F", pct: fa_pct });
    if (gg_pct > 0) activeBinders.push({ id: "GGBS", pct: gg_pct });
    if (mk_pct > 0) activeBinders.push({ id: "Metakaolin", pct: mk_pct });
    if (rha_pct > 0) activeBinders.push({ id: "Rice Husk Ash", pct: rha_pct });
    if (sf_pct > 0) activeBinders.push({ id: "Silica Fume", pct: sf_pct });
  }

  renderBinderCards();
  renderMaterialSelectors();
  updateBinderSum(benchmark.type);
  runCalculations();
}

function saveCurrentPreset() {
  const name = prompt("Enter a name for the custom preset:");
  if (!name) return;

  const id = "custom_" + Date.now();
  
  const inputs = {};
  if (activeTheme === 'normal') {
    inputs.grade = parseFloat(document.getElementById("grade").value) || 30;
    inputs.msa = parseInt(document.getElementById("msa").value) || 20;
    inputs.slump = parseFloat(document.getElementById("slump").value) || 100;
    inputs.wc_ratio = parseFloat(document.getElementById("wc_ratio").value) || 0.45;
    inputs.agg_shape = document.getElementById("agg_shape").value || "angular";
    inputs.fa_zone = document.getElementById("fa_zone").value || "II";
    inputs.sp_percent = parseFloat(document.getElementById("sp_percent").value) || 0;
    inputs.sp_dosage = parseFloat(document.getElementById("sp_dosage").value) || 1.0;
    inputs.is_pumped = document.getElementById("is_pumped").checked;

    inputs.cement_percent = 0;
    inputs.fly_ash_percent = 0;
    inputs.ggbs_percent = 0;
    inputs.silica_fume_percent = 0;
    inputs.metakaolin_percent = 0;
    activeBinders.forEach(b => {
      const cat = BINDER_MAPPING[b.id];
      if (cat === "cement") inputs.cement_percent = b.pct;
      else if (cat === "fly_ash") inputs.fly_ash_percent = b.pct;
      else if (cat === "ggbs") inputs.ggbs_percent = b.pct;
      else if (cat === "silica_fume") inputs.silica_fume_percent = b.pct;
      else if (cat === "metakaolin") inputs.metakaolin_percent = b.pct;
    });
  } else {
    inputs.density = parseFloat(document.getElementById("density").value) || 2520;
    inputs.ca_percent = parseFloat(document.getElementById("ca_percent").value) || 65;
    inputs.fa_percent = 100 - inputs.ca_percent;
    inputs.aas_binder_ratio = parseFloat(document.getElementById("aas_binder_ratio").value) || 0.45;
    inputs.ss_sh_ratio = parseFloat(document.getElementById("ss_sh_ratio").value) || 2.5;
    inputs.naoh_molarity = document.getElementById("naoh_molarity").value || "12M";
    inputs.extra_water = parseFloat(document.getElementById("extra_water").value) || 0;

    inputs.fly_ash_percent = 0;
    inputs.ggbs_percent = 0;
    inputs.metakaolin_percent = 0;
    inputs.rice_husk_ash_percent = 0;
    inputs.silica_fume_percent = 0;
    activeBinders.forEach(b => {
      const cat = BINDER_MAPPING[b.id];
      if (cat === "fly_ash") inputs.fly_ash_percent = b.pct;
      else if (cat === "ggbs") inputs.ggbs_percent = b.pct;
      else if (cat === "metakaolin") inputs.metakaolin_percent = b.pct;
      else if (cat === "rice_husk_ash") inputs.rice_husk_ash_percent = b.pct;
      else if (cat === "silica_fume") inputs.silica_fume_percent = b.pct;
    });
  }

  const newPreset = {
    id: id,
    name: `[Custom] ${name}`,
    type: activeTheme,
    description: `Custom ${activeTheme} mix design preset saved on ${new Date().toLocaleDateString()}`,
    inputs: inputs
  };

  const customPresets = JSON.parse(localStorage.getItem('promix_custom_presets') || '{}');
  customPresets[id] = newPreset;
  localStorage.setItem('promix_custom_presets', JSON.stringify(customPresets));

  const select = document.getElementById('benchmark-select');
  if (select) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.innerText = newPreset.name;
    select.appendChild(opt);
  }

  alert("Preset saved successfully!");
}

// === Project Export/Import ===
function exportProject() {
  const customPresets = JSON.parse(localStorage.getItem('promix_custom_presets') || '{}');
  const projectData = {
    version: "1.0",
    project_metadata: {
      project_name: document.getElementById('project-name').value || '',
      engineer_name: document.getElementById('engineer-name').value || '',
      export_date: new Date().toISOString(),
      platform_mode: platformMode,
      active_theme: activeTheme
    },
    materials: customMaterials,
    mixes: savedMixes,
    trial_logs: trialLogs,
    custom_presets: customPresets,
    calibration_data: {
      revision_counter: mixRevisionCounter
    }
  };
  
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PRO-MIX_Project_${projectData.project_metadata.project_name || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importProject(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.materials) {
        customMaterials = { ...customMaterials, ...data.materials };
        localStorage.setItem('promix_materials', JSON.stringify(customMaterials));
      }
      if (data.mixes) {
        savedMixes = [...savedMixes, ...data.mixes];
        localStorage.setItem('promix_mixes', JSON.stringify(savedMixes));
      }
      if (data.trial_logs) {
        trialLogs = [...trialLogs, ...data.trial_logs];
        localStorage.setItem('promix_trials', JSON.stringify(trialLogs));
      }
      if (data.calibration_data?.revision_counter) {
        mixRevisionCounter = { ...mixRevisionCounter, ...data.calibration_data.revision_counter };
        localStorage.setItem('promix_revision_counter', JSON.stringify(mixRevisionCounter));
      }
      if (data.custom_presets) {
        const localCustomPresets = JSON.parse(localStorage.getItem('promix_custom_presets') || '{}');
        const updatedCustomPresets = { ...localCustomPresets, ...data.custom_presets };
        localStorage.setItem('promix_custom_presets', JSON.stringify(updatedCustomPresets));
        fetchBenchmarks();
      }
      if (data.project_metadata) {
        if (data.project_metadata.project_name) document.getElementById('project-name').value = data.project_metadata.project_name;
        if (data.project_metadata.engineer_name) document.getElementById('engineer-name').value = data.project_metadata.engineer_name;
      }
      
      renderTrialLog();
      alert('Project imported successfully!');
    } catch (err) {
      alert('Error importing project: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}
