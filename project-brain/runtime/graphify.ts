import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const graphDir = path.join(rootDir, "project-brain", "graph");

if (!fs.existsSync(graphDir)) {
  fs.mkdirSync(graphDir, { recursive: true });
}

interface Node {
  id: string;
  label: string;
  type: "page" | "component" | "lib" | "data" | "content" | "package" | "config";
  path: string;
  size: number;
}

interface Edge {
  source: string;
  target: string;
  type: "import" | "dependency" | "route";
}

const nodes: Node[] = [];
const edges: Edge[] = [];
const nodeIds = new Set<string>();

const scanDirs = ["app", "components", "lib", "data", "content"];
const ignoredDirs = ["node_modules", ".git", ".next", "out", "build", "dist", "tmp", "project-brain"];
const fileExtensions = [".tsx", ".ts", ".jsx", ".js", ".json", ".md"];

function getFileType(filePath: string): Node["type"] {
  const rel = path.relative(rootDir, filePath).replace(/\\/g, "/");
  if (rel.startsWith("app/")) return "page";
  if (rel.startsWith("components/")) return "component";
  if (rel.startsWith("lib/")) return "lib";
  if (rel.startsWith("data/")) return "data";
  if (rel.startsWith("content/")) return "content";
  return "config";
}

function scanFiles(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      if (ignoredDirs.includes(file)) continue;
      scanFiles(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (fileExtensions.includes(ext)) {
        const id = relPath;
        if (!nodeIds.has(id)) {
          nodeIds.add(id);
          nodes.push({
            id,
            label: file,
            type: getFileType(fullPath),
            path: relPath,
            size: stats.size,
          });
        }
      }
    }
  }
}

// Helper to resolve imports
function resolveImport(importPath: string, currentFileDir: string): string | null {
  let target = "";
  if (importPath.startsWith("@/")) {
    target = path.join(rootDir, importPath.substring(2));
  } else if (importPath.startsWith("./") || importPath.startsWith("../")) {
    target = path.join(currentFileDir, importPath);
  } else {
    // Third party module
    return null;
  }

  const extensions = [".tsx", ".ts", ".jsx", ".js", ".json", "/index.tsx", "/index.ts", "/index.js", "/index.json"];
  for (const ext of extensions) {
    const candidate = target + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(rootDir, candidate).replace(/\\/g, "/");
    }
  }

  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    return path.relative(rootDir, target).replace(/\\/g, "/");
  }

  return null;
}

function processImports() {
  const importRegex = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const node of nodes) {
    if (node.type === "package") continue;
    const fullPath = path.join(rootDir, node.path);
    if (!fs.existsSync(fullPath)) continue;

    const fileContent = fs.readFileSync(fullPath, "utf8");
    const currentFileDir = path.dirname(fullPath);

    let match;
    const matchedImports = new Set<string>();

    // Process ES6 imports
    while ((match = importRegex.exec(fileContent)) !== null) {
      matchedImports.add(match[1]);
    }

    // Process CommonJS requires
    while ((match = requireRegex.exec(fileContent)) !== null) {
      matchedImports.add(match[1]);
    }

    matchedImports.forEach((imp) => {
      const resolved = resolveImport(imp, currentFileDir);
      if (resolved) {
        edges.push({
          source: node.id,
          target: resolved,
          type: "import",
        });
      } else {
        // Third party dependency
        // Extract base package name (e.g. 'react-dom/client' -> 'react-dom')
        let pkgName = imp;
        if (!imp.startsWith(".") && !imp.startsWith("/") && !imp.startsWith("@/")) {
          const parts = imp.split("/");
          pkgName = parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
          
          const pkgId = `package:${pkgName}`;
          if (!nodeIds.has(pkgId)) {
            nodeIds.add(pkgId);
            nodes.push({
              id: pkgId,
              label: pkgName,
              type: "package",
              path: `node_modules/${pkgName}`,
              size: 0,
            });
          }
          edges.push({
            source: node.id,
            target: pkgId,
            type: "dependency",
          });
        }
      }
    });
  }
}

function compile() {
  console.log("[Graphify] Starting directory scan...");
  for (const dir of scanDirs) {
    const fullDir = path.join(rootDir, dir);
    if (fs.existsSync(fullDir)) {
      scanFiles(fullDir);
    }
  }

  console.log(`[Graphify] Scanned ${nodes.length} files. Resolving dependencies...`);
  processImports();

  // Create graph index mapping
  const graphIndex: Record<string, { node: Node; dependencies: string[]; dependents: string[] }> = {};
  for (const node of nodes) {
    graphIndex[node.id] = {
      node,
      dependencies: [],
      dependents: [],
    };
  }

  for (const edge of edges) {
    if (graphIndex[edge.source]) {
      graphIndex[edge.source].dependencies.push(edge.target);
    }
    if (graphIndex[edge.target]) {
      graphIndex[edge.target].dependents.push(edge.source);
    }
  }

  // Create mock embeddings/summaries mapping
  const embeddings: Record<string, string> = {};
  for (const node of nodes) {
    embeddings[node.id] = `Path: ${node.path}, Type: ${node.type}, Size: ${node.size} bytes.`;
  }

  // Output files
  fs.writeFileSync(path.join(graphDir, "nodes.json"), JSON.stringify(nodes, null, 2));
  fs.writeFileSync(path.join(graphDir, "edges.json"), JSON.stringify(edges, null, 2));
  fs.writeFileSync(path.join(graphDir, "graph.json"), JSON.stringify({ nodes, edges }, null, 2));
  fs.writeFileSync(path.join(graphDir, "graph-index.json"), JSON.stringify(graphIndex, null, 2));
  fs.writeFileSync(path.join(graphDir, "embeddings.json"), JSON.stringify(embeddings, null, 2));

  console.log(`[Graphify] Compile success. Output graph data to: ${graphDir}`);
}

compile();
