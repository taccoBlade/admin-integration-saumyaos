import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "content/projects/generated");

const files = fs.readdirSync(dir);

for (const file of files) {
  if (!file.endsWith(".json")) continue;
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  let changed = false;

  // Cleanup: ensure validationData is removed if it was injected previously
  if (data.validationData) {
    delete data.validationData;
    changed = true;
  }

  // Ensure other properties are initialized if missing
  if (!data.heroVisualType) {
    if (file.includes("soil")) {
      data.heroVisualType = "dashboard";
      data.metrics = [
        { value: "0.2mm", label: "Strain Resolution" },
        { value: "24/7", label: "Uptime" },
        { value: "0.5 mm", label: "Settlement Precision" },
        { value: "100 Hz", label: "Data Rate" }
      ];
    } else if (file.includes("promix")) {
      data.heroVisualType = "dashboard";
      data.metrics = [
        { value: "IS 10262", label: "Compliance" },
        { value: "0.1%", label: "Margin of Error" },
        { value: "< 2s", label: "Calculation Time" },
        { value: "5+", label: "SCM Types Supported" }
      ];
    } else {
      data.heroVisualType = "image";
      data.metrics = [
        { value: "99%", label: "Reliability" },
        { value: "24/7", label: "Monitoring" }
      ];
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
}
