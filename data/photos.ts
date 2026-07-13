export type EditorialRole = 
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
  exif?: string; // e.g. "ISO 3200 | f/1.4 | 15s | 24mm"
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
  {
    id: "intro",
    title: "",
    template: "Hero Intro",
    photos: [
      { src: "/images/editorial/img_ccbae88f7d.jpg", role: "Hero", alt: "Editorial Image", exif: "ISO 100 | f/8.0 | 1/250s | 50mm" }
    ]
  },
  {
    id: "me",
    title: "Me",
    template: "Photo Dump",
    photos: [
      { src: "/images/editorial/img_f2bcf1adde.jpg", role: "Hero", alt: "Editorial Image", exif: "ISO 400 | f/2.8 | 1/100s | 35mm" },
      { src: "/images/editorial/img_e07f6409f2.jpg", role: "Texture", alt: "Editorial Image", exif: "ISO 800 | f/1.8 | 1/60s | 50mm" },
      { src: "/images/editorial/img_2d437d70f3.jpg", role: "Portrait", alt: "Editorial Image", exif: "ISO 200 | f/4.0 | 1/500s | 85mm" },
      { src: "/images/editorial/img_95e7007c73.jpg", role: "Detail", alt: "Editorial Image", exif: "ISO 100 | f/2.2 | 1/1000s | 50mm" },
      { src: "/images/editorial/img_83525666e1.jpg", role: "Portrait", alt: "Editorial Image", exif: "ISO 400 | f/1.4 | 1/200s | 35mm" },
      { src: "/images/editorial/img_c288274af5.jpg", role: "Texture", alt: "Editorial Image", exif: "ISO 1600 | f/2.8 | 1/30s | 24mm" },
      { src: "/images/editorial/img_a809b56a19.jpg", role: "Detail", alt: "Editorial Image", exif: "ISO 200 | f/5.6 | 1/250s | 70mm" },
      { src: "/images/editorial/img_907b3558a5.jpg", role: "Closing Frame", alt: "Editorial Image", exif: "ISO 100 | f/8.0 | 1/500s | 35mm" }
    ],
    diaryEntry: "Sleepless nights. Blurry streetlights. Looking for a pattern in the chaos of daily life. These are frames from a movie that was never finished, but the memories remain real."
  },
  {
    id: "places",
    title: "Places",
    template: "Offset",
    photos: [
      { src: "/images/editorial/img_01fd20322f.jpg", role: "Hero", alt: "Sikkim Night Sky / Milky Way", exif: "ISO 3200 | f/1.4 | 15s | 24mm" },
      { src: "/images/editorial/img_550567eb2f.jpg", role: "Texture", alt: "Vintage Light Post", exif: "ISO 800 | f/2.0 | 1/15s | 50mm" },
      { src: "/images/editorial/img_948a582222.jpg", role: "Closing Frame", alt: "Quiet Street", exif: "ISO 1600 | f/2.8 | 1/30s | 35mm" }
    ],
    diaryEntry: "Wandering through spaces that belong to someone else's memory. Sikkim's cold, thinning wind, a vintage light post under the absolute quiet of the night sky."
  },
  {
    id: "bike",
    title: "Bike",
    template: "Cinematic Widescreen",
    photos: [
      { src: "/images/editorial/img_ec9b30b7ea.jpg", role: "Hero", alt: "Bike on Road", exif: "ISO 800 | f/2.8 | 1/60s | 50mm" },
      { src: "/images/editorial/img_1618c5c757.jpg", role: "Texture", alt: "Engine Detail", exif: "ISO 400 | f/1.8 | 1/125s | 85mm" },
      { src: "/images/editorial/img_c52c8a1787.jpg", role: "Closing Frame", alt: "Streetlights", exif: "ISO 3200 | f/4.0 | 1/15s | 35mm" }
    ],
    diaryEntry: "Late night runs. The mechanical hum of parallel-twin cylinders, cold air hitting my face, empty roads under yellow streetlights. Freedom in its rawest, most solitary form."
  },
  {
    id: "fitness",
    title: "Fitness",
    template: "Lookbook",
    photos: [
      { src: "/images/editorial/img_6ef56dffca.jpg", role: "Hero", alt: "Gym Portrait", exif: "ISO 1600 | f/2.8 | 1/100s | 35mm" },
      { src: "/images/editorial/img_3107ed692e.jpg", role: "Texture", alt: "Weights", exif: "ISO 800 | f/1.4 | 1/250s | 50mm" },
      { src: "/images/editorial/img_a691268788.jpg", role: "Portrait", alt: "Training", exif: "ISO 3200 | f/2.8 | 1/200s | 85mm" },
      { src: "/images/editorial/img_3d6a477493.jpg", role: "Portrait", alt: "Form", exif: "ISO 1600 | f/2.0 | 1/125s | 50mm" },
      { src: "/images/editorial/img_9e5ab33498.jpg", role: "Texture", alt: "Chalk", exif: "ISO 800 | f/2.8 | 1/60s | 100mm" },
      { src: "/images/editorial/img_4856e16c61.jpg", role: "Closing Frame", alt: "Aftermath", exif: "ISO 400 | f/4.0 | 1/60s | 35mm" }
    ],
    diaryEntry: "The daily grind. Pushing the physical body to keep the mind quiet. There is poetry in the repetition of form, the heavy iron, the quiet discipline."
  },
  {
    id: "sunsets",
    title: "Celestial",
    template: "Minimalist Horizon",
    photos: [
      { src: "/images/editorial/img_3fcc06aba5.jpg", role: "Hero", alt: "Sunset Horizon", exif: "ISO 100 | f/8.0 | 1/250s | 70mm" },
      { src: "/images/editorial/img_5c6787ba3b.jpg", role: "Texture", alt: "Clouds", exif: "ISO 200 | f/5.6 | 1/500s | 200mm" },
      { src: "/images/editorial/img_4dd11c5eeb.jpg", role: "Closing Frame", alt: "Dusk", exif: "ISO 800 | f/4.0 | 1/60s | 35mm" }
    ],
    diaryEntry: "Celestial observations. Worshipping the sky as it bleeds gradients of deep blue into warm orange, before transitioning into the absolute quiet of the cosmic night."
  },
  {
    id: "animals",
    title: "Animals",
    template: "Comic Strip",
    photos: [
      { src: "/images/editorial/img_1c1cf81832.jpg", role: "Hero", alt: "Cat Portrait", exif: "ISO 400 | f/1.8 | 1/500s | 85mm" },
      { src: "/images/editorial/img_e5b52fb2d9.jpg", role: "Texture", alt: "Fur Detail", exif: "ISO 800 | f/2.8 | 1/250s | 100mm" },
      { src: "/images/editorial/img_38bd3298fa.jpg", role: "Portrait", alt: "Gaze", exif: "ISO 200 | f/1.4 | 1/1000s | 50mm" },
      { src: "/images/editorial/img_cfa1b78320.jpg", role: "Detail", alt: "Paws", exif: "ISO 400 | f/2.0 | 1/500s | 85mm" },
      { src: "/images/editorial/img_3750dc488e.jpg", role: "Closing Frame", alt: "Sleeping", exif: "ISO 1600 | f/1.4 | 1/60s | 35mm" }
    ],
    diaryEntry: "Quiet companions. Finding absolute peace in their silent gaze and unpredictable actions. A brief, welcome pause in a world that moves too fast."
  },
  {
    id: "aeroplanes",
    title: "Aeroplanes",
    template: "Blue Hour Grid",
    photos: [
      { src: "/images/editorial/img_a6d3168724.jpg", role: "Hero", alt: "Airplane Landing", exif: "ISO 3200 | f/2.8 | 1/125s | 200mm" },
      { src: "/images/editorial/img_60d3ada51a.jpg", role: "Texture", alt: "Wing Detail", exif: "ISO 1600 | f/4.0 | 1/250s | 100mm" },
      { src: "/images/editorial/img_30129bff98.jpg", role: "Portrait", alt: "Window View", exif: "ISO 800 | f/5.6 | 1/500s | 35mm" },
      { src: "/images/editorial/img_53fa232217.jpg", role: "Detail", alt: "Tarmac", exif: "ISO 400 | f/8.0 | 1/125s | 50mm" },
      { src: "/images/editorial/img_dfce368fc5.jpg", role: "Closing Frame", alt: "Takeoff", exif: "ISO 1600 | f/2.8 | 1/500s | 400mm" }
    ],
    diaryEntry: "Blue hour. Metallic wings slicing through low-hanging clouds, heading toward distant runways at dawn. Always in transit, always looking up."
  }
];
