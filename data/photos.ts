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
      { src: "/images/editorial/img_ccbae88f7d.jpg", role: "Hero", alt: "Editorial Image" }
    ]
  },
  {
    id: "me",
    title: "Me",
    template: "Photo Dump",
    photos: [
      { src: "/images/editorial/img_f2bcf1adde.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_e07f6409f2.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_2d437d70f3.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_95e7007c73.jpg", role: "Detail", alt: "Editorial Image" },
      { src: "/images/editorial/img_83525666e1.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_c288274af5.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_a809b56a19.jpg", role: "Detail", alt: "Editorial Image" },
      { src: "/images/editorial/img_907b3558a5.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Sleepless nights. Blurry streetlights. Looking for a pattern in the chaos of daily life. These are frames from a movie that was never finished, but the memories remain real."
  },
  {
    id: "places",
    title: "Places",
    template: "Offset",
    photos: [
      { src: "/images/editorial/img_01fd20322f.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_550567eb2f.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_948a582222.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Wandering through spaces that belong to someone else's memory. Sikkim's cold, thinning wind, a vintage light post under the absolute quiet of the night sky."
  },
  {
    id: "bike",
    title: "Bike",
    template: "Cinematic Widescreen",
    photos: [
      { src: "/images/editorial/img_ec9b30b7ea.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_1618c5c757.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_c52c8a1787.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Late night runs. The mechanical hum of parallel-twin cylinders, cold air hitting my face, empty roads under yellow streetlights. Freedom in its rawest, most solitary form."
  },
  {
    id: "fitness",
    title: "Fitness",
    template: "Lookbook",
    photos: [
      { src: "/images/editorial/img_6ef56dffca.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_3107ed692e.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_a691268788.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_843ae6a188.jpg", role: "Detail", alt: "Editorial Image" },
      { src: "/images/editorial/img_3d6a477493.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_9e5ab33498.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_4856e16c61.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "The daily grind. Pushing the physical body to keep the mind quiet. There is poetry in the repetition of form, the heavy iron, the quiet discipline."
  },
  {
    id: "sunsets",
    title: "Sunsets",
    template: "Minimalist Horizon",
    photos: [
      { src: "/images/editorial/img_3fcc06aba5.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_5c6787ba3b.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_4dd11c5eeb.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Chasing horizons. Watching the sky bleed gradients of deep blue into warm orange, before everything fades back into matte black. A reminder that endings can breathe."
  },
  {
    id: "animals",
    title: "Animals",
    template: "Comic Strip",
    photos: [
      { src: "/images/editorial/img_1c1cf81832.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_e5b52fb2d9.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_38bd3298fa.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_cfa1b78320.jpg", role: "Detail", alt: "Editorial Image" },
      { src: "/images/editorial/img_3750dc488e.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Quiet companions. Finding absolute peace in their silent gaze and unpredictable actions. A brief, welcome pause in a world that moves too fast."
  },
  {
    id: "aeroplanes",
    title: "Aeroplanes",
    template: "Blue Hour Grid",
    photos: [
      { src: "/images/editorial/img_a6d3168724.jpg", role: "Hero", alt: "Editorial Image" },
      { src: "/images/editorial/img_60d3ada51a.jpg", role: "Texture", alt: "Editorial Image" },
      { src: "/images/editorial/img_30129bff98.jpg", role: "Portrait", alt: "Editorial Image" },
      { src: "/images/editorial/img_53fa232217.jpg", role: "Detail", alt: "Editorial Image" },
      { src: "/images/editorial/img_dfce368fc5.jpg", role: "Closing Frame", alt: "Editorial Image" }
    ],
    diaryEntry: "Blue hour. Metallic wings slicing through low-hanging clouds, heading toward distant runways at dawn. Always in transit, always looking up."
  }
];
