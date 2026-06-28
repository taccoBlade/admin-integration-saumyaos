import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "content/projects/generated");
const files = fs.readdirSync(dir);

for (const file of files) {
  if (!file.endsWith(".json")) continue;
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let changed = false;

  // Truncate technologies to max 3
  if (data.technologies && data.technologies.length > 3) {
    data.technologies = data.technologies.slice(0, 3);
    changed = true;
  }

  // Update descriptions
  if (file.includes("promix")) {
    const newDesc = "Computational dashboard for IS 10262 concrete mix design and compliance verification.";
    if (data.description !== newDesc) {
      data.description = newDesc;
      changed = true;
    }
  } else if (file.includes("soil")) {
    const newDesc = "Wireless telemetry prototype for real-time soil deformation monitoring.";
    if (data.description !== newDesc) {
      data.description = newDesc;
      changed = true;
    }
  } else if (file.includes("machine-guided")) {
    const newDesc = "Prototype guidance system for intelligent road rollers using sensor fusion and state estimation.";
    if (data.description !== newDesc) {
      data.description = newDesc;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
}
