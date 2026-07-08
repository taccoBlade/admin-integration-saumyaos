function validateMix(mix_type, inputs, results, platform_mode = "compliance") {
    const checklist = {};
    let passed_count = 0;
    const total_checks = 6;

    const vol_total = results.absolute_volume_total ? results.absolute_volume_total.value : 0.0;
    const vol_balanced = vol_total >= 0.99 && vol_total <= 1.01;
    checklist.volume_balanced = {
        status: vol_balanced,
        message: vol_balanced ? `Absolute volume total is ${vol_total.toFixed(3)} m³ (Target: 1.00 ± 0.01)` : `Volume mismatch: ${vol_total.toFixed(3)} m³ (Must be 1.00 ± 0.01)`
    };
    if (vol_balanced) passed_count++;

    let sgs_valid = true;
    const missing_fields = [];
    const sg_fields = mix_type === "normal" 
        ? ["sg_cement", "sg_ca", "sg_fa"] 
        : ["sg_fly_ash", "sg_ggbs", "sg_ca", "sg_fa", "sg_ss", "sg_sh"];
        
    for (let field of sg_fields) {
        let val = parseFloat(inputs[field] || 0);
        if (val <= 0) {
            sgs_valid = false;
            missing_fields.push(field);
        }
    }
            
    checklist.material_data_complete = {
        status: sgs_valid,
        message: sgs_valid ? "All specific gravity inputs are complete and valid." : `Missing/Invalid SGs for: ${missing_fields.join(', ')}`
    };
    if (sgs_valid) passed_count++;

    if (mix_type === "normal") {
        const grade = parseFloat(inputs.grade || 30);
        const wc_ratio = parseFloat(inputs.wc_ratio || 0.45);
        const is10262_compliant = grade >= 10 && grade <= 60 && wc_ratio >= 0.30 && wc_ratio <= 0.60;
        
        checklist.is_10262_compliant = {
            status: is10262_compliant,
            message: is10262_compliant ? "Grade M10-M60 and W/C ratio within standard guidelines." : "Grade must be M10-M60 and W/C ratio 0.30-0.60."
        };
        if (is10262_compliant) passed_count++;

        const exposure = (inputs.exposure || "severe").toLowerCase().replace(/ /g, "_");
        const rules = getDurabilityRules();
        const rule = rules[exposure] || rules["severe"];
        
        const min_cement = rule.min_cement;
        const max_wc = rule.max_wc;
        const min_grade_num = parseInt(rule.min_grade.replace("M", ""));
        
        const calc_cement = results.cement_content ? results.cement_content.value : 0.0;
        
        const wc_ok = wc_ratio <= max_wc;
        const cement_ok = calc_cement >= min_cement;
        const grade_ok = grade >= min_grade_num;
        
        const is_456_ok = wc_ok && cement_ok && grade_ok;
        
        const fail_msgs = [];
        if (!wc_ok) fail_msgs.push(`W/C ratio exceeds max allowed ${max_wc}`);
        if (!cement_ok) fail_msgs.push(`Binder content ${calc_cement.toFixed(1)} < minimum ${min_cement}`);
        if (!grade_ok) fail_msgs.push(`Grade M${grade} < minimum M${min_grade_num} for ${exposure}`);
        
        checklist.is_456_compliant = {
            status: is_456_ok,
            message: is_456_ok ? "Durability requirements satisfied (IS 456 Table 5)." : fail_msgs.join("; ")
        };
        if (is_456_ok) passed_count++;

        const pct_fa = parseFloat(inputs.fly_ash_percent || 0);
        const pct_ggbs = parseFloat(inputs.ggbs_percent || 0);
        const pct_sf = parseFloat(inputs.silica_fume_percent || 0);
        const pct_mk = parseFloat(inputs.metakaolin_percent || 0);
        const pct_cement = parseFloat(inputs.cement_percent !== undefined ? inputs.cement_percent : 100.0 - (pct_fa + pct_ggbs + pct_sf + pct_mk));
        
        const is_cement_limit_ok = pct_cement >= 20;
        checklist.cement_limit_satisfied = {
            status: is_cement_limit_ok,
            message: is_cement_limit_ok ? "Cement forms at least 20% of binder." : "WARNING: Cement percentage is dangerously low (<20%)."
        };
        if (is_cement_limit_ok) passed_count++;

        const ca_ratio = results.coarse_agg_ratio ? results.coarse_agg_ratio.value : 0;
        const fa_ratio = results.fine_agg_ratio ? results.fine_agg_ratio.value : 0;
        
        const binder_admix_sum = pct_fa + pct_ggbs + pct_sf + pct_mk;
        const binder_total = binder_admix_sum + pct_cement;
        const binder_sum_ok = Math.abs(binder_total - 100.0) < 0.01;
        
        const agg_ok = (ca_ratio >= 0.30 && ca_ratio <= 0.80 && fa_ratio >= 0.20 && fa_ratio <= 0.70 && binder_admix_sum <= 100.0 && binder_sum_ok);
        
        const msg_parts = [];
        if (!(ca_ratio >= 0.30 && ca_ratio <= 0.80 && fa_ratio >= 0.20 && fa_ratio <= 0.70)) {
            msg_parts.push(`Unusual aggregate split: CA=${ca_ratio.toFixed(3)}, FA=${fa_ratio.toFixed(3)}`);
        } else {
            msg_parts.push(`Aggregates balanced: CA=${ca_ratio.toFixed(3)}, FA=${fa_ratio.toFixed(3)}`);
        }
            
        if (binder_admix_sum > 100.0) msg_parts.push(`Binder admixture split ${binder_admix_sum}% exceeds 100% limit`);
        if (!binder_sum_ok) msg_parts.push(`Binder percentages sum to ${binder_total}% (must be 100%)`);
            
        checklist.aggregate_ratios_valid = {
            status: agg_ok,
            message: msg_parts.join("; ")
        };
        if (agg_ok) passed_count++;

    } else {
        checklist.is_10262_compliant = { status: true, message: "N/A - Calculated using Pavithra et al. (2016) Geopolymer Engine." };
        passed_count++;

        checklist.is_456_compliant = { status: true, message: "N/A - Standard IS 456 durability limits do not govern Geopolymers." };
        passed_count++;

        checklist.cement_limit_satisfied = { status: true, message: "PASSED - 100% Cement-free Geopolymer mix." };
        passed_count++;

        const ca_pct = parseFloat(inputs.ca_percent || 65.0);
        const fa_pct = parseFloat(inputs.fa_percent || 35.0);
        const agg_sum_ok = Math.abs((ca_pct + fa_pct) - 100.0) < 0.01;
        
        const fa_binder = parseFloat(inputs.fly_ash_percent || 0.0);
        const ggbs_binder = parseFloat(inputs.ggbs_percent || 0.0);
        const mk_binder = parseFloat(inputs.metakaolin_percent || 0.0);
        const rha_binder = parseFloat(inputs.rice_husk_ash_percent || 0.0);
        const sf_binder = parseFloat(inputs.silica_fume_percent || 0.0);
        const binder_sum = fa_binder + ggbs_binder + mk_binder + rha_binder + sf_binder;
        const binder_ok = Math.abs(binder_sum - 100.0) < 0.01;

        const agg_ok = agg_sum_ok && binder_ok;
        const msg_parts = [];
        if (!agg_sum_ok) msg_parts.push(`Aggregate sum is ${ca_pct + fa_pct}% (Must be 100%)`);
        if (!binder_ok) msg_parts.push(`Binder composition sum is ${binder_sum}% (Must be 100%)`);
            
        checklist.aggregate_ratios_valid = {
            status: agg_ok,
            message: agg_ok ? "Aggregate splits and binder ratios sum correctly to 100%." : `Validation failed: ${msg_parts.join(', ')}`
        };
        if (agg_ok) passed_count++;
    }

    return {
        checklist: checklist,
        score: `${passed_count}/${total_checks}`,
        passed_all: passed_count === total_checks
    };
}


function getDurabilityRules() {
    return {
        "mild": { min_grade: "M20", min_cement: 300, max_wc: 0.55 },
        "moderate": { min_grade: "M25", min_cement: 300, max_wc: 0.50 },
        "severe": { min_grade: "M30", min_cement: 320, max_wc: 0.45 },
        "very_severe": { min_grade: "M35", min_cement: 340, max_wc: 0.45 },
        "extreme": { min_grade: "M40", min_cement: 360, max_wc: 0.40 }
    };
}

function recommendGrade(exposure, target_strength) {
    const rules = getDurabilityRules();
    const exposure_lower = exposure.toLowerCase().replace(/ /g, "_");
    const rule = rules[exposure_lower];
    
    if (!rule) {
        return { error: `Exposure '${exposure}' not found in durability rules` };
    }
        
    let min_grade_val = parseInt(rule.min_grade.replace("M", "")) || 20;
    
    let targetInt = parseInt(target_strength) || 20;
    let remainder = targetInt % 5;
    let targetAdjusted = targetInt + (remainder !== 0 ? 5 - remainder : 0);
    
    let rec_grade_val = Math.max(min_grade_val, targetAdjusted);
    let rec_grade = "M" + rec_grade_val;
    
    return {
        min_grade: rec_grade,
        max_wc: rule.max_wc,
        min_binder: rule.min_cement,
        source: "IS 456:2000 Table 5"
    };
}

function optimizeMix(currentInputs, objective = "balanced") {
    // Requires validateMix to exist (will port validation_engine shortly)
    const candidates = [];
    
    const COMPATIBILITY_RULES = KNOWLEDGE_BASE.compatibility_rules || { max_total_scm_replacement: 70 };
    const max_total_scm = COMPATIBILITY_RULES.max_total_scm_replacement || 70;
    
    for (let opc = 40; opc <= 100; opc += 5) {
        for (let fa = 0; fa <= 35; fa += 5) {
            for (let ggbs = 0; ggbs <= 70; ggbs += 5) {
                for (let sf = 0; sf <= 10; sf += 5) {
                    for (let mk = 0; mk <= 10; mk += 5) {
                        if (opc + fa + ggbs + sf + mk === 100) {
                            const total_scm = fa + ggbs + sf + mk;
                            if (total_scm > max_total_scm) continue;
                            
                            const inputs = Object.assign({}, currentInputs);
                            inputs.cement_percent = opc;
                            inputs.fly_ash_percent = fa;
                            inputs.ggbs_percent = ggbs;
                            inputs.silica_fume_percent = sf;
                            inputs.metakaolin_percent = mk;
                            
                            try {
                                const results = calculateNormalMix(inputs);
                                const validation = validateMix("normal", inputs, results, "compliance");
                                
                                if (validation.checklist.is_456_compliant.status && validation.checklist.aggregate_ratios_valid.status) {
                                    const cost = results.economics && results.economics.total_cost ? results.economics.total_cost.value : 0;
                                    const co2 = results.economics && results.economics.total_co2 ? results.economics.total_co2.value : 0;
                                    const binder_content = results.cement_content ? results.cement_content.value : 0;
                                    
                                    candidates.push({
                                        binder_split: { cement: opc, fly_ash: fa, ggbs: ggbs, silica_fume: sf, metakaolin: mk },
                                        cost: cost,
                                        co2: co2,
                                        binder_content: binder_content
                                    });
                                }
                            } catch (e) {
                                // ignore
                            }
                        }
                    }
                }
            }
        }
    }
    
    if (candidates.length === 0) return { candidates: [] };
    
    let current_cost = 1, current_co2 = 1;
    try {
        const current_results = calculateNormalMix(currentInputs);
        if (current_results.economics && current_results.economics.total_cost) current_cost = current_results.economics.total_cost.value;
        if (current_results.economics && current_results.economics.total_co2) current_co2 = current_results.economics.total_co2.value;
    } catch(e) { }
    
    const max_cost = Math.max(...candidates.map(c => c.cost)) || 1;
    const max_co2 = Math.max(...candidates.map(c => c.co2)) || 1;
    
    for (let c of candidates) {
        c.delta_cost_pct = current_cost ? ((c.cost - current_cost) / current_cost) * 100 : 0;
        c.delta_co2_pct = current_co2 ? ((c.co2 - current_co2) / current_co2) * 100 : 0;
        
        if (objective === "min_cost") {
            c.score = c.cost;
        } else if (objective === "min_co2") {
            c.score = c.co2;
        } else {
            let binder_efficiency = Math.min(Math.max((c.binder_content - 300) / 200, 0), 1);
            c.score = 0.4 * (c.cost / max_cost) + 0.4 * (c.co2 / max_co2) + 0.2 * (1.0 - binder_efficiency);
        }
    }
    
    candidates.sort((a, b) => a.score - b.score);
    return { candidates: candidates.slice(0, 3) };
}

function evaluateAggregateBlend(sieve_data_10mm, sieve_data_20mm, pct_10mm, pct_20mm) {
    const ideal = { s475: 48.7, s236: 34.4, s118: 24.3, s600: 17.3, s300: 12.2, s150: 8.7 };
    const combined = {};
    let deviations = 0;
    
    for (let sieve in ideal) {
        let val_10 = sieve_data_10mm[sieve] || 0;
        let val_20 = sieve_data_20mm[sieve] || 0;
        let comb_val = (pct_10mm / 100) * val_10 + (pct_20mm / 100) * val_20;
        combined[sieve] = comb_val;
        deviations += Math.abs(comb_val - ideal[sieve]);
    }
    
    let score = 100 - (deviations / 6);
    score = Math.max(0, Math.min(100, score));
    
    let rating;
    if (score >= 90) rating = "Excellent";
    else if (score >= 75) rating = "Good";
    else if (score >= 60) rating = "Acceptable";
    else rating = "Needs Improvement";
    
    return {
        score: score,
        rating: rating,
        combined_grading: combined,
        ideal_grading: ideal
    };
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
    
    const sg_fa = parseFloat(inputs.sg_fly_ash || getSg("binders", "Fly Ash Class F"));
    const sg_ggbs = parseFloat(inputs.sg_ggbs || getSg("binders", "GGBS"));
    const sg_mk = parseFloat(inputs.sg_metakaolin || getSg("binders", "Metakaolin"));
    const sg_rha = parseFloat(inputs.sg_rice_husk_ash || 2.10);
    const sg_sf = parseFloat(inputs.sg_silica_fume || getSg("binders", "Silica Fume"));
    
    const sg_ca = parseFloat(inputs.sg_ca || getSg("coarse_aggregates", "20 mm"));
    const sg_fa_aggregate = parseFloat(inputs.sg_fa || getSg("fine_aggregates", "River Sand"));
    
    const sg_ss = parseFloat(inputs.sg_ss || 1.60);
    const sg_sh = parseFloat(inputs.sg_sh || 1.50);
    
    const wa_ca = parseFloat(inputs.wa_ca || 0.5);
    const fm_ca = parseFloat(inputs.fm_ca || 0.0);
    const wa_fa = parseFloat(inputs.wa_fa || 1.0);
    const fm_fa = parseFloat(inputs.fm_fa || 2.0);

    const econ = inputs.economics || MATERIAL_ECONOMICS || {};
    const getEcon = (key, prop, def) => {
        if (econ[key] && econ[key][prop] !== undefined) return parseFloat(econ[key][prop]);
        if (MATERIAL_ECONOMICS && MATERIAL_ECONOMICS[key] && MATERIAL_ECONOMICS[key][prop] !== undefined) return parseFloat(MATERIAL_ECONOMICS[key][prop]);
        return def;
    };

    const cost_fa_b = getEcon("fly_ash", "cost", 1.2);
    const co2_fa_b = getEcon("fly_ash", "co2", 0.02);
    const cost_ggbs = getEcon("ggbs", "cost", 3.5);
    const co2_ggbs = getEcon("ggbs", "co2", 0.07);
    const cost_mk = getEcon("metakaolin", "cost", 12.0);
    const co2_mk = getEcon("metakaolin", "co2", 0.12);
    const cost_rha = getEcon("rice_husk_ash", "cost", 2.5);
    const co2_rha = getEcon("rice_husk_ash", "co2", 0.03);
    const cost_sf = getEcon("silica_fume", "cost", 25.0);
    const co2_sf = getEcon("silica_fume", "co2", 0.15);
    
    const cost_ca = getEcon("ca", "cost", 1.4);
    const co2_ca = getEcon("ca", "co2", 0.008);
    const cost_fa_agg = getEcon("fa", "cost", 1.6);
    const co2_fa_agg = getEcon("fa", "co2", 0.015);
    
    const cost_ss = getEcon("sodium_silicate", "cost", 15.0);
    const co2_ss = getEcon("sodium_silicate", "co2", 0.30);
    const cost_sh = getEcon("sodium_hydroxide", "cost", 18.0);
    const co2_sh = getEcon("sodium_hydroxide", "co2", 0.35);
    const cost_water = getEcon("water", "cost", 0.05);
    const co2_water = getEcon("water", "co2", 0.0001);

    const results = {};

    const mass_agg = density * 0.80;
    results.total_aggregate_mass = { value: mass_agg, source: "Pavithra et al. (2016) Step 2", revision: "2016" };

    const mass_ca_ssd = mass_agg * (ca_percent / 100.0);
    const mass_fa_ssd = mass_agg * (fa_percent / 100.0);

    results.mass_ca_ssd = { value: mass_ca_ssd, source: "Pavithra et al. (2016) Step 2", revision: "2016" };
    results.mass_fa_ssd = { value: mass_fa_ssd, source: "Pavithra et al. (2016) Step 2", revision: "2016" };

    const mass_paste = density - mass_agg;
    results.total_paste_mass = { value: mass_paste, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    const mass_binder = mass_paste / (1.0 + aas_binder_ratio);
    results.total_binder_mass = { value: mass_binder, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    const mass_aas = mass_paste - mass_binder;
    results.total_activator_mass = { value: mass_aas, source: "Pavithra et al. (2016) Step 3", revision: "2016" };

    const m_fly_ash = mass_binder * (fa_percent_binder / 100.0);
    const m_ggbs = mass_binder * (ggbs_percent / 100.0);
    const m_metakaolin = mass_binder * (mk_percent / 100.0);
    const m_rice_husk_ash = mass_binder * (rha_percent / 100.0);
    const m_silica_fume = mass_binder * (sf_percent / 100.0);

    results.mass_fly_ash = { value: m_fly_ash, source: "Binder Partitioning", revision: "2016" };
    results.mass_ggbs = { value: m_ggbs, source: "Binder Partitioning", revision: "2016" };
    results.mass_metakaolin = { value: m_metakaolin, source: "Binder Partitioning", revision: "2016" };
    results.mass_rice_husk_ash = { value: m_rice_husk_ash, source: "Binder Partitioning", revision: "2016" };
    results.mass_silica_fume = { value: m_silica_fume, source: "Binder Partitioning", revision: "2016" };

    const mass_sh = mass_aas / (1.0 + ss_sh_ratio);
    const mass_ss = mass_aas - mass_sh;

    results.mass_sh_solution = { value: mass_sh, source: "Pavithra et al. (2016) Step 4", revision: "2016" };
    results.mass_ss_solution = { value: mass_ss, source: "Pavithra et al. (2016) Step 4", revision: "2016" };

    const naoh_composition = {
        "8M": { solids: 26.2, water: 73.8 },
        "12M": { solids: 36.1, water: 63.9 },
        "16M": { solids: 44.4, water: 55.6 }
    };
    const naoh_limits = naoh_composition[naoh_molarity] || naoh_composition["12M"];
    const naoh_solids_pct = naoh_limits.solids;
    const naoh_water_pct = naoh_limits.water;

    const water_total = (mass_sh * (naoh_water_pct / 100.0)) + (mass_ss * 0.5124) + extra_water;
    const solids_total = mass_binder + (mass_sh * (naoh_solids_pct / 100.0)) + (mass_ss * 0.4876);
    const w_gs_ratio = water_total / solids_total;

    results.water_total = { value: water_total, source: "Pavithra et al. (2016) Step 5", revision: "2016" };
    results.solids_total = { value: solids_total, source: "Pavithra et al. (2016) Step 5", revision: "2016" };
    results.w_gs_ratio = { value: w_gs_ratio, source: "Pavithra et al. (2016) Step 5", revision: "2016" };

    const v_binders = (
        (sg_fa > 0 ? m_fly_ash / (sg_fa * 1000.0) : 0) +
        (sg_ggbs > 0 ? m_ggbs / (sg_ggbs * 1000.0) : 0) +
        (sg_mk > 0 ? m_metakaolin / (sg_mk * 1000.0) : 0) +
        (sg_rha > 0 ? m_rice_husk_ash / (sg_rha * 1000.0) : 0) +
        (sg_sf > 0 ? m_silica_fume / (sg_sf * 1000.0) : 0)
    );
    const v_ss = mass_ss / (sg_ss * 1000.0);
    const v_sh = mass_sh / (sg_sh * 1000.0);
    const v_ca = mass_ca_ssd / (sg_ca * 1000.0);
    const v_fa = mass_fa_ssd / (sg_fa_aggregate * 1000.0);
    const v_extra_water = extra_water / 1000.0;
    
    const total_volume = v_binders + v_ss + v_sh + v_ca + v_fa + v_extra_water;
    results.absolute_volume_total = { value: total_volume, source: "Volumetric Sum check", revision: "2016" };

    const ca_correction_ratio = (fm_ca - wa_ca) / 100.0;
    const fa_correction_ratio = (fm_fa - wa_fa) / 100.0;
    
    const mass_ca_site = mass_ca_ssd * (1.0 + ca_correction_ratio);
    const mass_fa_site = mass_fa_ssd * (1.0 + fa_correction_ratio);
    
    const contributed_water = (mass_ca_ssd * ca_correction_ratio) + (mass_fa_ssd * fa_correction_ratio);
    const mass_aas_site = mass_aas - contributed_water;

    results.mass_ca_site = { value: mass_ca_site, source: "Moisture Corrections", revision: "2016" };
    results.mass_fa_site = { value: mass_fa_site, source: "Moisture Corrections", revision: "2016" };
    results.mass_aas_site = { value: mass_aas_site, source: "Moisture Corrections", revision: "2016" };

    const cost_binders = (m_fly_ash * cost_fa_b) + (m_ggbs * cost_ggbs) + (m_metakaolin * cost_mk) + (m_rice_husk_ash * cost_rha) + (m_silica_fume * cost_sf);
    const cost_solution_ss = mass_ss * cost_ss;
    const cost_solution_sh = mass_sh * cost_sh;
    const cost_ca_ssd_calc = mass_ca_ssd * cost_ca;
    const cost_fa_ssd_calc = mass_fa_ssd * cost_fa_agg;
    const cost_ext_water = extra_water * cost_water;
    const total_cost = cost_binders + cost_solution_ss + cost_solution_sh + cost_ca_ssd_calc + cost_fa_ssd_calc + cost_ext_water;

    const co2_binders = (m_fly_ash * co2_fa_b) + (m_ggbs * co2_ggbs) + (m_metakaolin * co2_mk) + (m_rice_husk_ash * co2_rha) + (m_silica_fume * co2_sf);
    const co2_solution_ss = mass_ss * co2_ss;
    const co2_solution_sh = mass_sh * co2_sh;
    const co2_ca_ssd_calc = mass_ca_ssd * co2_ca;
    const co2_fa_ssd_calc = mass_fa_ssd * co2_fa_agg;
    const co2_ext_water = extra_water * co2_water;
    const total_co2 = co2_binders + co2_solution_ss + co2_solution_sh + co2_ca_ssd_calc + co2_fa_ssd_calc + co2_ext_water;

    results.economics = {
        total_cost: { value: total_cost, source: "Cost Estimate", revision: "2016" },
        total_co2: { value: total_co2, source: "CO2 Emissions", revision: "2016" },
        breakdown: {
            cost: { binders: cost_binders, ss: cost_solution_ss, sh: cost_solution_sh, ca: cost_ca_ssd_calc, fa: cost_fa_ssd_calc },
            co2: { binders: co2_binders, ss: co2_solution_ss, sh: co2_solution_sh, ca: co2_ca_ssd_calc, fa: co2_fa_ssd_calc }
        }
    };

    return results;
}


function getSg(category, name) {
    if (KNOWLEDGE_BASE[category] && KNOWLEDGE_BASE[category][name]) {
        return KNOWLEDGE_BASE[category][name].typical_sg || KNOWLEDGE_BASE[category][name].sg || 2.7;
    }
    return 2.7; // Fallback
}

function getMaterialProperty(category, name, prop) {
    if (KNOWLEDGE_BASE[category] && KNOWLEDGE_BASE[category][name]) {
        return KNOWLEDGE_BASE[category][name][prop];
    }
    return null;
}

function calculateNormalMix(inputs) {
    const results = {};
    const warnings = [];
    
    const calc_mode = inputs.calculation_mode || "Strict IS 10262";
    
    const fck = parseFloat(inputs.grade || 30);
    const msa = parseInt(inputs.msa || 20);
    const slump = parseFloat(inputs.slump || 100);
    const agg_shape = inputs.agg_shape || "angular";
    
    const admixture_product = inputs.admixture_product || "Generic SP (IS 10262 Reference)";
    let sp_percent = 0.0;
    let sp_dosage = 0.0;
    
    if (admixture_product === "None") {
        sp_percent = 0.0;
        sp_dosage = 0.0;
    } else {
        if (inputs.sp_percent !== undefined && inputs.sp_percent !== null && inputs.sp_percent !== "") {
            sp_percent = parseFloat(inputs.sp_percent);
        } else {
            sp_percent = parseFloat(getMaterialProperty("admixtures", admixture_product, "recommended_reduction"));
        }
        
        if (inputs.sp_dosage !== undefined && inputs.sp_dosage !== null && inputs.sp_dosage !== "") {
            sp_dosage = parseFloat(inputs.sp_dosage);
        } else {
            const rng = getMaterialProperty("admixtures", admixture_product, "typical_dosage_range") || [0.8, 1.2];
            sp_dosage = (rng[0] + rng[1]) / 2.0;
        }
        
        const max_dosage = parseFloat(getMaterialProperty("admixtures", admixture_product, "maximum_dosage"));
        if (sp_dosage > max_dosage) {
            warnings.push(`Admixture dosage (${sp_dosage}%) exceeds manufacturer maximum (${max_dosage}%).`);
        }
    }
    
    const wc_ratio = parseFloat(inputs.wc_ratio || 0.45);
    const fa_zone = inputs.fa_zone || "II";
    const is_pumped = inputs.is_pumped === true || inputs.is_pumped === "true";
    
    const cement_type = inputs.cement_type || "OPC 43";
    const fa_type = inputs.fa_type || "River Sand";
    const ca_type = inputs.ca_type || "20 mm";
    
    const sg_cement = parseFloat(inputs.sg_cement || getSg("binders", cement_type));
    const sg_fa_b = parseFloat(inputs.sg_fly_ash || getSg("binders", "Fly Ash Class F"));
    const sg_ggbs = parseFloat(inputs.sg_ggbs || getSg("binders", "GGBS"));
    const sg_sf = parseFloat(inputs.sg_silica_fume || getSg("binders", "Silica Fume"));
    const sg_mk = parseFloat(inputs.sg_metakaolin || getSg("binders", "Metakaolin"));
    
    const sg_ca = parseFloat(inputs.sg_ca || getSg("coarse_aggregates", ca_type));
    const sg_fa = parseFloat(inputs.sg_fa || getSg("fine_aggregates", fa_type));
    
    let sg_adm = 1.0;
    if (admixture_product !== "None") {
        sg_adm = parseFloat(inputs.sg_admixture || getMaterialProperty("admixtures", admixture_product, "typical_sg") || 1.145);
    }
    
    let wa_ca = parseFloat(inputs.wa_ca || 0.0);
    let fm_ca = parseFloat(inputs.fm_ca || 0.0);
    let wa_fa = parseFloat(inputs.wa_fa || 0.0);
    let fm_fa = parseFloat(inputs.fm_fa || 0.0);

    const pct_fa = parseFloat(inputs.fly_ash_percent || 0);
    const pct_ggbs = parseFloat(inputs.ggbs_percent || 0);
    const pct_sf = parseFloat(inputs.silica_fume_percent || 0);
    const pct_mk = parseFloat(inputs.metakaolin_percent || 0);
    const pct_cement = parseFloat(inputs.cement_percent !== undefined ? inputs.cement_percent : 100.0 - (pct_fa + pct_ggbs + pct_sf + pct_mk));

    const econ = inputs.economics || MATERIAL_ECONOMICS || {};
    const getEcon = (key, prop, def) => {
        if (econ[key] && econ[key][prop] !== undefined) return parseFloat(econ[key][prop]);
        if (MATERIAL_ECONOMICS && MATERIAL_ECONOMICS[key] && MATERIAL_ECONOMICS[key][prop] !== undefined) return parseFloat(MATERIAL_ECONOMICS[key][prop]);
        return def;
    };

    const cost_c = getEcon("cement", "cost", 7.0);
    const co2_c = getEcon("cement", "co2", 0.90);
    const cost_fa_b = getEcon("fly_ash", "cost", 1.2);
    const co2_fa_b = getEcon("fly_ash", "co2", 0.02);
    const cost_ggbs = getEcon("ggbs", "cost", 3.5);
    const co2_ggbs = getEcon("ggbs", "co2", 0.07);
    const cost_sf = getEcon("silica_fume", "cost", 25.0);
    const co2_sf = getEcon("silica_fume", "co2", 0.15);
    const cost_mk = getEcon("metakaolin", "cost", 12.0);
    const co2_mk = getEcon("metakaolin", "co2", 0.12);
    const cost_w = getEcon("water", "cost", 0.05);
    const co2_w = getEcon("water", "co2", 0.0001);
    const cost_ca = getEcon("ca", "cost", 1.4);
    const co2_ca = getEcon("ca", "co2", 0.008);
    const cost_fa = getEcon("fa", "cost", 1.6);
    const co2_fa = getEcon("fa", "co2", 0.015);
    const cost_adm = getEcon("admixture", "cost", 80.0);
    const co2_adm = getEcon("admixture", "co2", 0.25);

    if (warnings.length > 0) {
        results.warnings = warnings;
    }

    let s_val, x_val;
    if (fck <= 15) { s_val = 3.5; x_val = 5.0; }
    else if (fck <= 25) { s_val = 4.0; x_val = 5.5; }
    else if (fck <= 55) { s_val = 5.0; x_val = 6.5; }
    else { s_val = 6.0; x_val = 8.0; }

    const fck_eq1 = fck + (1.65 * s_val);
    const fck_eq2 = fck + x_val;
    const target_strength = Math.max(fck_eq1, fck_eq2);

    results.target_strength = { value: target_strength, source: "IS 10262:2019 Clause 4.2", revision: "2019" };

    let v_air_percent = 1.0;
    if (msa === 10) v_air_percent = 1.5;
    else if (msa === 40) v_air_percent = 0.8;
    
    const v_air = v_air_percent / 100.0;
    results.air_content = { value: v_air, source: "IS 10262:2019 Table 3", revision: "2019" };

    let w_base = 186.0;
    if (msa === 10) w_base = 208.0;
    else if (msa === 40) w_base = 165.0;

    results.base_water = { value: w_base, source: "IS 10262:2019 Table 4", revision: "2019" };

    const slump_dev = slump - 50.0;
    const w_slump_adj = (slump_dev / 25.0) * 0.03 * w_base;
    const w_slump = w_base + w_slump_adj;
    
    const shape_reductions = {
        "angular": 0.0,
        "sub-angular": -10.0,
        "gravel-crushed": -15.0,
        "rounded": -20.0
    };
    const w_shape_adj = shape_reductions[agg_shape] || 0.0;
    const w_before_sp = w_slump + w_shape_adj;

    const w_final = w_before_sp * (1.0 - (sp_percent / 100.0));
    
    results.water_content = { value: w_final, source: "IS 10262:2019 Clause 5.3 Note 3", revision: "2019" };

    const base_binder_content = w_final / wc_ratio;
    const cm_increase = parseFloat(inputs.cm_increase_percent || 0);
    const binder_content = base_binder_content * (1.0 + (cm_increase / 100.0));
    
    results.cement_content = { value: binder_content, source: "IS 10262:2019 Clause 5.4 (Modified per Annex B)", revision: "2019" };

    const mass_cement = binder_content * (pct_cement / 100.0);
    const mass_fa_b = binder_content * (pct_fa / 100.0);
    const mass_ggbs = binder_content * (pct_ggbs / 100.0);
    const mass_sf = binder_content * (pct_sf / 100.0);
    const mass_mk = binder_content * (pct_mk / 100.0);

    results.mass_cement_ssd = { value: mass_cement, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results.mass_fly_ash_ssd = { value: mass_fa_b, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results.mass_ggbs_ssd = { value: mass_ggbs, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results.mass_silica_fume_ssd = { value: mass_sf, source: "IS 10262:2019 Clause 5.4", revision: "2019" };
    results.mass_metakaolin_ssd = { value: mass_mk, source: "IS 10262:2019 Clause 5.4", revision: "2019" };

    const v_ca_lookup = {
        10: { "I": 0.48, "II": 0.50, "III": 0.52, "IV": 0.54 },
        20: { "I": 0.60, "II": 0.62, "III": 0.64, "IV": 0.66 },
        40: { "I": 0.69, "II": 0.71, "III": 0.72, "IV": 0.73 }
    };
    
    let v_ca_base = 0.62;
    if (v_ca_lookup[msa] && v_ca_lookup[msa][fa_zone]) {
        v_ca_base = v_ca_lookup[msa][fa_zone];
    }
    
    const effective_w_cm_ratio = w_final / binder_content;
    const v_ca_adjusted = v_ca_base + ((0.50 - effective_w_cm_ratio) / 0.05) * 0.01;
    const v_ca_final = is_pumped ? v_ca_adjusted * 0.90 : v_ca_adjusted;
    const v_fa_final = 1.0 - v_ca_final;

    results.coarse_agg_ratio = { value: v_ca_final, source: "IS 10262:2019 Table 5", revision: "2019" };
    results.fine_agg_ratio = { value: v_fa_final, source: "IS 10262:2019 Clause 5.5.2", revision: "2019" };

    const v_c = mass_cement / (sg_cement * 1000.0);
    const v_fa_b_v = sg_fa_b > 0 ? mass_fa_b / (sg_fa_b * 1000.0) : 0;
    const v_ggbs_v = sg_ggbs > 0 ? mass_ggbs / (sg_ggbs * 1000.0) : 0;
    const v_sf_v = sg_sf > 0 ? mass_sf / (sg_sf * 1000.0) : 0;
    const v_mk_v = sg_mk > 0 ? mass_mk / (sg_mk * 1000.0) : 0;
    const v_binder_total = v_c + v_fa_b_v + v_ggbs_v + v_sf_v + v_mk_v;

    const v_w = w_final / 1000.0;
    const admixture_mass = binder_content * (sp_dosage / 100.0);
    const v_adm = admixture_mass / (sg_adm * 1000.0);
    
    const v_agg = 1.0 - (v_air + v_binder_total + v_w + v_adm);
    results.volume_all_aggregates = { value: v_agg, source: "IS 10262:2019 Clause 5.6", revision: "2019" };

    const mass_ca_ssd = v_agg * v_ca_final * sg_ca * 1000.0;
    const mass_fa_ssd = v_agg * v_fa_final * sg_fa * 1000.0;

    results.mass_water_ssd = { value: w_final, source: "IS 10262:2019 Clause 5.3", revision: "2019" };
    results.mass_ca_ssd = { value: mass_ca_ssd, source: "IS 10262:2019 Clause 5.6", revision: "2019" };
    results.mass_fa_ssd = { value: mass_fa_ssd, source: "IS 10262:2019 Clause 5.6", revision: "2019" };
    results.mass_admixture_ssd = { value: admixture_mass, source: "IS 10262:2019 Clause 5.6", revision: "2019" };

    results.absolute_volume_total = {
        value: v_binder_total + v_w + v_adm + v_agg + v_air,
        source: "IS 10262:2019 Clause 5.6 Balance Check",
        revision: "2019"
    };

    const ca_correction_ratio = (fm_ca - wa_ca) / 100.0;
    const fa_correction_ratio = (fm_fa - wa_fa) / 100.0;
    
    const mass_ca_site = mass_ca_ssd * (1.0 + ca_correction_ratio);
    const mass_fa_site = mass_fa_ssd * (1.0 + fa_correction_ratio);
    
    const contributed_water = (mass_ca_ssd * ca_correction_ratio) + (mass_fa_ssd * fa_correction_ratio);
    const added_water_site = w_final - contributed_water;

    results.mass_ca_site = { value: mass_ca_site, source: "IS 10262:2019 Clause 7", revision: "2019" };
    results.mass_fa_site = { value: mass_fa_site, source: "IS 10262:2019 Clause 7", revision: "2019" };
    results.mass_water_site = { value: added_water_site, source: "IS 10262:2019 Clause 7", revision: "2019" };

    const cost_cement = mass_cement * cost_c;
    const cost_fa_b_total = mass_fa_b * cost_fa_b;
    const cost_ggbs_total = mass_ggbs * cost_ggbs;
    const cost_sf_total = mass_sf * cost_sf;
    const cost_mk_total = mass_mk * cost_mk;
    const cost_binders = cost_cement + cost_fa_b_total + cost_ggbs_total + cost_sf_total + cost_mk_total;

    const cost_water = w_final * cost_w;
    const cost_ca_ssd = mass_ca_ssd * cost_ca;
    const cost_fa_ssd = mass_fa_ssd * cost_fa;
    const cost_sp = admixture_mass * cost_adm;
    const total_cost = cost_binders + cost_water + cost_ca_ssd + cost_fa_ssd + cost_sp;

    const co2_cement = mass_cement * co2_c;
    const co2_fa_b_total = mass_fa_b * co2_fa_b;
    const co2_ggbs_total = mass_ggbs * co2_ggbs;
    const co2_sf_total = mass_sf * co2_sf;
    const co2_mk_total = mass_mk * co2_mk;
    const co2_binders = co2_cement + co2_fa_b_total + co2_ggbs_total + co2_sf_total + co2_mk_total;

    const co2_water = w_final * co2_w;
    const co2_ca_ssd = mass_ca_ssd * co2_ca;
    const co2_fa_ssd = mass_fa_ssd * co2_fa;
    const co2_sp = admixture_mass * co2_adm;
    const total_co2 = co2_binders + co2_water + co2_ca_ssd + co2_fa_ssd + co2_sp;

    results.economics = {
        total_cost: { value: total_cost, source: "Cost Estimate", revision: "2019" },
        total_co2: { value: total_co2, source: "CO2 Emissions", revision: "2019" },
        breakdown: {
            cost: { cement: cost_cement, fly_ash: cost_fa_b_total, ggbs: cost_ggbs_total, silica_fume: cost_sf_total, metakaolin: cost_mk_total, water: cost_water, ca: cost_ca_ssd, fa: cost_fa_ssd, admixture: cost_sp },
            co2: { cement: co2_cement, fly_ash: co2_fa_b_total, ggbs: co2_ggbs_total, silica_fume: co2_sf_total, metakaolin: co2_mk_total, water: co2_water, ca: co2_ca_ssd, fa: co2_fa_ssd, admixture: co2_sp }
        }
    };

    return results;
}


const KNOWLEDGE_BASE = {
  "binders": {
    "OPC 33": {
      "name": "Ordinary Portland Cement Grade 33",
      "typical_sg": 3.15,
      "measured_sg": null,
      "bulk_density": 1440.0,
      "source": "IS 10262 Typical Value",
      "early_strength": "Low",
      "recommended_replacement_max": 100,
      "durability_flags": {
        "marine_excellent": false
      }
    },
    "OPC 43": {
      "name": "Ordinary Portland Cement Grade 43",
      "typical_sg": 3.15,
      "measured_sg": null,
      "bulk_density": 1440.0,
      "source": "IS 10262 Typical Value",
      "early_strength": "Medium",
      "recommended_replacement_max": 100,
      "durability_flags": {
        "marine_excellent": false
      }
    },
    "OPC 53": {
      "name": "Ordinary Portland Cement Grade 53",
      "typical_sg": 3.15,
      "measured_sg": null,
      "bulk_density": 1440.0,
      "source": "IS 10262 Typical Value",
      "early_strength": "High",
      "recommended_replacement_max": 100,
      "durability_flags": {
        "marine_excellent": false
      }
    },
    "PPC": {
      "name": "Portland Pozzolana Cement",
      "typical_sg": 2.9,
      "measured_sg": null,
      "bulk_density": 1300.0,
      "source": "Typical Engineering Value",
      "early_strength": "Low",
      "recommended_replacement_max": 100,
      "durability_flags": {
        "marine_excellent": true
      }
    },
    "Fly Ash Class F": {
      "name": "Class F Fly Ash (Pozzolanic)",
      "typical_sg": 2.2,
      "measured_sg": null,
      "bulk_density": 1100.0,
      "source": "Typical Engineering Value",
      "early_strength": "Slow",
      "recommended_replacement_max": 35,
      "durability_flags": {
        "sulfate_resistant": true
      }
    },
    "GGBS": {
      "name": "Ground Granulated Blast-Furnace Slag",
      "typical_sg": 2.9,
      "measured_sg": null,
      "bulk_density": 1200.0,
      "source": "Typical Engineering Value",
      "early_strength": "Moderate",
      "recommended_replacement_max": 70,
      "durability_flags": {
        "marine_excellent": true,
        "sulfate_resistant": true
      }
    },
    "Silica Fume": {
      "name": "Silica Fume",
      "typical_sg": 2.2,
      "measured_sg": null,
      "bulk_density": 600.0,
      "source": "Typical Engineering Value",
      "early_strength": "Very High",
      "recommended_replacement_max": 10,
      "durability_flags": {
        "high_strength": true
      }
    },
    "Metakaolin": {
      "name": "Metakaolin",
      "typical_sg": 2.6,
      "measured_sg": null,
      "bulk_density": 800.0,
      "source": "Typical Engineering Value",
      "early_strength": "High",
      "recommended_replacement_max": 15,
      "durability_flags": {
        "alkali_silica_mitigation": true
      }
    }
  },
  "fine_aggregates": {
    "River Sand": {
      "name": "Natural River Sand",
      "typical_sg": 2.6,
      "measured_sg": null,
      "typical_moisture": 2.0,
      "absorption": 1.0,
      "source": "Typical Material Default"
    },
    "M Sand Zone I": {
      "name": "Manufactured Sand - Zone I",
      "typical_sg": 2.65,
      "measured_sg": null,
      "typical_moisture": 1.0,
      "absorption": 1.5,
      "source": "Typical Material Default"
    },
    "M Sand Zone II": {
      "name": "Manufactured Sand - Zone II",
      "typical_sg": 2.65,
      "measured_sg": null,
      "typical_moisture": 1.0,
      "absorption": 1.5,
      "source": "Typical Material Default"
    }
  },
  "coarse_aggregates": {
    "10 mm": {
      "name": "Crushed Aggregate 10mm",
      "typical_sg": 2.7,
      "measured_sg": null,
      "typical_moisture": 0.5,
      "absorption": 0.5,
      "source": "Typical Material Default"
    },
    "20 mm": {
      "name": "Crushed Aggregate 20mm",
      "typical_sg": 2.74,
      "measured_sg": null,
      "typical_moisture": 0.5,
      "absorption": 0.5,
      "source": "Typical Material Default"
    }
  },
  "admixtures": {
    "Superplasticizer": {
      "MasterGlenium SKY 8233": {
        "typical_sg": 1.145,
        "measured_sg": null,
        "typical_dosage_range": [
          0.8,
          1.5
        ],
        "maximum_dosage": 2.0,
        "typical_water_reduction_range": [
          18,
          30
        ],
        "recommended_reduction": 20,
        "source": "Manufacturer Data (MasterBuilders)"
      },
      "Sika ViscoCrete 20 HE": {
        "typical_sg": 1.08,
        "measured_sg": null,
        "typical_dosage_range": [
          0.2,
          2.0
        ],
        "maximum_dosage": 2.5,
        "typical_water_reduction_range": [
          20,
          35
        ],
        "recommended_reduction": 25,
        "source": "Manufacturer Data (Sika)"
      },
      "Generic SP (IS 10262 Reference)": {
        "typical_sg": 1.145,
        "measured_sg": null,
        "typical_dosage_range": [
          0.5,
          1.5
        ],
        "maximum_dosage": 2.0,
        "typical_water_reduction_range": [
          15,
          25
        ],
        "recommended_reduction": 20,
        "source": "IS 10262 Annex Assumptions"
      }
    },
    "Plasticizer": {
      "Generic Water Reducer": {
        "typical_sg": 1.2,
        "measured_sg": null,
        "typical_dosage_range": [
          0.3,
          0.8
        ],
        "maximum_dosage": 1.5,
        "typical_water_reduction_range": [
          5,
          12
        ],
        "recommended_reduction": 10,
        "source": "Typical Engineering Value"
      }
    },
    "None": {
      "None": {
        "typical_sg": 1.0,
        "measured_sg": null,
        "typical_dosage_range": [
          0.0,
          0.0
        ],
        "maximum_dosage": 0.0,
        "typical_water_reduction_range": [
          0,
          0
        ],
        "recommended_reduction": 0,
        "source": "N/A"
      }
    }
  }
};
const MATERIAL_ECONOMICS = {
  "OPC 33": {
    "cost": 6.5,
    "co2": 0.9
  },
  "OPC 43": {
    "cost": 7.0,
    "co2": 0.9
  },
  "OPC 53": {
    "cost": 7.5,
    "co2": 0.9
  },
  "PPC": {
    "cost": 6.0,
    "co2": 0.6
  },
  "PSC": {
    "cost": 5.8,
    "co2": 0.5
  },
  "Fly Ash Class F": {
    "cost": 1.2,
    "co2": 0.02
  },
  "Fly Ash Class C": {
    "cost": 1.5,
    "co2": 0.03
  },
  "GGBS": {
    "cost": 3.5,
    "co2": 0.07
  },
  "Metakaolin": {
    "cost": 12.0,
    "co2": 0.12
  },
  "Silica Fume": {
    "cost": 25.0,
    "co2": 0.15
  },
  "Rice Husk Ash": {
    "cost": 2.5,
    "co2": 0.03
  },
  "River Sand": {
    "cost": 2.0,
    "co2": 0.01
  },
  "M Sand Zone I": {
    "cost": 1.5,
    "co2": 0.015
  },
  "M Sand Zone II": {
    "cost": 1.6,
    "co2": 0.015
  },
  "M Sand Zone III": {
    "cost": 1.7,
    "co2": 0.015
  },
  "10 mm": {
    "cost": 1.3,
    "co2": 0.008
  },
  "20 mm": {
    "cost": 1.4,
    "co2": 0.008
  },
  "40 mm": {
    "cost": 1.5,
    "co2": 0.008
  },
  "NaOH": {
    "cost": 18.0,
    "co2": 0.35
  },
  "KOH": {
    "cost": 28.0,
    "co2": 0.45
  },
  "Sodium Silicate": {
    "cost": 15.0,
    "co2": 0.3
  },
  "Potassium Silicate": {
    "cost": 26.0,
    "co2": 0.4
  },
  "Superplasticizer": {
    "cost": 80.0,
    "co2": 0.25
  },
  "Water": {
    "cost": 0.05,
    "co2": 0.0001
  }
};


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
  defaultEcon = MATERIAL_ECONOMICS || {};
}

// Fetch materials
async function fetchMaterials() {
  materialsDb = KNOWLEDGE_BASE || {};
  initializeActiveBinders(activeTheme);
  renderBinderCards();
  renderMaterialSelectors();
    renderAdmixtures();
}

function renderAdmixtures() {
  const select = document.getElementById("admixture_product");
  if (!select || !materialsDb.admixtures) return;
  select.innerHTML = "";
  
  let firstVal = null;
  
  Object.keys(materialsDb.admixtures).forEach(cat => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = cat;
    Object.keys(materialsDb.admixtures[cat]).forEach(prod => {
      const opt = document.createElement("option");
      opt.value = prod;
      opt.innerText = prod;
      opt.dataset.cat = cat;
      optgroup.appendChild(opt);
      if(!firstVal) firstVal = prod;
    });
    select.appendChild(optgroup);
  });
  
  if (firstVal) {
    select.value = firstVal;
    handleAdmixtureChange();
  }
}

function handleAdmixtureChange() {
  const select = document.getElementById("admixture_product");
  if (!select || select.selectedIndex === -1) return;
  const prod = select.value;
  const opt = select.options[select.selectedIndex];
  if (!opt) return;
  const cat = opt.dataset.cat;
  
  if (cat && materialsDb.admixtures[cat] && materialsDb.admixtures[cat][prod]) {
    const data = materialsDb.admixtures[cat][prod];
    
    document.getElementById("admixture_provenance").innerText = data.source === "N/A" ? "" : "Source: " + data.source;
    
    const doseHint = document.getElementById("dosage-range-hint");
    if (doseHint) {
      if (data.maximum_dosage > 0) {
        doseHint.innerText = `(Typical: ${data.typical_dosage_range[0]}-${data.typical_dosage_range[1]}%, Max: ${data.maximum_dosage}%)`;
      } else {
        doseHint.innerText = "";
      }
    }
    
    const recHint = document.getElementById("reduction-range-hint");
    if (recHint) {
      if (data.recommended_reduction > 0) {
        recHint.innerText = `(Recommended: ${data.recommended_reduction}%, Range: ${data.typical_water_reduction_range[0]}-${data.typical_water_reduction_range[1]}%)`;
      } else {
        recHint.innerText = "";
      }
    }
    
    // Auto-update values
    document.getElementById("sp_percent").value = data.recommended_reduction;
    document.getElementById("sp-perc-val").innerText = data.recommended_reduction + "%";
    
    // Average dosage
    document.getElementById("sp_dosage").value = ((data.typical_dosage_range[0] + data.typical_dosage_range[1]) / 2).toFixed(2);
    
    runCalculations();
  }
}

async function fetchBenchmarks() {
  benchmarkLibrary = []; // Handled entirely local now
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
}

// Set theme
function setTheme(theme) {
  activeTheme = theme;
  document.body.setAttribute('data-theme', theme);
  
  const btnNormal = document.getElementById('btn-normal');
  if (btnNormal && btnNormal.classList) btnNormal.classList.toggle('active', theme === 'normal');
  const btnGeo = document.getElementById('btn-geopolymer');
  if (btnGeo && btnGeo.classList) btnGeo.classList.toggle('active', theme === 'geopolymer');

  const cardNormal = document.getElementById('inputs-normal-card');
  if (cardNormal && cardNormal.classList) cardNormal.classList.toggle('hidden', theme === 'geopolymer');
  const cardGeo = document.getElementById('inputs-geopolymer-card');
  if (cardGeo && cardGeo.classList) cardGeo.classList.toggle('hidden', theme === 'normal');

  // Update report status
  const statusBadge = document.getElementById("report-status");
  const confBadge = document.getElementById("calc-confidence");
  
  if (statusBadge && confBadge) {
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
  }

  initializeActiveBinders(theme);
  renderBinderCards();
  renderMaterialSelectors();
  runSieveAnalysis();
}

function setMode(mode) {
  platformMode = mode;
  const compEl = document.getElementById('mode-compliance');
  if (compEl && compEl.classList) compEl.classList.toggle('active', mode === 'compliance');
  const resEl = document.getElementById('mode-research');
  if (resEl && resEl.classList) resEl.classList.toggle('active', mode === 'research');
  
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
  if (!container) return;
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

// Automatically update estimated W/C ratio based on grade, then calculate
function handleGradeChange() {
  const grade = parseInt(document.getElementById('grade').value) || 30;
  let estimatedWC = 0.45;
  
  if (grade <= 15) estimatedWC = 0.60;
  else if (grade <= 20) estimatedWC = 0.55;
  else if (grade <= 25) estimatedWC = 0.50;
  else if (grade <= 30) estimatedWC = 0.45;
  else if (grade <= 35) estimatedWC = 0.41;
  else if (grade <= 40) estimatedWC = 0.38;
  else if (grade <= 45) estimatedWC = 0.35;
  else if (grade <= 50) estimatedWC = 0.32;
  else if (grade <= 55) estimatedWC = 0.30;
  else estimatedWC = 0.28;
  
  const wcInput = document.getElementById('wc_ratio');
  wcInput.value = estimatedWC;
  
  // Highlight the change to the user visually
  wcInput.style.transition = "background-color 0.3s";
  wcInput.style.backgroundColor = "rgba(var(--accent-rgb), 0.2)";
  setTimeout(() => { wcInput.style.backgroundColor = "var(--input-bg)"; }, 800);
  
  runCalculations();
}

function handleGradeChange_noCalc() {
  const grade = parseInt(document.getElementById('grade').value) || 30;
  let estimatedWC = 0.45;
  
  if (grade <= 15) estimatedWC = 0.60;
  else if (grade <= 20) estimatedWC = 0.55;
  else if (grade <= 25) estimatedWC = 0.50;
  else if (grade <= 30) estimatedWC = 0.45;
  else if (grade <= 35) estimatedWC = 0.41;
  else if (grade <= 40) estimatedWC = 0.38;
  else if (grade <= 45) estimatedWC = 0.35;
  else if (grade <= 50) estimatedWC = 0.32;
  else if (grade <= 55) estimatedWC = 0.30;
  else estimatedWC = 0.28;
  
  const wcInput = document.getElementById('wc_ratio');
  wcInput.value = estimatedWC;
  
  // Highlight the change to the user visually
  wcInput.style.transition = "background-color 0.3s";
  wcInput.style.backgroundColor = "rgba(var(--accent-rgb), 0.2)";
  setTimeout(() => { wcInput.style.backgroundColor = "var(--input-bg)"; }, 800);
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
      return materialsDb.binders && materialsDb.binders[active.id] ? (materialsDb.binders[active.id].typical_sg || materialsDb.binders[active.id].sg || defaultSg) : defaultSg;
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
    
    const cm_increase_el = document.getElementById("cm_increase_percent");
    if (cm_increase_el) {
        payload.inputs.cm_increase_percent = parseFloat(cm_increase_el.value) || 0;
    }

    const calcMode = document.getElementById("calculation_mode");
    if (calcMode) {
      payload.inputs.calculation_mode = calcMode.value;
    }
    
    const admProd = document.getElementById("admixture_product");
    if (admProd) {
      payload.inputs.admixture_product = admProd.value;
    }

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
      const results = activeTheme === 'normal' 
          ? calculateNormalMix(payload.inputs) 
          : calculateGeopolymerMix(payload.inputs);
      
      const validation = validateMix(activeTheme, payload.inputs, results, "compliance");
      
      const data = {
          inputs: payload.inputs,
          results: results,
          validation: validation,
          timestamp: new Date().toLocaleTimeString(),
          trace_id: "MX-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      };

      calculationData = data;
      
      if (activeTheme === 'normal') {
        lastNormalResults = data;
      } else {
        lastGeopolymerResults = data;
      }
      
      renderOutputs(data);
    } catch (err) {
      console.error("Calculation Error:", err);
    }
}

// Render dynamic elements
function renderOutputs(data) {
  const mixId = document.getElementById("mix-id");
  if (mixId) mixId.innerText = data.trace_id;
  const timestamp = document.getElementById("timestamp");
  if (timestamp) timestamp.innerText = `Calculated: ${data.timestamp}`;

  const results = data.results;
  const validation = data.validation;

  // 1. Checklist
  const valScore = document.getElementById("val-score");
  if (valScore) valScore.innerText = validation.score;
  const checklistBox = document.getElementById("checklist-items");
  if (checklistBox) {
    checklistBox.innerHTML = "";
    for (let key in validation.checklist) {
      const item = validation.checklist[key];
      const itemDiv = document.createElement("div");
      itemDiv.className = `checklist-item ${item.status ? 'pass' : 'fail'}`;
      itemDiv.innerHTML = `<span class="checklist-icon">${item.status ? "✓" : "✗"}</span><span class="body-xs">${formatChecklistLabel(key)}: ${item.message}</span>`;
      checklistBox.appendChild(itemDiv);
    }
    
    if (data.warnings && data.warnings.length > 0) {
      data.warnings.forEach(warn => {
        const wDiv = document.createElement("div");
        wDiv.className = `checklist-item fail`;
        wDiv.innerHTML = `<span class="checklist-icon">⚠️</span><span class="body-xs">Warning: ${warn}</span>`;
        checklistBox.appendChild(wDiv);
      });
    }
  }

  // 2. Volume Balance Tag
  const balTag = document.getElementById("vol-balanced-tag");
  if (balTag) {
    const volBalanced = validation.checklist.volume_balanced.status;
    balTag.className = volBalanced ? "badge badge-success" : "badge badge-error";
    balTag.innerText = volBalanced ? "Volume Balanced" : "Volume Imbalance";
  }

  // 3. Methodology & Assumptions Log
  const assumptionsBox = document.getElementById("assumptions-log");
  if (assumptionsBox) {
    assumptionsBox.innerHTML = "";
    renderAssumptions(assumptionsBox, data.inputs);
  }

  // 4. Yield Proportions Table
  renderProportionsTable(results);

  // 5. Update Donut Chart
  try { updateChart(results); } catch(e){}

  // 6. Step-by-Step Calculation Trail
  try { renderCalculationTrail(results); } catch(e){}

  // 7. Render validation evidence board actuals & deviations
  try { renderValidationEvidence(results); } catch(e){}

  // 8. Render Sustainability parameters (Total Cost & Carbon)
  try { renderSustainability(results); } catch(e){}

  // 9. Update Mix Comparison Grid
  try { renderMixComparison(); } catch(e){}

  // 10. Render AI Reviewer
  if (data.review) {
    try { renderReviewer(data.review); } catch(e){}
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

  const ur = lastUserCalculatedResults?.results;
  const ui = lastUserCalculatedResults?.inputs;
  const or = lastOptimizedResults?.results;
  const oi = lastOptimizedResults?.inputs;

  const uCost = ur?.economics?.total_cost?.value;
  const oCost = or?.economics?.total_cost?.value;
  setCell("comp-cost-conv", uCost ? uCost.toFixed(1) : null, " ₹");
  setCell("comp-cost-geo", oCost ? oCost.toFixed(1) : null, " ₹");
  setDelta("comp-cost-delta", uCost, oCost);

  const uCo2 = ur?.economics?.total_co2?.value;
  const oCo2 = or?.economics?.total_co2?.value;
  setCell("comp-co2-conv", uCo2 ? uCo2.toFixed(0) : null, " kg");
  setCell("comp-co2-geo", oCo2 ? oCo2.toFixed(0) : null, " kg");
  setDelta("comp-co2-delta", uCo2, oCo2);

  const uBinder = ur?.cement_content?.value;
  const oBinder = or?.cement_content?.value;
  setCell("comp-binder-conv", uBinder ? uBinder.toFixed(1) : null, " kg");
  setCell("comp-binder-geo", oBinder ? oBinder.toFixed(1) : null, " kg");
  setDelta("comp-binder-delta", uBinder, oBinder);

  const uWater = ur?.mass_water_ssd?.value;
  const oWater = or?.mass_water_ssd?.value;
  setCell("comp-water-conv", uWater ? uWater.toFixed(1) : null, " kg");
  setCell("comp-water-geo", oWater ? oWater.toFixed(1) : null, " kg");
  setDelta("comp-water-delta", uWater, oWater);

  const uOpc = ui ? (100 - (parseFloat(ui.fly_ash_percent)||0) - (parseFloat(ui.ggbs_percent)||0) - (parseFloat(ui.silica_fume_percent)||0) - (parseFloat(ui.metakaolin_percent)||0)) : null;
  const oOpc = oi ? (100 - (parseFloat(oi.fly_ash_percent)||0) - (parseFloat(oi.ggbs_percent)||0) - (parseFloat(oi.silica_fume_percent)||0) - (parseFloat(oi.metakaolin_percent)||0)) : null;
  setCell("comp-opc-conv", uOpc !== null ? uOpc.toFixed(0) : null, "%");
  setCell("comp-opc-geo", oOpc !== null ? oOpc.toFixed(0) : null, "%");
  setDelta("comp-opc-delta", uOpc, oOpc);

  const uFa = ui ? (parseFloat(ui.fly_ash_percent)||0) : null;
  const oFa = oi ? (parseFloat(oi.fly_ash_percent)||0) : null;
  setCell("comp-fa-conv", uFa !== null ? uFa.toFixed(0) : null, "%");
  setCell("comp-fa-geo", oFa !== null ? oFa.toFixed(0) : null, "%");
  setDelta("comp-fa-delta", uFa, oFa);

  const uGgbs = ui ? (parseFloat(ui.ggbs_percent)||0) : null;
  const oGgbs = oi ? (parseFloat(oi.ggbs_percent)||0) : null;
  setCell("comp-ggbs-conv", uGgbs !== null ? uGgbs.toFixed(0) : null, "%");
  setCell("comp-ggbs-geo", oGgbs !== null ? oGgbs.toFixed(0) : null, "%");
  setDelta("comp-ggbs-delta", uGgbs, oGgbs);

  const uWc = ui?.wc_ratio;
  const oWc = oi?.wc_ratio;
  setCell("comp-wc-conv", uWc ? parseFloat(uWc).toFixed(2) : null);
  setCell("comp-wc-geo", oWc ? parseFloat(oWc).toFixed(2) : null);
  setDelta("comp-wc-delta", uWc, oWc);

  const uSlump = ui?.slump;
  const oSlump = oi?.slump;
  setCell("comp-slump-conv", uSlump ? parseFloat(uSlump).toFixed(0) : null);
  setCell("comp-slump-geo", oSlump ? parseFloat(oSlump).toFixed(0) : null);
  setDelta("comp-slump-delta", uSlump, oSlump);

  const getDensity = (r) => {
    if (!r) return null;
    return (
        (r.mass_cement_ssd?.value || 0) +
        (r.mass_fly_ash_ssd?.value || 0) +
        (r.mass_ggbs_ssd?.value || 0) +
        (r.mass_silica_fume_ssd?.value || 0) +
        (r.mass_metakaolin_ssd?.value || 0) +
        (r.mass_water_ssd?.value || 0) +
        (r.mass_ca_ssd?.value || 0) +
        (r.mass_fa_ssd?.value || 0) +
        (r.mass_admixture_ssd?.value || 0)
    );
  };
  const uDensity = getDensity(ur);
  const oDensity = getDensity(or);
  setCell("comp-density-conv", uDensity ? uDensity.toFixed(0) : null);
  setCell("comp-density-geo", oDensity ? oDensity.toFixed(0) : null);
  setDelta("comp-density-delta", uDensity, oDensity);
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
    const data = optimizeMix(inputs, objective);
    
    if (data.error || !data.candidates || data.candidates.length === 0) {
      statusEl.innerText = 'No Mix Found';
      statusEl.className = 'badge badge-error';
      resultsEl.innerHTML = `<div class="text-dim body-xs">${data.error || "No valid mixes"}</div>`;
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
  if (c.binder_split.cement > 0) activeBinders.push({ id: "OPC 53", pct: c.binder_split.cement });
  if (c.binder_split.fly_ash > 0) activeBinders.push({ id: "Fly Ash Class F", pct: c.binder_split.fly_ash });
  if (c.binder_split.ggbs > 0) activeBinders.push({ id: "GGBS", pct: c.binder_split.ggbs });
  if (c.binder_split.silica_fume > 0) activeBinders.push({ id: "Silica Fume", pct: c.binder_split.silica_fume });
  if (c.binder_split.metakaolin > 0) activeBinders.push({ id: "Metakaolin", pct: c.binder_split.metakaolin });
  
  renderBinderCards();
  renderMaterialSelectors();
  if (activeTheme === 'normal') updateBinderSum('normal');
  else updateBinderSum('geo');
  runCalculations();
  
  if (calculationData) {
    lastOptimizedResults = JSON.parse(JSON.stringify(calculationData));
    renderMixComparison();
    const compPanel = document.getElementById('comp-panel');
    if (compPanel) compPanel.style.display = 'flex';
  }
}

// === Grade Recommendation ===
async function runGradeRecommendation() {
  const exposure = document.getElementById('rec-exposure').value;
  const strength = parseFloat(document.getElementById('rec-strength').value) || 30;
  
  try {
    const data = recommendGrade(exposure, strength);
    
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

// Global variables for comparison
let lastUserCalculatedResults = null;
let lastOptimizedResults = null;

function calculateUserMix() {
  runCalculations();
  if (calculationData) {
    lastUserCalculatedResults = JSON.parse(JSON.stringify(calculationData));
    // Reset optimized results on new user calculation so comparison waits for optimizer run
    lastOptimizedResults = null;
    renderMixComparison();
  }
}





