import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

const importsDir = path.join(process.cwd(), "content", "projects", "imports");
const processedDir = path.join(importsDir, "processed");
const generatedDir = path.join(process.cwd(), "content", "projects", "generated");
const tempDir = path.join(process.cwd(), "tmp", "ingest-temp");

// Ensure directories exist
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Find first README in directory (could be root or one level deep)
function findReadme(dir: string): string | null {
  const files = fs.readdirSync(dir);
  
  // Check current level
  for (const file of files) {
    if (file.toLowerCase() === "readme.md") {
      return path.join(dir, file);
    }
  }

  // Check one level deep
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && !file.startsWith(".") && file !== "node_modules") {
      try {
        const subFiles = fs.readdirSync(fullPath);
        for (const subFile of subFiles) {
          if (subFile.toLowerCase() === "readme.md") {
            return path.join(fullPath, subFile);
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }

  return null;
}

// Parse markdown sections based on headers
function parseMarkdownSection(markdown: string, sectionKeywords: string[]): string {
  const lines = markdown.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];

  // Create regex that matches headings with any of the keywords
  const titleRegex = new RegExp(`^#+\\s+.*(${sectionKeywords.join("|")}).*`, "i");

  for (const line of lines) {
    if (titleRegex.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (line.startsWith("#") && !line.startsWith("######")) {
        // Next heading starts, stop reading (except tiny headings if any, but standard is # to ###)
        break;
      }
      sectionLines.push(line);
    }
  }

  return sectionLines.join("\n").trim();
}

function extractListItems(text: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map(line => {
      const match = line.match(/^\s*[-\*+]\s+(.+)$/) || line.match(/^\s*\d+\.\s+(.+)$/);
      return match ? match[1].trim() : "";
    })
    .filter(item => item.length > 0);
}

// Build directory tree structure (excluding large dependency/build folders)
function buildDirTree(dirPath: string, rootDir: string): any {
  const stats = fs.statSync(dirPath);
  const name = path.basename(dirPath);
  const relPath = path.relative(rootDir, dirPath).replace(/\\/g, "/");

  const ignored = [
    "node_modules",
    ".git",
    ".next",
    "out",
    "build",
    "dist",
    "tmp",
    ".next-dev.log",
    "package-lock.json",
    ".DS_Store",
    "tsconfig.tsbuildinfo",
    "processed"
  ];
  if (ignored.includes(name)) return null;

  if (stats.isDirectory()) {
    try {
      const childrenRaw = fs.readdirSync(dirPath);
      const children = childrenRaw
        .map(child => buildDirTree(path.join(dirPath, child), rootDir))
        .filter(Boolean);
      
      // Sort directories first, then files
      children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "directory" ? -1 : 1;
      });

      return {
        name,
        type: "directory",
        path: relPath,
        children
      };
    } catch (e) {
      return null;
    }
  } else {
    return {
      name,
      type: "file",
      path: relPath
    };
  }
}

// Auto-detect technologies and domains based on files and folder contents
function detectTechnologiesAndDomain(dirPath: string): { technologies: string[]; domain: string } {
  const techs = new Set<string>();
  let domain = "Infrastructure Automation"; // Default domain
  let hasCivilKeywords = false;
  let hasGeotechKeywords = false;
  let hasMarketKeywords = false;

  function walk(currentPath: string) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        if (["node_modules", ".git", ".next", "dist", "build", "tmp"].includes(file)) continue;
        walk(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        
        // Language/framework detection
        if (ext === ".tsx" || ext === ".jsx") {
          techs.add("React");
          techs.add("TypeScript");
        }
        if (ext === ".ts") techs.add("TypeScript");
        if (ext === ".js") techs.add("JavaScript");
        if (ext === ".py") techs.add("Python");
        if (ext === ".ino" || ext === ".cpp" || ext === ".h") {
          techs.add("C++");
          techs.add("Arduino");
        }
        if (ext === ".go") techs.add("Go");
        if (ext === ".rs") techs.add("Rust");

        // Config file detection
        if (file === "package.json") {
          try {
            const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            if (deps["next"]) techs.add("Next.js");
            if (deps["react"]) techs.add("React");
            if (deps["tailwindcss"]) techs.add("TailwindCSS");
            if (deps["framer-motion"]) techs.add("Framer Motion");
            if (deps["typescript"]) techs.add("TypeScript");
            if (deps["three"]) techs.add("Three.js");
            if (deps["@tensorflow/tfjs"]) techs.add("TensorFlow.js");
          } catch (e) {}
        }

        if (file === "requirements.txt") {
          techs.add("Python");
          try {
            const reqs = fs.readFileSync(fullPath, "utf8").toLowerCase();
            if (reqs.includes("flask")) techs.add("Flask");
            if (reqs.includes("django")) techs.add("Django");
            if (reqs.includes("pandas")) techs.add("Pandas");
            if (reqs.includes("numpy")) techs.add("NumPy");
            if (reqs.includes("scikit-learn") || reqs.includes("sklearn")) techs.add("Machine Learning");
            if (reqs.includes("tensorflow") || reqs.includes("torch") || reqs.includes("pytorch")) {
              techs.add("Deep Learning");
            }
          } catch (e) {}
        }

        // Domain detection by keywords in text/source files
        if (ext === ".txt" || ext === ".md" || ext === ".py" || ext === ".ts" || ext === ".tsx") {
          try {
            const content = fs.readFileSync(fullPath, "utf8").toLowerCase();
            if (content.includes("concrete") || content.includes("cement") || content.includes("mix design") || content.includes("aggregates")) {
              hasCivilKeywords = true;
              techs.add("Concrete Technology");
            }
            if (content.includes("soil") || content.includes("geotechnical") || content.includes("excavation") || content.includes("foundation") || content.includes("retaining")) {
              hasGeotechKeywords = true;
              techs.add("Geotechnical Engineering");
            }
            if (content.includes("stock") || content.includes("equity") || content.includes("portfolio") || content.includes("investing") || content.includes("trading") || content.includes("alpha")) {
              hasMarketKeywords = true;
            }
            if (content.includes("esp32") || content.includes("esp8266") || content.includes("sensor") || content.includes("iot")) {
              techs.add("IoT");
              techs.add("ESP32");
            }
            if (content.includes("computer vision") || content.includes("opencv") || content.includes("yolo") || content.includes("detection")) {
              techs.add("Computer Vision");
            }
          } catch (e) {}
        }
      }
    }
  }

  try {
    walk(dirPath);
  } catch (e) {}

  // Determine domain priority
  if (hasGeotechKeywords) {
    domain = "Geotechnical Engineering";
  } else if (hasCivilKeywords) {
    domain = "Civil Engineering";
  } else if (hasMarketKeywords) {
    domain = "Markets & Investing";
  } else if (techs.has("ESP32") || techs.has("IoT")) {
    domain = "Infrastructure Automation";
  } else if (techs.has("React") || techs.has("Next.js") || techs.has("Python")) {
    domain = "Infrastructure Automation";
  }

  return { technologies: Array.from(techs), domain };
}

// Locate images recursively and copy them to the public project directory
function collectAndCopyImages(dirPath: string, projectId: string): string[] {
  const publicDestDir = path.join(process.cwd(), "public", "projects", projectId);
  if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });

  const imagePaths: string[] = [];
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];

  function walk(currentPath: string) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        if (["node_modules", ".git", ".next", "dist", "build", "tmp"].includes(file)) continue;
        walk(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          // Verify it's an actual image asset (> 5KB to filter out tiny checkmarks/icons)
          if (stats.size > 5000 && imagePaths.length < 6) {
            const destFileName = `${crypto.randomBytes(4).toString("hex")}-${file}`;
            const destPath = path.join(publicDestDir, destFileName);
            fs.copyFileSync(fullPath, destPath);
            imagePaths.push(`/projects/${projectId}/${destFileName}`);
          }
        }
      }
    }
  }

  try {
    walk(dirPath);
  } catch (e) {}

  return imagePaths;
}

export function processZipFile(filePath: string) {
  console.log(`[Ingest] Processing ZIP: ${filePath}`);
  const baseName = path.basename(filePath, ".zip");
  const projectId = slugify(baseName);
  const extractPath = path.join(tempDir, projectId);

  cleanDir(extractPath);
  fs.mkdirSync(extractPath, { recursive: true });

  // Extract ZIP
  const zip = new AdmZip(filePath);
  zip.extractAllTo(extractPath, true);

  // Determine if the ZIP contains a single wrapper folder
  let targetPath = extractPath;
  const topContents = fs.readdirSync(extractPath);
  if (topContents.length === 1 && fs.statSync(path.join(extractPath, topContents[0])).isDirectory()) {
    targetPath = path.join(extractPath, topContents[0]);
  }

  // Find and parse README
  const readmePath = findReadme(targetPath);
  let title = baseName.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  let description = `Automatically ingested project from ${baseName}.zip.`;
  let detailedOverview = "";
  let keyOutcomes: string[] = [];
  let lessonsLearned: string[] = [];
  let readmeTechs: string[] = [];

  if (readmePath) {
    console.log(`[Ingest] Found README at ${readmePath}`);
    const readmeContent = fs.readFileSync(readmePath, "utf8");

    // Title: first level 1 heading
    const titleMatch = readmeContent.match(/^#\s+(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    detailedOverview = readmeContent;

    // Summary description: take the first non-heading paragraph that is reasonably long
    const paragraphs = readmeContent
      .split("\n\n")
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith("#"));
    
    if (paragraphs.length > 0) {
      const descParagraph = paragraphs.find(p => /^[a-zA-Z]/.test(p));
      if (descParagraph) {
        description = descParagraph.length > 160 ? descParagraph.substring(0, 157) + "..." : descParagraph;
      }
    }

    // Parse specific sections
    const overviewSection = parseMarkdownSection(readmeContent, ["overview", "introduction", "background"]);
    const techSection = parseMarkdownSection(readmeContent, ["technologies", "tech stack", "built with", "requirements"]);
    const outcomesSection = parseMarkdownSection(readmeContent, ["outcomes", "key outcomes", "results", "features", "achievements"]);
    const lessonsSection = parseMarkdownSection(readmeContent, ["lessons learned", "challenges", "learnings", "retrospective"]);

    if (techSection) {
      readmeTechs = extractListItems(techSection);
    }
    if (outcomesSection) {
      keyOutcomes = extractListItems(outcomesSection);
    }
    if (lessonsSection) {
      lessonsLearned = extractListItems(lessonsSection);
    }
  }

  // Scan folder for technologies, domain
  const { technologies: detectedTechs, domain } = detectTechnologiesAndDomain(targetPath);
  
  // Combine technologies
  const combinedTechs = Array.from(new Set([...readmeTechs, ...detectedTechs]));

  // Scan folder structure for architectureTree
  const architectureTree = buildDirTree(targetPath, targetPath);

  // Collect images
  const gallery = collectAndCopyImages(targetPath, projectId);

  // Look for custom metadata file
  let customMetadata: any = {};
  const metadataPath = path.join(targetPath, "metadata.json");
  if (fs.existsSync(metadataPath)) {
    console.log(`[Ingest] Found custom metadata.json inside the ZIP`);
    try {
      customMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    } catch (e) {
      console.error("[Ingest] Error parsing metadata.json:", e);
    }
  }

  // Build final project object
  const project = {
    id: projectId,
    title: customMetadata.title || title,
    description: customMetadata.description || description,
    year: customMetadata.year || new Date().getFullYear(),
    domain: customMetadata.domain || domain,
    technologies: customMetadata.technologies || (combinedTechs.length > 0 ? combinedTechs : ["Infrastructure Automation"]),
    status: customMetadata.status || "Completed",
    complexityScore: customMetadata.complexityScore || "Intermediate",
    overview: customMetadata.overview || description,
    detailedOverview: detailedOverview || customMetadata.detailedOverview || description,
    gallery: customMetadata.gallery || gallery,
    githubUrl: customMetadata.githubUrl,
    liveUrl: customMetadata.liveUrl,
    keyOutcomes: customMetadata.keyOutcomes || (keyOutcomes.length > 0 ? keyOutcomes : ["Project successfully compiled and verified."]),
    lessonsLearned: customMetadata.lessonsLearned || (lessonsLearned.length > 0 ? lessonsLearned : ["System automation architecture validated."]),
    architectureTree: customMetadata.architectureTree || architectureTree
  };

  const outputPath = path.join(generatedDir, `${projectId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(project, null, 2));
  console.log(`[Ingest] Generated Project JSON: ${outputPath}`);

  // Clean up extraction path
  cleanDir(extractPath);

  // Move ZIP to processed archive
  const destZipPath = path.join(processedDir, path.basename(filePath));
  if (fs.existsSync(destZipPath)) fs.unlinkSync(destZipPath);
  fs.renameSync(filePath, destZipPath);
  console.log(`[Ingest] Moved ZIP to processed archive: ${destZipPath}`);
}

export function runIngestionPipeline() {
  console.log("=== Portfolio Intelligence Engine: Ingestion Pipeline ===");
  if (!fs.existsSync(importsDir)) {
    console.log("Imports directory not found, creating it...");
    fs.mkdirSync(importsDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(importsDir);
  const zipFiles = files.filter(f => f.endsWith(".zip"));

  if (zipFiles.length === 0) {
    console.log("No new projects found in imports queue.");
    return;
  }

  console.log(`Found ${zipFiles.length} projects to process.`);

  for (const file of zipFiles) {
    const fullPath = path.join(importsDir, file);
    try {
      processZipFile(fullPath);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  
  console.log("=== Ingestion Complete ===");
}

// Run the script if executed directly
if (require.main === module) {
  runIngestionPipeline();
}
