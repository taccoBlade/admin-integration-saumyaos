import fs from 'fs';
import path from 'path';

const categories = {
  layout: [
    'header.tsx',
    'contact.tsx'
  ],
  ui: [
    'reveal-layer.tsx',
    'scroll-reveal.tsx',
    'page-transition.tsx',
    'interactive-particle-background.tsx'
  ],
  home: [
    'interactive-hero.tsx',
    'architecture-visualizer.tsx',
    'skills-network.tsx',
    'featured-projects.tsx',
    'bento-grid.tsx',
    'computational-canvas.tsx',
    'beliefs-terminal.tsx',
    'current-focus.tsx',
    'current-obsessions.tsx',
    'pull-cord.tsx',
    'career-timeline.tsx'
  ],
  personal: [
    'personal-hero.tsx',
    'personal-boot-screen.tsx',
    'personal-builds.tsx',
    'personal-os-hud.tsx',
    'life-carousel.tsx',
    'hobbies-grid.tsx',
    'motorcycle-dashboard.tsx',
    'routine-timeline.tsx',
    'metrics-grid.tsx'
  ],
  projects: [
    'dashboard-widgets.tsx',
    'dashboard-embed.tsx',
    'engineering-logbook.tsx',
    'product-demo-frame.tsx',
    'goals-list.tsx'
  ]
};

const componentsDir = path.join(process.cwd(), 'components');
const appDir = path.join(process.cwd(), 'app');

// 1. Create directories
for (const cat of Object.keys(categories)) {
  const dir = path.join(componentsDir, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

// 2. Move files
const fileToCategory = {};
for (const [cat, files] of Object.entries(categories)) {
  for (const file of files) {
    const oldPath = path.join(componentsDir, file);
    const newPath = path.join(componentsDir, cat, file);
    
    // Remember the mapping for import replacement
    fileToCategory[file] = cat;

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Moved ${file} to ${cat}`);
    }
  }
}

// 3. Update imports in app/ and components/
function replaceImportsInDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceImportsInDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      
      // Look for lines importing from "@/components/something"
      // e.g. import { ... } from "@/components/header"
      
      for (const [compFile, cat] of Object.entries(fileToCategory)) {
        const compName = compFile.replace('.tsx', '');
        const regex = new RegExp(`@/components/${compName}(["'])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `@/components/${cat}/${compName}$1`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

replaceImportsInDirectory(appDir);
replaceImportsInDirectory(componentsDir);

console.log('Restructure complete!');
