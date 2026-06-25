/**
 * mock-apis.js
 * Client-side mock interceptor for Next.js website deployments (e.g., Vercel).
 * Intercepts Fetch API calls and Socket.IO connections to simulate backend Python
 * algorithms, ML model predictions, and live telemetry fully in the browser.
 */

(function () {
  console.log("Mock API and WebSockets Interceptor Active.");

  // ==========================================
  // 1. HELPER: SPEECH SYNTHESIS FOR VOICE ASSISTANT
  // ==========================================
  function speakText(text, langCode) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    
    // Map language codes to matching voice locales
    const langMap = {
      "en-IN": "en-IN",
      "gu-IN": "gu-IN",
      "hi-IN": "hi-IN",
      "mr-IN": "mr-IN",
      "en": "en-US",
      "gu": "gu-IN",
      "hi": "hi-IN",
      "mr": "mr-IN"
    };
    
    const targetLang = langMap[langCode] || langCode;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    
    // Attempt to find a native voice for the selected language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  }

  // ==========================================
  // 2. SOIL ANALYSIS SIMULATOR DATA (PORT 8085)
  // ==========================================
  let soilSessionId = null;
  let soilTelemetryInterval = null;
  let soilTareOffsets = { settlement_1_mm: 0.0, settlement_2_mm: 0.0, strain_ue: 0.0 };
  let soilLatest = {
    timestamp: null,
    settlement_1_raw_us: 1166,
    settlement_2_raw_us: 1195,
    settlement_1_mm: 0.0,
    settlement_2_mm: 0.0,
    strain_raw_adc: 0,
    strain_ue: 0.0,
    estimated_tensile_force_kN: 0.0,
    crack_detected: false,
    failure_warning: false
  };

  function simulateSoilTelemetry() {
    if (!soilSessionId) return;
    
    // State progression
    let current_load_kpa = 10.0 + Math.random() * 5;
    let s1_inc = 0.01 + Math.random() * 0.04 + (current_load_kpa * 0.001);
    let s2_inc = 0.01 + Math.random() * 0.04 + (current_load_kpa * 0.001);
    
    let raw_s1 = soilLatest.settlement_1_mm + s1_inc + (Math.random() * 0.04 - 0.02);
    let raw_s2 = soilLatest.settlement_2_mm + s2_inc + (Math.random() * 0.04 - 0.02);
    
    let current_s1 = Math.max(0, raw_s1) - soilTareOffsets.settlement_1_mm;
    let current_s2 = Math.max(0, raw_s2) - soilTareOffsets.settlement_2_mm;
    
    let raw_strain = (current_s1 * 45.0) + (Math.random() * 4.0 - 2.0);
    let current_strain = Math.max(0, raw_strain) - soilTareOffsets.strain_ue;
    
    let estimated_force = current_strain * 0.045;
    let failure_warning = (current_s1 > 8.0) || (current_s2 > 8.0);
    
    const now = new Date();
    const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);
    
    // Speed of sound constants for raw microsecond metrics
    const speedSound = 0.343;
    const distance1 = 200.0 + current_s1;
    const distance2 = 205.0 + current_s2;
    
    soilLatest = {
      timestamp: timestampStr,
      settlement_1_raw_us: Math.round((distance1 * 2) / speedSound),
      settlement_2_raw_us: Math.round((distance2 * 2) / speedSound),
      settlement_1_mm: current_s1,
      settlement_2_mm: current_s2,
      strain_raw_adc: Math.round(current_strain * 420.5),
      strain_ue: current_strain,
      estimated_tensile_force_kN: estimated_force,
      crack_detected: soilLatest.crack_detected,
      failure_warning: failure_warning
    };
  }

  // ==========================================
  // 3. PROMIX CALCULATOR ENGINE (PORT 5001)
  // ==========================================
  const PROMIX_MATERIALS = {
    "binders": {
      "OPC 33": {"sg": 3.15, "name": "Ordinary Portland Cement Grade 33"},
      "OPC 43": {"sg": 3.15, "name": "Ordinary Portland Cement Grade 43"},
      "OPC 53": {"sg": 3.15, "name": "Ordinary Portland Cement Grade 53"},
      "PPC": {"sg": 2.90, "name": "Portland Pozzolana Cement"},
      "PSC": {"sg": 3.00, "name": "Portland Slag Cement"},
      "Fly Ash Class F": {"sg": 2.20, "name": "Class F Fly Ash (Pozzolanic)"},
      "Fly Ash Class C": {"sg": 2.30, "name": "Class C Fly Ash"},
      "GGBS": {"sg": 2.90, "name": "Ground Granulated Blast-Furnace Slag"},
      "Metakaolin": {"sg": 2.60, "name": "Metakaolin"},
      "Silica Fume": {"sg": 2.20, "name": "Silica Fume"},
      "Rice Husk Ash": {"sg": 2.10, "name": "Rice Husk Ash"}
    },
    "fine_aggregates": {
      "River Sand": {"sg": 2.60, "name": "Natural River Sand"},
      "M Sand Zone I": {"sg": 2.65, "name": "Manufactured Sand - Zone I"},
      "M Sand Zone II": {"sg": 2.65, "name": "Manufactured Sand - Zone II"},
      "M Sand Zone III": {"sg": 2.65, "name": "Manufactured Sand - Zone III"}
    },
    "coarse_aggregates": {
      "10 mm": {"sg": 2.70, "name": "Crushed Aggregate 10mm"},
      "20 mm": {"sg": 2.74, "name": "Crushed Aggregate 20mm"},
      "40 mm": {"sg": 2.80, "name": "Crushed Aggregate 40mm"}
    },
    "activators": {
      "NaOH": {"sg": 1.50, "name": "Sodium Hydroxide Solution"},
      "KOH": {"sg": 1.50, "name": "Potassium Hydroxide Solution"}
    },
    "silicates": {
      "Sodium Silicate": {"sg": 1.60, "name": "Sodium Silicate Solution"},
      "Potassium Silicate": {"sg": 1.40, "name": "Potassium Silicate Solution"}
    },
    "admixtures": {
      "Superplasticizer": {"sg": 1.145, "name": "Chemical Admixture (Superplasticizer)"}
    }
  };

  const PROMIX_ECONOMICS = {
    "OPC 33": {"cost": 6.5, "co2": 0.90},
    "OPC 43": {"cost": 7.0, "co2": 0.90},
    "OPC 53": {"cost": 7.5, "co2": 0.90},
    "PPC": {"cost": 6.0, "co2": 0.60},
    "PSC": {"cost": 5.8, "co2": 0.50},
    "Fly Ash Class F": {"cost": 1.2, "co2": 0.02},
    "Fly Ash Class C": {"cost": 1.5, "co2": 0.03},
    "GGBS": {"cost": 3.5, "co2": 0.07},
    "Metakaolin": {"cost": 12.0, "co2": 0.12},
    "Silica Fume": {"cost": 25.0, "co2": 0.15},
    "Rice Husk Ash": {"cost": 2.5, "co2": 0.03},
    "River Sand": {"cost": 2.0, "co2": 0.01},
    "M Sand Zone I": {"cost": 1.5, "co2": 0.015},
    "M Sand Zone II": {"cost": 1.6, "co2": 0.015},
    "M Sand Zone III": {"cost": 1.7, "co2": 0.015},
    "10 mm": {"cost": 1.3, "co2": 0.008},
    "20 mm": {"cost": 1.4, "co2": 0.008},
    "40 mm": {"cost": 1.5, "co2": 0.008},
    "NaOH": {"cost": 18.0, "co2": 0.35},
    "KOH": {"cost": 28.0, "co2": 0.45},
    "Sodium Silicate": {"cost": 15.0, "co2": 0.30},
    "Potassium Silicate": {"cost": 26.0, "co2": 0.40},
    "Superplasticizer": {"cost": 80.0, "co2": 0.25},
    "Water": {"cost": 0.05, "co2": 0.0001}
  };

  const PROMIX_DURABILITY = {
    "mild": {"min_cement": 300, "max_wc": 0.55, "min_grade": "M20"},
    "moderate": {"min_cement": 300, "max_wc": 0.50, "min_grade": "M25"},
    "severe": {"min_cement": 320, "max_wc": 0.45, "min_grade": "M30"},
    "very_severe": {"min_cement": 340, "max_wc": 0.45, "min_grade": "M35"},
    "extreme": {"min_cement": 360, "max_wc": 0.40, "min_grade": "M40"}
  };

  const PROMIX_BENCHMARKS = {
    "version": "1.0",
    "benchmarks": [
      {
        "id": "BM-M20-01",
        "name": "M20 Conventional",
        "type": "normal",
        "description": "Standard M20 mix per IS 10262:2019 Example",
        "inputs": {
          "grade": 20, "msa": 20, "slump": 75, "wc_ratio": 0.50,
          "agg_shape": "angular", "fa_zone": "II", "sp_percent": 0,
          "sp_dosage": 0, "is_pumped": false, "fly_ash_percent": 0,
          "ggbs_percent": 0, "silica_fume_percent": 0, "metakaolin_percent": 0
        },
        "expected": { "cement": 320.0, "water": 172.0, "ca": 1166.0, "fa": 636.0 }
      },
      {
        "id": "BM-M25-01",
        "name": "M25 Conventional",
        "type": "normal",
        "description": "Standard M25 mix per IS 10262:2019 Example",
        "inputs": {
          "grade": 25, "msa": 20, "slump": 75, "wc_ratio": 0.50,
          "agg_shape": "angular", "fa_zone": "II", "sp_percent": 0,
          "sp_dosage": 0, "is_pumped": false, "fly_ash_percent": 0,
          "ggbs_percent": 0, "silica_fume_percent": 0, "metakaolin_percent": 0
        },
        "expected": { "cement": 340.0, "water": 172.0, "ca": 1150.0, "fa": 630.0 }
      },
      {
        "id": "BM-M30-01",
        "name": "M30 Conventional",
        "type": "normal",
        "description": "Standard M30 mix per IS 10262:2019 Example",
        "inputs": {
          "grade": 30, "msa": 20, "slump": 100, "wc_ratio": 0.45,
          "agg_shape": "angular", "fa_zone": "II", "sp_percent": 20,
          "sp_dosage": 1.0, "is_pumped": false, "fly_ash_percent": 0,
          "ggbs_percent": 0, "silica_fume_percent": 0, "metakaolin_percent": 0
        },
        "expected": { "cement": 380.0, "water": 160.0, "ca": 1200.0, "fa": 650.0 }
      },
      {
        "id": "BM-GEO-01",
        "name": "Geopolymer Example 1",
        "type": "geopolymer",
        "description": "Standard Geopolymer Mix (Pavithra et al.)",
        "inputs": {
          "density": 2400.0, "ca_percent": 65.0, "fa_percent": 35.0,
          "aas_binder_ratio": 0.45, "ss_sh_ratio": 2.5, "naoh_molarity": "12M",
          "extra_water": 0.0, "fly_ash_percent": 70.0, "ggbs_percent": 30.0,
          "metakaolin_percent": 0.0, "rice_husk_ash_percent": 0.0, "silica_fume_percent": 0.0
        },
        "expected": { "fly_ash": 340.0, "ggbs": 145.0, "sodium_silicate": 156.0, "sodium_hydroxide": 62.0 }
      }
    ]
  };

  const PROMIX_REVIEW_RULES = [
    { id: "RULE-OPC-001", trigger: "OPC mass too high", field: "mass_cement_ssd.value", comparator: "gt", threshold: 380, severity: "warning", observation_template: "OPC content = {value} kg/m³", recommendation: "Replace 15-20% OPC with GGBS or Fly Ash" },
    { id: "RULE-CO2-002", trigger: "High carbon footprint", field: "economics.total_co2.value", comparator: "gt", threshold: 250, severity: "warning", observation_template: "Total CO₂ = {value} kg/m³", recommendation: "Increase supplementary cementitious materials" },
    { id: "RULE-CST-003", trigger: "High material cost", field: "economics.total_cost.value", comparator: "gt", threshold: 4500, severity: "warning", observation_template: "Total Cost = ₹{value}/m³", recommendation: "Optimize binder blend or aggregate source" },
    { id: "RULE-WCR-004", trigger: "W/C ratio too high", field: "wc_ratio", comparator: "gt", threshold: 0.48, severity: "warning", observation_template: "W/C Ratio = {value}", recommendation: "Increase binder content or use superplasticizer" },
    { id: "RULE-WCL-005", trigger: "W/C ratio too low", field: "wc_ratio", comparator: "lt", threshold: 0.35, severity: "warning", observation_template: "W/C Ratio = {value}", recommendation: "Check workability; consider higher slump design" },
    { id: "RULE-GRD-006", trigger: "Sand in Zone I or IV", field: "fa_zone", comparator: "in", threshold: ["I", "IV"], severity: "warning", observation_template: "Fine Aggregate Zone = {value}", recommendation: "Blend with Zone II or Zone III sand" },
    { id: "RULE-BND-007", trigger: "Binder sum != 100%", field: "binder_sum", comparator: "neq", threshold: 100.0, severity: "critical", observation_template: "Total Binder = {value}%", recommendation: "Adjust binder percentages to total exactly 100%" },
    { id: "RULE-VOL-008", trigger: "Volume imbalance", field: "absolute_volume_total.value", comparator: "outside", threshold: [0.99, 1.01], severity: "critical", observation_template: "Total Volume = {value} m³", recommendation: "Check SG inputs and recalculate" },
    { id: "RULE-STR-009", trigger: "Target strength margin low", field: "strength_margin", comparator: "lt", threshold: 5.0, severity: "warning", observation_template: "Strength Margin = {value} MPa", recommendation: "Margin between f'ck and fck is below 5 MPa; verify standard deviation" }
  ];

  let mixTraceCounter = 0;

  function calculateNormalMix(inputs) {
    const fck = parseFloat(inputs.grade || 30);
    const msa = parseInt(inputs.msa || 20);
    const slump = parseFloat(inputs.slump || 100);
    const agg_shape = inputs.agg_shape || "angular";
    const sp_percent = parseFloat(inputs.sp_percent || 0);
    const sp_dosage = parseFloat(inputs.sp_dosage || 1.0);
    const wc_ratio = parseFloat(inputs.wc_ratio || 0.45);
    const fa_zone = inputs.fa_zone || "II";
    const is_pumped = !!inputs.is_pumped;

    // Specific Gravities
    const sg_cement = parseFloat(inputs.sg_cement || 3.15);
    const sg_fa_b = parseFloat(inputs.sg_fly_ash || 2.20);
    const sg_ggbs = parseFloat(inputs.sg_ggbs || 2.90);
    const sg_sf = parseFloat(inputs.sg_silica_fume || 2.20);
    const sg_mk = parseFloat(inputs.sg_metakaolin || 2.60);
    const sg_ca = parseFloat(inputs.sg_ca || 2.74);
    const sg_fa = parseFloat(inputs.sg_fa || 2.65);
    const sg_adm = parseFloat(inputs.sg_admixture || 1.145);

    const wa_ca = parseFloat(inputs.wa_ca || 0.5);
    const fm_ca = parseFloat(inputs.fm_ca || 0.0);
    const wa_fa = parseFloat(inputs.wa_fa || 1.0);
    const fm_fa = parseFloat(inputs.fm_fa || 2.0);

    const pct_fa = parseFloat(inputs.fly_ash_percent || 0);
    const pct_ggbs = parseFloat(inputs.ggbs_percent || 0);
    const pct_sf = parseFloat(inputs.silica_fume_percent || 0);
    const pct_mk = parseFloat(inputs.metakaolin_percent || 0);
    const pct_cement = parseFloat(inputs.cement_percent || (100.0 - (pct_fa + pct_ggbs + pct_sf + pct_mk)));

    // Cost & Carbon Factors
    const cost_c = PROMIX_ECONOMICS["OPC 43"].cost;
    const co2_c = PROMIX_ECONOMICS["OPC 43"].co2;
    const cost_fa_b = PROMIX_ECONOMICS["Fly Ash Class F"].cost;
    const co2_fa_b = PROMIX_ECONOMICS["Fly Ash Class F"].co2;
    const cost_ggbs = PROMIX_ECONOMICS["GGBS"].cost;
    const co2_ggbs = PROMIX_ECONOMICS["GGBS"].co2;
    const cost_sf = PROMIX_ECONOMICS["Silica Fume"].cost;
    const co2_sf = PROMIX_ECONOMICS["Silica Fume"].co2;
    const cost_mk = PROMIX_ECONOMICS["Metakaolin"].cost;
    const co2_mk = PROMIX_ECONOMICS["Metakaolin"].co2;
    const cost_w = PROMIX_ECONOMICS["Water"].cost;
    const co2_w = PROMIX_ECONOMICS["Water"].co2;
    const cost_ca = PROMIX_ECONOMICS["20 mm"].cost;
    const co2_ca = PROMIX_ECONOMICS["20 mm"].co2;
    const cost_fa = PROMIX_ECONOMICS["River Sand"].cost;
    const co2_fa = PROMIX_ECONOMICS["River Sand"].co2;
    const cost_adm = PROMIX_ECONOMICS["Superplasticizer"].cost;
    const co2_adm = PROMIX_ECONOMICS["Superplasticizer"].co2;

    const results = {};

    // 1. Target Compressive Strength
    let s_val = 5.0, x_val = 6.5;
    if (fck <= 15) { s_val = 3.5; x_val = 5.0; }
    else if (fck <= 25) { s_val = 4.0; x_val = 5.5; }
    const target_strength = Math.max(fck + 1.65 * s_val, fck + x_val);
    results["target_strength"] = { value: target_strength, source: "IS 10262:2019 Clause 4.2", revision: "2019" };

    // 2. Entrapped Air
    let v_air_percent = 1.0;
    if (msa === 10) v_air_percent = 1.5;
    else if (msa === 40) v_air_percent = 0.8;
    const v_air = v_air_percent / 100.0;
    results["air_content"] = { value: v_air, source: "IS 10262:2019 Table 3", revision: "2019" };

    // 3. Water Content
    let w_base = 186.0;
    if (msa === 10) w_base = 208.0;
    else if (msa === 40) w_base = 165.0;
    results["base_water"] = { value: w_base, source: "IS 10262:2019 Table 4", revision: "2019" };

    const w_slump_adj = ((slump - 50.0) / 25.0) * 0.03 * w_base;
    const shape_reductions = { "angular": 0.0, "sub-angular": -10.0, "gravel-crushed": -15.0, "rounded": -20.0 };
    const w_shape_adj = shape_reductions[agg_shape] || 0.0;
    const w_before_sp = w_base + w_slump_adj + w_shape_adj;
    const w_final = w_before_sp * (1.0 - (sp_percent / 100.0));
    results["water_content"] = { value: w_final, source: "IS 10262:2019 Clause 5.3 Note 3", revision: "2019" };

    // 4. Total Binder Content
    const binder_content = w_final / wc_ratio;
    results["cement_content"] = { value: binder_content, source: "IS 10262:2019 Clause 5.4", revision: "2019" };

    const mass_cement = binder_content * (pct_cement / 100.0);
    const mass_fa_b = binder_content * (pct_fa / 100.0);
    const mass_ggbs = binder_content * (pct_ggbs / 100.0);
    const mass_sf = binder_content * (pct_sf / 100.0);
    const mass_mk = binder_content * (pct_mk / 100.0);

    results["mass_cement_ssd"] = { value: mass_cement, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results["mass_fly_ash_ssd"] = { value: mass_fa_b, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results["mass_ggbs_ssd"] = { value: mass_ggbs, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results["mass_silica_fume_ssd"] = { value: mass_sf, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results["mass_metakaolin_ssd"] = { value: mass_mk, source: "IS 10262:2019 Clause 5.4", revision: "2019" };

    // 5. Coarse & Fine Agg ratios
    const v_ca_lookup = {
      10: { "I": 0.48, "II": 0.50, "III": 0.52, "IV": 0.54 },
      20: { "I": 0.60, "II": 0.62, "III": 0.64, "IV": 0.66 },
      40: { "I": 0.69, "II": 0.71, "III": 0.72, "IV": 0.73 }
    };
    const v_ca_base = (v_ca_lookup[msa] || v_ca_lookup[20])[fa_zone] || 0.62;
    const v_ca_adjusted = v_ca_base + ((0.50 - wc_ratio) / 0.05) * 0.01;
    const v_ca_final = is_pumped ? v_ca_adjusted * 0.90 : v_ca_adjusted;
    const v_fa_final = 1.0 - v_ca_final;

    results["coarse_agg_ratio"] = { value: v_ca_final, source: "IS 10262:2019 Table 5", revision: "2019" };
    results["fine_agg_ratio"] = { value: v_fa_final, source: "IS 10262:2019 Clause 5.5.2", revision: "2019" };

    // 6. Absolute Volume
    const v_c = mass_cement / (sg_cement * 1000.0);
    const v_fa_b = mass_fa_b / (sg_fa_b * 1000.0);
    const v_ggbs = mass_ggbs / (sg_ggbs * 1000.0);
    const v_sf = mass_sf / (sg_sf * 1000.0);
    const v_mk = mass_mk / (sg_mk * 1000.0);
    const v_binder_total = v_c + v_fa_b + v_ggbs + v_sf + v_mk;

    const v_w = w_final / 1000.0;
    const admixture_mass = binder_content * (sp_dosage / 100.0);
    const v_adm = admixture_mass / (sg_adm * 1000.0);

    const v_agg = 1.0 - (v_air + v_binder_total + v_w + v_adm);
    results["volume_all_aggregates"] = { value: v_agg, source: "IS 10262:2019 Clause 5.6", revision: "2019" };

    const mass_ca_ssd = v_agg * v_ca_final * sg_ca * 1000.0;
    const mass_fa_ssd = v_agg * v_fa_final * sg_fa * 1000.0;

    results["mass_water_ssd"] = { value: w_final, source: "IS 10262:2019", revision: "2019" };
    results["mass_ca_ssd"] = { value: mass_ca_ssd, source: "IS 10262:2019", revision: "2019" };
    results["mass_fa_ssd"] = { value: mass_fa_ssd, source: "IS 10262:2019", revision: "2019" };
    results["mass_admixture_ssd"] = { value: admixture_mass, source: "IS 10262:2019", revision: "2019" };
    results["absolute_volume_total"] = { value: v_binder_total + v_w + v_adm + v_agg + v_air, source: "Balance Check", revision: "2019" };

    // 7. Moisture Corrections
    const ca_corr = (fm_ca - wa_ca) / 100.0;
    const fa_corr = (fm_fa - wa_fa) / 100.0;
    const mass_ca_site = mass_ca_ssd * (1.0 + ca_corr);
    const mass_fa_site = mass_fa_ssd * (1.0 + fa_corr);
    const cont_water = (mass_ca_ssd * ca_corr) + (mass_fa_ssd * fa_corr);
    const added_water = w_final - cont_water;

    results["mass_ca_site"] = { value: mass_ca_site, source: "IS 10262:2019 Clause 7", revision: "2019" };
    results["mass_fa_site"] = { value: mass_fa_site, source: "IS 10262:2019 Clause 7", revision: "2019" };
    results["mass_water_site"] = { value: added_water, source: "IS 10262:2019 Clause 7", revision: "2019" };

    // Economics
    const cost_cement = mass_cement * cost_c;
    const cost_fa_b_tot = mass_fa_b * cost_fa_b;
    const cost_ggbs_tot = mass_ggbs * cost_ggbs;
    const cost_sf_tot = mass_sf * cost_sf;
    const cost_mk_tot = mass_mk * cost_mk;
    const cost_binders = cost_cement + cost_fa_b_tot + cost_ggbs_tot + cost_sf_tot + cost_mk_tot;

    const cost_water = w_final * cost_w;
    const cost_ca_ssd_tot = mass_ca_ssd * cost_ca;
    const cost_fa_ssd_tot = mass_fa_ssd * cost_fa;
    const cost_sp = admixture_mass * cost_adm;
    const total_cost = cost_binders + cost_water + cost_ca_ssd_tot + cost_fa_ssd_tot + cost_sp;

    const co2_cement = mass_cement * co2_c;
    const co2_fa_b_tot = mass_fa_b * co2_fa_b;
    const co2_ggbs_tot = mass_ggbs * co2_ggbs;
    const co2_sf_tot = mass_sf * co2_sf;
    const co2_mk_tot = mass_mk * co2_mk;
    const co2_binders = co2_cement + co2_fa_b_tot + co2_ggbs_tot + co2_sf_tot + co2_mk_tot;

    const co2_water = w_final * co2_w;
    const co2_ca_ssd_tot = mass_ca_ssd * co2_ca;
    const co2_fa_ssd_tot = mass_fa_ssd * co2_fa;
    const co2_sp = admixture_mass * co2_adm;
    const total_co2 = co2_binders + co2_water + co2_ca_ssd_tot + co2_fa_ssd_tot + co2_sp;

    results["economics"] = {
      "total_cost": { value: total_cost, source: "Cost Estimate", revision: "2019" },
      "total_co2": { value: total_co2, source: "CO2 Emissions", revision: "2019" },
      "breakdown": {
        "cost": {
          "cement": cost_cement, "fly_ash": cost_fa_b_tot, "ggbs": cost_ggbs_tot,
          "silica_fume": cost_sf_tot, "metakaolin": cost_mk_tot, "water": cost_water,
          "ca": cost_ca_ssd_tot, "fa": cost_fa_ssd_tot, "admixture": cost_sp
        },
        "co2": {
          "cement": co2_cement, "fly_ash": co2_fa_b_tot, "ggbs": co2_ggbs_tot,
          "silica_fume": co2_sf_tot, "metakaolin": co2_mk_tot, "water": co2_water,
          "ca": co2_ca_ssd_tot, "fa": co2_fa_ssd_tot, "admixture": co2_sp
        }
      }
    };

    return results;
  }

  function calculateGeopolymerMix(inputs) {
    const density = parseFloat(inputs.density || 2400.0);
    const ca_percent = parseFloat(inputs.ca_percent || 65.0);
    const fa_percent = parseFloat(inputs.fa_percent || 35.0);
    const aas_binder_ratio = parseFloat(inputs.aas_binder_ratio || 0.45);
    const ss_sh_ratio = parseFloat(inputs.ss_sh_ratio || 2.5);
    const naoh_molarity = inputs.naoh_molarity || "12M";
    const extra_water = parseFloat(inputs.extra_water || 0.0);

    const fa_percent_binder = parseFloat(inputs.fly_ash_percent || 70.0);
    const ggbs_percent = parseFloat(inputs.ggbs_percent || 30.0);
    const mk_percent = parseFloat(inputs.metakaolin_percent || 0.0);
    const rha_percent = parseFloat(inputs.rice_husk_ash_percent || 0.0);
    const sf_percent = parseFloat(inputs.silica_fume_percent || 0.0);

    // SG definitions
    const sg_fa = parseFloat(inputs.sg_fly_ash || 2.20);
    const sg_ggbs = parseFloat(inputs.sg_ggbs || 2.90);
    const sg_mk = parseFloat(inputs.sg_metakaolin || 2.60);
    const sg_rha = parseFloat(inputs.sg_rice_husk_ash || 2.10);
    const sg_sf = parseFloat(inputs.sg_silica_fume || 2.20);
    const sg_ca = parseFloat(inputs.sg_ca || 2.74);
    const sg_fa_agg = parseFloat(inputs.sg_fa || 2.65);
    const sg_ss = parseFloat(inputs.sg_ss || 1.60);
    const sg_sh = parseFloat(inputs.sg_sh || 1.50);

    const wa_ca = parseFloat(inputs.wa_ca || 0.5);
    const fm_ca = parseFloat(inputs.fm_ca || 0.0);
    const wa_fa = parseFloat(inputs.wa_fa || 1.0);
    const fm_fa = parseFloat(inputs.fm_fa || 2.0);

    // Cost & Carbon Factors
    const cost_fa_b = PROMIX_ECONOMICS["Fly Ash Class F"].cost;
    const co2_fa_b = PROMIX_ECONOMICS["Fly Ash Class F"].co2;
    const cost_ggbs = PROMIX_ECONOMICS["GGBS"].cost;
    const co2_ggbs = PROMIX_ECONOMICS["GGBS"].co2;
    const cost_mk = PROMIX_ECONOMICS["Metakaolin"].cost;
    const co2_mk = PROMIX_ECONOMICS["Metakaolin"].co2;
    const cost_rha = PROMIX_ECONOMICS["Rice Husk Ash"].cost;
    const co2_rha = PROMIX_ECONOMICS["Rice Husk Ash"].co2;
    const cost_sf = PROMIX_ECONOMICS["Silica Fume"].cost;
    const co2_sf = PROMIX_ECONOMICS["Silica Fume"].co2;
    const cost_ca = PROMIX_ECONOMICS["20 mm"].cost;
    const co2_ca = PROMIX_ECONOMICS["20 mm"].co2;
    const cost_fa_agg = PROMIX_ECONOMICS["River Sand"].cost;
    const co2_fa_agg = PROMIX_ECONOMICS["River Sand"].co2;
    const cost_ss = PROMIX_ECONOMICS["Sodium Silicate"].cost;
    const co2_ss = PROMIX_ECONOMICS["Sodium Silicate"].co2;
    const cost_sh = PROMIX_ECONOMICS["NaOH"].cost;
    const co2_sh = PROMIX_ECONOMICS["NaOH"].co2;
    const cost_water = PROMIX_ECONOMICS["Water"].cost;
    const co2_water = PROMIX_ECONOMICS["Water"].co2;

    const results = {};

    // 2. Aggregate Mass
    const mass_agg = density * 0.80;
    results["total_aggregate_mass"] = { value: mass_agg, source: "Pavithra et al. (2016) Step 2", revision: "2016" };

    const mass_ca_ssd = mass_agg * (ca_percent / 100.0);
    const mass_fa_ssd = mass_agg * (fa_percent / 100.0);
    results["mass_ca_ssd"] = { value: mass_ca_ssd, source: "Pavithra et al. (2016)", revision: "2016" };
    results["mass_fa_ssd"] = { value: mass_fa_ssd, source: "Pavithra et al. (2016)", revision: "2016" };

    // 3. Paste, Binder, Activator
    const mass_paste = density - mass_agg;
    results["total_paste_mass"] = { value: mass_paste, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    const mass_binder = mass_paste / (1.0 + aas_binder_ratio);
    results["total_binder_mass"] = { value: mass_binder, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    const mass_aas = mass_paste - mass_binder;
    results["total_activator_mass"] = { value: mass_aas, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    // Binders
    const m_fa = mass_binder * (fa_percent_binder / 100.0);
    const m_ggbs = mass_binder * (ggbs_percent / 100.0);
    const m_mk = mass_binder * (mk_percent / 100.0);
    const m_rha = mass_binder * (rha_percent / 100.0);
    const m_sf = mass_binder * (sf_percent / 100.0);

    results["mass_fly_ash"] = { value: m_fa, source: "Binder Split", revision: "2016" };
    results["mass_ggbs"] = { value: m_ggbs, source: "Binder Split", revision: "2016" };
    results["mass_metakaolin"] = { value: m_mk, source: "Binder Split", revision: "2016" };
    results["mass_rice_husk_ash"] = { value: m_rha, source: "Binder Split", revision: "2016" };
    results["mass_silica_fume"] = { value: m_sf, source: "Binder Split", revision: "2016" };

    // 4. Activators
    const mass_sh = mass_aas / (1.0 + ss_sh_ratio);
    const mass_ss = mass_aas - mass_sh;

    results["mass_sh_solution"] = { value: mass_sh, source: "Pavithra et al. (2016) Step 4", revision: "2016" };
    results["mass_ss_solution"] = { value: mass_ss, source: "Pavithra et al. (2016) Step 4", revision: "2016" };

    // 5. Water/Geopolymer Solids
    const naoh_composition = {
      "8M": { "solids": 26.2, "water": 73.8 },
      "12M": { "solids": 36.1, "water": 63.9 },
      "16M": { "solids": 44.4, "water": 55.6 }
    };
    const naoh_limits = naoh_composition[naoh_molarity] || naoh_composition["12M"];
    const water_total = (mass_sh * (naoh_limits.water / 100.0)) + (mass_ss * 0.5124) + extra_water;
    const solids_total = mass_binder + (mass_sh * (naoh_limits.solids / 100.0)) + (mass_ss * 0.4876);
    const w_gs_ratio = water_total / solids_total;

    results["water_total"] = { value: water_total, source: "Pavithra et al. (2016)", revision: "2016" };
    results["solids_total"] = { value: solids_total, source: "Pavithra et5 al. (2016)", revision: "2016" };
    results["w_gs_ratio"] = { value: w_gs_ratio, source: "Pavithra et al. (2016)", revision: "2016" };

    // 6. Absolute Volume Verification
    const v_binders = (m_fa / (sg_fa * 1000.0)) + (m_ggbs / (sg_ggbs * 1000.0)) + (m_mk / (sg_mk * 1000.0)) + (m_rha / (sg_rha * 1000.0)) + (m_sf / (sg_sf * 1000.0));
    const v_ss = mass_ss / (sg_ss * 1000.0);
    const v_sh = mass_sh / (sg_sh * 1000.0);
    const v_ca = mass_ca_ssd / (sg_ca * 1000.0);
    const v_fa = mass_fa_ssd / (sg_fa_agg * 1000.0);
    const v_ext_w = extra_water / 1000.0;
    results["absolute_volume_total"] = { value: v_binders + v_ss + v_sh + v_ca + v_fa + v_ext_w, source: "Volumetric Sum check", revision: "2016" };

    // 7. Moisture Corrections
    const ca_corr = (fm_ca - wa_ca) / 100.0;
    const fa_corr = (fm_fa - wa_fa) / 100.0;
    const mass_ca_site = mass_ca_ssd * (1.0 + ca_corr);
    const mass_fa_site = mass_fa_ssd * (1.0 + fa_corr);
    const cont_water = (mass_ca_ssd * ca_corr) + (mass_fa_ssd * fa_corr);
    const mass_aas_site = mass_aas - cont_water;

    results["mass_ca_site"] = { value: mass_ca_site, source: "Moisture Corrections", revision: "2016" };
    results["mass_fa_site"] = { value: mass_fa_site, source: "Moisture Corrections", revision: "2016" };
    results["mass_aas_site"] = { value: mass_aas_site, source: "Moisture Corrections", revision: "2016" };

    // Economics
    const cost_binders = (m_fa * cost_fa_b) + (m_ggbs * cost_ggbs) + (m_mk * cost_mk) + (m_rha * cost_rha) + (m_sf * cost_sf);
    const cost_ss_sol = mass_ss * cost_ss;
    const cost_sh_sol = mass_sh * cost_sh;
    const cost_ca_ssd_tot = mass_ca_ssd * cost_ca;
    const cost_fa_ssd_tot = mass_fa_ssd * cost_fa_agg;
    const cost_ext_w = extra_water * cost_water;
    const total_cost = cost_binders + cost_ss_sol + cost_sh_sol + cost_ca_ssd_tot + cost_fa_ssd_tot + cost_ext_w;

    const co2_binders = (m_fa * co2_fa_b) + (m_ggbs * co2_ggbs) + (m_mk * co2_mk) + (m_rha * co2_rha) + (m_sf * co2_sf);
    const co2_ss_sol = mass_ss * co2_ss;
    const co2_sh_sol = mass_sh * co2_sh;
    const co2_ca_ssd_tot = mass_ca_ssd * co2_ca;
    const co2_fa_ssd_tot = mass_fa_ssd * co2_fa_agg;
    const co2_ext_w = extra_water * co2_water;
    const total_co2 = co2_binders + co2_ss_sol + co2_sh_sol + co2_ca_ssd_tot + co2_fa_ssd_tot + co2_ext_w;

    results["economics"] = {
      "total_cost": { value: total_cost, source: "Cost Estimate", revision: "2016" },
      "total_co2": { value: total_co2, source: "CO2 Emissions", revision: "2016" },
      "breakdown": {
        "cost": {
          "cement": 0, "fly_ash": m_fa * cost_fa_b, "ggbs": m_ggbs * cost_ggbs,
          "silica_fume": m_sf * cost_sf, "metakaolin": m_mk * cost_mk, "water": cost_ext_w,
          "ca": cost_ca_ssd_tot, "fa": cost_fa_ssd_tot, "admixture": 0, "sodium_silicate": cost_ss_sol, "sodium_hydroxide": cost_sh_sol
        },
        "co2": {
          "cement": 0, "fly_ash": m_fa * co2_fa_b, "ggbs": m_ggbs * co2_ggbs,
          "silica_fume": m_sf * co2_sf, "metakaolin": m_mk * co2_mk, "water": co2_ext_w,
          "ca": co2_ca_ssd_tot, "fa": co2_fa_ssd_tot, "admixture": 0, "sodium_silicate": co2_ss_sol, "sodium_hydroxide": co2_sh_sol
        }
      }
    };

    return results;
  }

  function validateMix(mix_type, inputs, results, platform_mode) {
    const checklist = {};
    let passed = 0;
    const total = 6;

    // 1. Volume balance check
    const vol = results.absolute_volume_total.value;
    const vol_balanced = (vol >= 0.99 && vol <= 1.01);
    checklist["volume_balanced"] = {
      status: vol_balanced,
      message: vol_balanced ? `Absolute volume total is ${vol.toFixed(3)} m³` : `Volume mismatch: ${vol.toFixed(3)} m³`
    };
    if (vol_balanced) passed++;

    // 2. Material data complete
    let sgs_valid = true;
    checklist["material_data_complete"] = {
      status: true,
      message: "All specific gravity inputs are complete and valid."
    };
    passed++;

    if (mix_type === "normal") {
      // 3. IS 10262 guidelines
      const grade = parseFloat(inputs.grade || 30);
      const wc = parseFloat(inputs.wc_ratio || 0.45);
      const guid_ok = (grade >= 10 && grade <= 60 && wc >= 0.3 && wc <= 0.6);
      checklist["is_10262_compliant"] = { status: guid_ok, message: guid_ok ? "Grade M10-M60 and W/C ratio within standard guidelines." : "Failed guides." };
      if (guid_ok) passed++;

      // 4. Durability
      const exp = (inputs.exposure || "severe").toLowerCase();
      const rule = PROMIX_DURABILITY[exp] || PROMIX_DURABILITY["severe"];
      const min_c = rule.min_cement;
      const max_wc = rule.max_wc;
      const calc_c = results.cement_content.value;
      const d_ok = (wc <= max_wc && calc_c >= min_c && grade >= parseInt(rule.min_grade.replace("M","")));
      checklist["is_456_compliant"] = { status: d_ok, message: d_ok ? `Meets durability specs for ${exp} exposure.` : `Failed durability.` };
      if (d_ok) passed++;

      // 5. Cement limit
      const c_limit = calc_c <= 450.0;
      checklist["cement_limit_satisfied"] = { status: c_limit, message: c_limit ? "Cement content within limits." : "Exceeds limits." };
      if (c_limit) passed++;

      // 6. Aggregate splits
      checklist["aggregate_ratios_valid"] = { status: true, message: "Aggregate splits balanced." };
      passed++;
    } else {
      checklist["is_10262_compliant"] = { status: true, message: "N/A" }; passed++;
      checklist["is_456_compliant"] = { status: true, message: "N/A" }; passed++;
      checklist["cement_limit_satisfied"] = { status: true, message: "PASSED - 100% Cement-free." }; passed++;
      checklist["aggregate_ratios_valid"] = { status: true, message: "Aggregate splits balanced." }; passed++;
    }

    return { checklist, score: `${passed}/${total}`, passed_all: (passed === total) };
  }

  function generateReview(mix_type, inputs, results) {
    const observations = [];
    const recommendations = [];

    // Helper: evaluate rules
    PROMIX_REVIEW_RULES.forEach(rule => {
      let val = 0;
      if (rule.field === "mass_cement_ssd.value") val = results.mass_cement_ssd ? results.mass_cement_ssd.value : 0;
      else if (rule.field === "economics.total_co2.value") val = results.economics.total_co2.value;
      else if (rule.field === "economics.total_cost.value") val = results.economics.total_cost.value;
      else if (rule.field === "wc_ratio") val = parseFloat(inputs.wc_ratio || 0.45);
      else if (rule.field === "fa_zone") val = inputs.fa_zone || "II";
      else if (rule.field === "absolute_volume_total.value") val = results.absolute_volume_total.value;
      else if (rule.field === "binder_sum") {
        val = parseFloat(inputs.fly_ash_percent || 0) + parseFloat(inputs.ggbs_percent || 0) + parseFloat(inputs.silica_fume_percent || 0) + parseFloat(inputs.metakaolin_percent || 0) + parseFloat(inputs.cement_percent || 0);
      } else if (rule.field === "strength_margin") {
        val = results.target_strength.value - parseFloat(inputs.grade || 30);
      }

      let triggered = false;
      if (rule.comparator === "gt") triggered = val > rule.threshold;
      else if (rule.comparator === "lt") triggered = val < rule.threshold;
      else if (rule.comparator === "eq") triggered = val === rule.threshold;
      else if (rule.comparator === "neq") triggered = val !== rule.threshold;
      else if (rule.comparator === "in") triggered = rule.threshold.includes(val);
      else if (rule.comparator === "outside") triggered = val < rule.threshold[0] || val > rule.threshold[1];

      if (triggered) {
        observations.push({
          rule_id: rule.id,
          trigger: rule.trigger,
          observation: rule.observation_template.replace("{value}", typeof val === 'number' ? val.toFixed(2) : val),
          recommendation: rule.recommendation,
          severity: rule.severity
        });
        if (!recommendations.includes(rule.recommendation)) recommendations.push(rule.recommendation);
      }
    });

    return { observations, recommendations, source: "Reviewer Rules Engine", revision: "2019" };
  }

  function optimizeMix(inputs, objective) {
    // Generate simple candidates based on current inputs
    const candidates = [];
    const splits = [
      { cement: 60, fly_ash: 20, ggbs: 20, silica_fume: 0, metakaolin: 0 },
      { cement: 50, fly_ash: 30, ggbs: 20, silica_fume: 0, metakaolin: 0 },
      { cement: 40, fly_ash: 30, ggbs: 30, silica_fume: 0, metakaolin: 0 }
    ];
    splits.forEach(split => {
      const copyInputs = { ...inputs, cement_percent: split.cement, fly_ash_percent: split.fly_ash, ggbs_percent: split.ggbs, silica_fume_percent: split.silica_fume, metakaolin_percent: split.metakaolin };
      const res = calculateNormalMix(copyInputs);
      candidates.push({
        binder_split: split,
        cost: res.economics.total_cost.value,
        co2: res.economics.total_co2.value,
        binder_content: res.cement_content.value,
        delta_cost_pct: -5.0 - Math.random() * 8,
        delta_co2_pct: -15.0 - Math.random() * 12
      });
    });
    return { candidates };
  }

  // ==========================================
  // 4. INTERCEPT GLOBAL FETCH
  // ==========================================
  const originalFetch = window.fetch;
  window.fetch = async function (url, options) {
    const urlStr = typeof url === 'string' ? url : url.url;
    console.log("Mock Intercepted Fetch:", urlStr);

    // SOIL ANALYSIS MOCKS
    if (urlStr.includes("/api/start-session")) {
      soilSessionId = "SES_" + Date.now();
      soilTareOffsets = { settlement_1_mm: 0.0, settlement_2_mm: 0.0, strain_ue: 0.0 };
      if (soilTelemetryInterval) clearInterval(soilTelemetryInterval);
      soilTelemetryInterval = setInterval(simulateSoilTelemetry, 1000);
      return new Response(JSON.stringify({ status: "success", session_id: soilSessionId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/stop-session")) {
      if (soilTelemetryInterval) clearInterval(soilTelemetryInterval);
      soilTelemetryInterval = null;
      soilSessionId = null;
      return new Response(JSON.stringify({ status: "success" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/tare")) {
      soilTareOffsets.settlement_1_mm += soilLatest.settlement_1_mm;
      soilTareOffsets.settlement_2_mm += soilLatest.settlement_2_mm;
      soilTareOffsets.strain_ue += soilLatest.strain_ue;
      // Reset current readings to 0
      soilLatest.settlement_1_mm = 0;
      soilLatest.settlement_2_mm = 0;
      soilLatest.strain_ue = 0;
      return new Response(JSON.stringify({ status: "success" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/live-stream")) {
      if (!soilLatest.timestamp) {
        soilLatest.timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      }
      return new Response(JSON.stringify(soilLatest), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/upload-csv")) {
      // Mock historical data loading from CSV
      const mockHist = {
        status: "success",
        historical_data: {
          timestamps: Array.from({ length: 40 }, (_, i) => `10:15:${i < 10 ? '0' + i : i}`),
          settlement_1_mm: Array.from({ length: 40 }, (_, i) => i * 0.15 + Math.random() * 0.05),
          settlement_2_mm: Array.from({ length: 40 }, (_, i) => i * 0.18 + Math.random() * 0.05),
          load_kPa: Array.from({ length: 40 }, (_, i) => i * 1.5 + Math.random() * 0.5),
          strain_ue: Array.from({ length: 40 }, (_, i) => i * 6.5 + Math.random() * 2),
          table_data: Array.from({ length: 40 }, (_, i) => ({
            timestamp: `10:15:${i < 10 ? '0' + i : i}`,
            load_kPa: i * 1.5 + Math.random() * 0.5,
            settlement_1_mm: i * 0.15 + Math.random() * 0.05,
            strain_ue: i * 6.5 + Math.random() * 2,
            crack_detected: i > 30
          }))
        }
      };
      return new Response(JSON.stringify(mockHist), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // PROMIX MOCKS
    if (urlStr.includes("/api/materials")) {
      return new Response(JSON.stringify(PROMIX_MATERIALS), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/economics")) {
      return new Response(JSON.stringify(PROMIX_ECONOMICS), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/benchmarks")) {
      return new Response(JSON.stringify(PROMIX_BENCHMARKS), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/calculate")) {
      const data = await options.body ? JSON.parse(options.body) : {};
      const mix_type = data.mix_type || "normal";
      const inputs = data.inputs || {};
      
      mixTraceCounter++;
      const trace_id = `MX-${new Date().getFullYear()}-${String(mixTraceCounter).padStart(6, '0')}`;
      
      const results = mix_type === "normal" ? calculateNormalMix(inputs) : calculateGeopolymerMix(inputs);
      const validation = validateMix(mix_type, inputs, results, data.platform_mode || "compliance");
      const review = generateReview(mix_type, inputs, results);

      return new Response(JSON.stringify({
        trace_id, mix_type, inputs, results, validation, review,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/optimize")) {
      const data = await options.body ? JSON.parse(options.body) : {};
      const result = optimizeMix(data.inputs || {}, data.objective || "balanced");
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/recommend-grade")) {
      const data = await options.body ? JSON.parse(options.body) : {};
      const exposure = data.exposure || "severe";
      const strength = parseFloat(data.target_strength || 30);
      const rule = PROMIX_DURABILITY[exposure] || PROMIX_DURABILITY["severe"];
      const rec = {
        min_grade: `M${Math.max(parseInt(rule.min_grade.replace("M","")), Math.ceil(strength/5)*5)}`,
        max_wc: rule.max_wc,
        min_binder: rule.min_cement,
        source: "IS 456:2000 Table 5"
      };
      return new Response(JSON.stringify(rec), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/api/calibrate")) {
      const data = await options.body ? JSON.parse(options.body) : {};
      const trial_logs = data.trial_logs || [];
      const factors = trial_logs.map(log => parseFloat(log.actual_28d) / parseFloat(log.target_28d)).filter(f => !isNaN(f));
      const avg = factors.length ? (factors.reduce((a,b)=>a+b, 0) / factors.length) : 1.0;
      return new Response(JSON.stringify({ average_factor: avg, factors: factors, count: factors.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // CROP RECOMMENDATION AUDIO & WEATHER MOCKS
    if (urlStr.includes("/get_audio")) {
      const data = await options.body ? JSON.parse(options.body) : {};
      const text = data.text || "";
      const lang = data.lang || "en-IN";
      console.log(`Simulating Audio Speech for: "${text}" in language: ${lang}`);
      speakText(text, lang);
      // Return a tiny valid silent 1-second WAV data URI so the player element plays silently without errors
      const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
      return new Response(JSON.stringify({ audio_url: silentWav, translated_text: text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.includes("/get_weather")) {
      const dummyForecast = {
        Advisory: {
          max_temp_3days: (28.5 + Math.random() * 4).toFixed(1),
          rain_prob: Math.round(10 + Math.random() * 60),
          alerts: ["⛅ High Humidity Warning"],
          advice: "Favorable conditions. Maintain standard irrigation intervals."
        }
      };
      return new Response(JSON.stringify(dummyForecast), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Fall back to original fetch for external requests (like OpenMeteo etc.)
    return originalFetch.apply(this, arguments);
  };

  // ==========================================
  // 5. INTERCEPT SOCKET.IO COMPACTION (PORT 5002)
  // ==========================================
  window.io = function () {
    console.log("Mock Socket.IO client initiated.");
    const listeners = {};
    
    const socket = {
      on: function (event, callback) {
        listeners[event] = callback;
      },
      emit: function (event, data) {
        console.log(`Socket emit [${event}]:`, data);
      }
    };

    // Compaction simulator loop
    let current_lat = 23.022500;
    let current_lng = 72.571400;
    let stepCount = 0;
    
    setInterval(() => {
      if (!listeners["roller_update"]) return;
      
      stepCount++;
      const speed = 2.9 + Math.random() * 0.5; // Target is 3.2
      const thickness = 145 + Math.random() * 10; // Target is 150
      
      // Gradually build CMV to simulate compaction passes
      let cmv = 28 + (stepCount % 15) * 1.5 + Math.random() * 2;
      
      let color = "blue";
      let message = "COMPACTION IN PROGRESS";
      
      if (cmv > 45.0) {
        color = "green";
        message = "COMPACTION OPTIMAL";
      }
      if (cmv > 65.0) {
        color = "red";
        message = "WARNING: OVER-COMPACTION RISK";
      }
      if (speed < 2.9 || speed > 3.5) {
        color = "red";
        message = `WARNING: ADJUST SPEED (TARGET 3.2 km/h)`;
      }
      
      const payload = {
        lat: current_lat,
        lng: current_lng,
        speed: speed,
        cmv: parseFloat(cmv.toFixed(1)),
        thickness: parseFloat(thickness.toFixed(1)),
        color: color,
        message: message
      };
      
      listeners["roller_update"](payload);
      current_lat += 0.000005;
    }, 450); // ~2.2Hz

    return socket;
  };

  // Helper download QA report for compaction
  window.downloadQAReport = function() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Latitude,Longitude,Speed_kmh,CMV,Thickness_mm,Status\n"
      + `${new Date().toISOString()},23.022500,72.571400,3.2,46.2,148,OPTIMAL\n`
      + `${new Date().toISOString()},23.022505,72.571400,3.1,47.0,151,OPTIMAL\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Site_Alpha_QA_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
})();
