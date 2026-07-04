import fs from "fs";
import path from "path";
import { createSupabaseAdminClient } from "../lib/supabase/admin";
import { editorialSpreads } from "../data/photos";

const root = process.cwd();

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(root, fileName);
    if (!fs.existsSync(filePath)) continue;

    const contents = fs.readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] ??= value;
    }
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  loadLocalEnv();

  const supabase = createSupabaseAdminClient();
  console.log("Starting full database seeding of SAUMYA.OS...");

  // ────────────────────────────────────────────────────────────────────────────
  // 1. SEED HERO
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingHero } = await supabase.from("hero").select("id").limit(1);
  if (!existingHero || existingHero.length === 0) {
    console.log("Seeding Hero section...");
    const { error: heroErr } = await supabase.from("hero").insert({
      title: "Saumya",
      tagline: "Computational Design & Geotechnical Site Telemetry",
      subtitle: "Computational Infrastructure Engineer",
      description: "Building intelligent infrastructure systems through civil engineering, data analysis, automation, and computational design. Specializing in concrete mix proportioning compliance and geotechnical site telemetry.",
      cta_text: "View Projects",
      cta_url: "#projects",
      secondary_cta_text: "Resume",
      secondary_cta_url: "#",
      status: "published",
      version: 1
    });
    if (heroErr) console.error("Error seeding Hero:", heroErr.message);
    else console.log("Hero section seeded successfully!");
  } else {
    console.log("Hero section already contains data. Skipping.");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. SEED ABOUT
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingAbout } = await supabase.from("about").select("id").limit(1);
  if (!existingAbout || existingAbout.length === 0) {
    console.log("Seeding About section...");
    const { error: aboutErr } = await supabase.from("about").insert({
      title: "Current Focus",
      eyebrow: "Now",
      focus_cards_json: [
        {
          title: "B.Tech Civil Engineering",
          description: "Specializing in structural design, concrete mix technology, and geotechnical automation."
        },
        {
          title: "Infrastructure Automation",
          description: "Integrating IoT telemetry sensors, computer vision compliance checks, and Python solvers into civil workflows."
        }
      ],
      obsessions_json: [
        "High-Strength Geopolymer Concrete",
        "Real-time Geotechnical Telemetry",
        "Intelligent Compaction Algorithms",
        "Computer Vision Aggregate Grading",
        "Neovim Config Optimization",
        "Parallel-twin Cylinder Performance"
      ],
      status: "published",
      version: 1
    });
    if (aboutErr) console.error("Error seeding About:", aboutErr.message);
    else console.log("About section seeded successfully!");
  } else {
    console.log("About section already contains data. Skipping.");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. SEED TIMELINE EVENTS
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingEvents } = await supabase.from("timeline_events").select("id").limit(1);
  if (!existingEvents || existingEvents.length === 0) {
    console.log("Seeding Timeline events...");
    const staticEvents = [
      {
        slug: "edu-pdeu",
        year: 2024,
        title: "Started B.Tech in Civil Engineering — PDEU",
        description: "Began academic specialization in structural, geotechnical, transportation, and construction engineering.",
        event_type: "Education",
        status: "published",
        sort_order: 1
      },
      {
        slug: "exp-brahmand",
        year: 2025,
        title: "Brahmand Club Content Writer & Creative Team",
        description: "Produced technical and promotional content for university events.",
        event_type: "Experience",
        status: "published",
        sort_order: 2
      },
      {
        slug: "exp-cssi",
        year: 2025,
        title: "CSSI Internship",
        description: "Community development and social infrastructure initiatives.",
        event_type: "Experience",
        status: "published",
        sort_order: 3
      }
    ];

    const { error: timelineErr } = await supabase.from("timeline_events").insert(staticEvents);
    if (timelineErr) console.error("Error seeding Timeline:", timelineErr.message);
    else console.log("Timeline events seeded successfully!");
  } else {
    console.log("Timeline already contains data. Skipping.");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. SEED SKILLS & TAXONOMY TERMS
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingSkills } = await supabase.from("skills").select("id").limit(1);
  if (!existingSkills || existingSkills.length === 0) {
    console.log("Seeding Skill categories & Skills...");

    const categories = ["Core Engineering", "Programming", "Research", "Creative"];
    const { data: catRows, error: catErr } = await supabase
      .from("taxonomy_terms")
      .upsert(
        categories.map((cat, index) => ({
          taxonomy_type: "skill_category",
          slug: slugify(cat),
          name: cat,
          sort_order: index
        })),
        { onConflict: "taxonomy_type,slug" }
      )
      .select("id,name");

    if (catErr) {
      console.error("Error seeding Skill categories:", catErr.message);
    } else {
      const catIdByName = new Map((catRows ?? []).map(r => [r.name, r.id]));

      const baseSkills = [
        { name: "Concrete Technology", category: "Core Engineering", baseStrength: 9, sort: 1 },
        { name: "Construction Materials", category: "Core Engineering", baseStrength: 8, sort: 2 },
        { name: "Concrete Mix Design", category: "Core Engineering", baseStrength: 9, sort: 3 },
        { name: "Surveying", category: "Core Engineering", baseStrength: 8, sort: 4 },
        { name: "Engineering Software", category: "Core Engineering", baseStrength: 8, sort: 5 },
        { name: "QGIS", category: "Core Engineering", baseStrength: 8, sort: 6 },
        { name: "Python", category: "Programming", baseStrength: 9, sort: 7 },
        { name: "Flask", category: "Programming", baseStrength: 8, sort: 8 },
        { name: "OpenCV", category: "Programming", baseStrength: 8, sort: 9 },
        { name: "Arduino", category: "Programming", baseStrength: 8, sort: 10 },
        { name: "Embedded Systems", category: "Research", baseStrength: 8, sort: 11 },
        { name: "Sensor Integration", category: "Research", baseStrength: 8, sort: 12 },
        { name: "IoT", category: "Research", baseStrength: 8, sort: 13 },
        { name: "Computer Vision", category: "Research", baseStrength: 8, sort: 14 },
        { name: "Infrastructure Automation", category: "Research", baseStrength: 8, sort: 15 },
        { name: "Photography", category: "Creative", baseStrength: 7, sort: 16 },
        { name: "Cinematography", category: "Creative", baseStrength: 8, sort: 17 },
        { name: "Video Editing", category: "Creative", baseStrength: 8, sort: 18 },
        { name: "Graphic Design", category: "Creative", baseStrength: 7, sort: 19 }
      ];

      const skillPayloads = baseSkills.map(s => ({
        slug: slugify(s.name),
        name: s.name,
        category_term_id: catIdByName.get(s.category) || null,
        base_strength: s.baseStrength,
        display_strength: s.baseStrength,
        featured: true,
        sort_order: s.sort,
        status: "published"
      }));

      const { error: skillErr } = await supabase.from("skills").insert(skillPayloads);
      if (skillErr) console.error("Error seeding Skills:", skillErr.message);
      else console.log("Skills seeded successfully!");
    }
  } else {
    console.log("Skills already contain data. Skipping.");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. SEED RESEARCH ENTRIES
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingResearch } = await supabase.from("research_entries").select("id").limit(1);
  if (!existingResearch || existingResearch.length === 0) {
    console.log("Seeding Research entries...");
    const fallbackLiterature = [
      {
        slug: "ref-1",
        title: "Theoretical Soil Mechanics",
        summary: "One-dimensional consolidation calculations and pore pressure deflection equations.",
        abstract: "Analysis of soil consolidation and pore water pressure dissipation in clayey strata.",
        author: "Terzaghi, K.",
        date_label: "1943",
        published_date: "1943-01-01",
        status: "published"
      },
      {
        slug: "ref-2",
        title: "Properties of Concrete",
        summary: "Water-cement ratio parameters, aggregate grading limits, and geopolymerization boundaries.",
        abstract: "Fundamental text on fresh and hardened concrete properties, hydration mechanisms, and admixtures.",
        author: "Neville, A. M.",
        date_label: "2011",
        published_date: "2011-01-01",
        status: "published"
      },
      {
        slug: "ref-3",
        title: "IRC:37-2018 Flexible Pavement Design",
        summary: "Resilient modulus (MR) mapping of subgrade soil compaction characteristics.",
        abstract: "Guidelines for the design of flexible pavements using mechanistic-empirical design guidelines.",
        author: "Indian Roads Congress",
        date_label: "2018",
        published_date: "2018-01-01",
        status: "published"
      }
    ];

    const { error: resErr } = await supabase.from("research_entries").insert(fallbackLiterature);
    if (resErr) console.error("Error seeding Research entries:", resErr.message);
    else console.log("Research entries seeded successfully!");
  } else {
    console.log("Research entries already exist. Skipping.");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 6. SEED PHOTO SPREADS AND MEDIA ASSETS
  // ────────────────────────────────────────────────────────────────────────────
  const { data: existingSpreads } = await supabase.from("photo_spreads").select("id").limit(1);
  if (!existingSpreads || existingSpreads.length === 0) {
    console.log("Seeding Photo spreads and underlying Media Assets...");

    // Collect all unique photo paths
    const uniquePhotoSrcs = new Set<string>();
    editorialSpreads.forEach(spread => {
      spread.photos.forEach(photo => {
        if (photo.src) uniquePhotoSrcs.add(photo.src);
      });
    });

    const photoSrcList = Array.from(uniquePhotoSrcs);
    console.log(`Ingesting ${photoSrcList.length} unique editorial images into media_assets...`);

    // Ingest them into media_assets
    const mediaAssetPayloads = photoSrcList.map(src => {
      const fileName = path.basename(src);
      return {
        bucket: "editorial",
        path: fileName,
        public_url: src,
        file_name: fileName,
        mime_type: "image/jpeg",
        media_type: "image",
        alt_text: "Editorial Image",
        status: "published"
      };
    });

    const { data: mediaRows, error: mediaErr } = await supabase
      .from("media_assets")
      .upsert(mediaAssetPayloads, { onConflict: "bucket,path" })
      .select("id,public_url");

    if (mediaErr) {
      console.error("Error seeding media assets for spreads:", mediaErr.message);
    } else {
      console.log(`Media assets upserted. Creating photo spreads...`);
      const mediaIdByUrl = new Map((mediaRows ?? []).map(r => [r.public_url, r.id]));

      for (let i = 0; i < editorialSpreads.length; i++) {
        const spread = editorialSpreads[i];
        
        // 1. Create the photo spread row
        const { data: newSpread, error: spreadErr } = await supabase
          .from("photo_spreads")
          .insert({
            slug: spread.id,
            title: spread.title || null,
            template_type: spread.template,
            diary_entry: spread.diaryEntry || null,
            status: "published",
            sort_order: i,
            featured: true
          })
          .select("id")
          .single();

        if (spreadErr) {
          console.error(`Error creating spread '${spread.id}':`, spreadErr.message);
          continue;
        }

        // 2. Create the photo spread items linked to the media assets
        const itemPayloads = spread.photos.map((photo, itemIdx) => {
          const mediaAssetId = mediaIdByUrl.get(photo.src);
          return {
            photo_spread_id: newSpread.id,
            media_asset_id: mediaAssetId,
            role: photo.role,
            alt_text: photo.alt,
            sort_order: itemIdx
          };
        }).filter(item => !!item.media_asset_id);

        const { error: itemsErr } = await supabase.from("photo_spread_items").insert(itemPayloads);
        if (itemsErr) {
          console.error(`Error adding items to spread '${spread.id}':`, itemsErr.message);
        } else {
          console.log(`Spread '${spread.id}' seeded successfully with ${itemPayloads.length} photos.`);
        }
      }
    }
  } else {
    console.log("Photo spreads already contain data. Skipping.");
  }

  console.log("\nDatabase seeding completed successfully!");
}

main().catch(err => {
  console.error("Migration/Seeding failed:", err);
  process.exit(1);
});
