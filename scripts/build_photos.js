const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_DIR = 'C:\\Users\\saumy\\Downloads\\website photos';
const PROJECT_DIR = 'c:\\Users\\saumy\\OneDrive\\Documents\\personalsite';
const TARGET_DIR = path.join(PROJECT_DIR, 'public', 'images', 'editorial');
const DATA_FILE = path.join(PROJECT_DIR, 'data', 'photos.ts');

if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

const files = fs.readdirSync(SOURCE_DIR);

const categories = {
  intro: [],
  me: [],
  places: [],
  bike: [],
  fitness: [],
  sunsets: [],
  animals: [],
  aeroplanes: []
};

files.forEach(file => {
  const lower = file.toLowerCase();
  
  if (lower.includes('desk') || lower.includes('monster')) {
    return;
  }
  
  if (lower === 'hero.jpg') {
    categories.intro.push(file);
  } else if (lower.includes('sikkim') || lower.includes('light post') || lower.includes('chernobyl')) {
    categories.places.push(file);
  } else if (lower.includes('bike') || lower.includes('scooter')) {
    categories.bike.push(file);
  } else if (lower.includes('gym') || lower.includes('basket') || lower.includes('posing')) {
    categories.fitness.push(file);
  } else if (lower.includes('plane') || lower.includes('sky') && !lower.includes('milky')) {
    categories.aeroplanes.push(file);
  } else if (lower.includes('bird') || lower.includes('kingfisher') || lower.includes('cat')) {
    categories.animals.push(file);
  } else if (lower.includes('sunset') || lower.includes('moon') || lower.includes('milkyway')) {
    categories.sunsets.push(file);
  } else {
    categories.me.push(file);
  }
});

const copyAndHash = (file) => {
  const ext = path.extname(file);
  const hash = crypto.createHash('md5').update(file).digest('hex').substring(0, 10);
  const newFilename = `img_${hash}${ext}`;
  const srcPath = path.join(SOURCE_DIR, file);
  const destPath = path.join(TARGET_DIR, newFilename);
  fs.copyFileSync(srcPath, destPath);
  return `/images/editorial/${newFilename}`;
};

const mapToPhotoData = (filename, index, arrayLen) => {
  const src = copyAndHash(filename);
  let role = "Scene Setter";
  if (index === 0) role = "Hero";
  else if (index === arrayLen - 1) role = "Closing Frame";
  else if (index % 3 === 0) role = "Detail";
  else if (index % 2 === 0) role = "Portrait";
  else role = "Texture";

  return `      { src: "${src}", role: "${role}", alt: "Editorial Image" }`;
};

const diaryEntries = {
  intro: ``,
  me: `Sleepless nights. Blurry streetlights. Looking for a pattern in the chaos of daily life. These are frames from a movie that was never finished, but the memories remain real.`,
  places: `Wandering through spaces that belong to someone else's memory. Sikkim's cold, thinning wind, a vintage light post under the absolute quiet of the night sky.`,
  bike: `Late night runs. The mechanical hum of parallel-twin cylinders, cold air hitting my face, empty roads under yellow streetlights. Freedom in its rawest, most solitary form.`,
  fitness: `The daily grind. Pushing the physical body to keep the mind quiet. There is poetry in the repetition of form, the heavy iron, the quiet discipline.`,
  sunsets: `Chasing horizons. Watching the sky bleed gradients of deep blue into warm orange, before everything fades back into matte black. A reminder that endings can breathe.`,
  animals: `Quiet companions. Finding absolute peace in their silent gaze and unpredictable actions. A brief, welcome pause in a world that moves too fast.`,
  aeroplanes: `Blue hour. Metallic wings slicing through low-hanging clouds, heading toward distant runways at dawn. Always in transit, always looking up.`
};

const buildSpread = (id, title, template, filenames) => {
  if (filenames.length === 0) return '';
  const photos = filenames.map((f, i) => mapToPhotoData(f, i, filenames.length)).join(',\n');
  const diary = diaryEntries[id] ? `,\n    diaryEntry: "${diaryEntries[id]}"` : '';
  
  return `  {
    id: "${id}",
    title: "${title}",
    template: "${template}",
    photos: [
${photos}
    ]${diary}
  }`;
};

const tsContent = `export type EditorialRole = 
  | "Hero" 
  | "Scene Setter" 
  | "Portrait" 
  | "Detail" 
  | "Texture" 
  | "Transition" 
  | "Closing Frame";

export interface PhotoData {
  src: string;
  role: EditorialRole;
  alt: string;
}

export type SpreadTemplate = "Hero Intro" | "Photo Dump" | "Offset" | "Cinematic Widescreen" | "Lookbook" | "Minimalist Horizon" | "Comic Strip" | "Blue Hour Grid";

export interface SpreadData {
  id: string;
  title?: string;
  template: SpreadTemplate;
  photos: PhotoData[];
  diaryEntry?: string;
}

export const editorialSpreads: SpreadData[] = [
${[
  buildSpread("intro", "", "Hero Intro", categories.intro),
  buildSpread("me", "Me", "Photo Dump", categories.me),
  buildSpread("places", "Places", "Offset", categories.places),
  buildSpread("bike", "Bike", "Cinematic Widescreen", categories.bike),
  buildSpread("fitness", "Fitness", "Lookbook", categories.fitness),
  buildSpread("sunsets", "Sunsets", "Minimalist Horizon", categories.sunsets),
  buildSpread("animals", "Animals", "Comic Strip", categories.animals),
  buildSpread("aeroplanes", "Aeroplanes", "Blue Hour Grid", categories.aeroplanes)
].filter(Boolean).join(',\n')}
];
`;

fs.writeFileSync(DATA_FILE, tsContent);
console.log('Processed categories successfully!');
