'use client';

import { motion } from "framer-motion";
import { PhotoData } from "@/data/photos";

export function PhotoRenderer({ 
  photo, 
  className = "", 
  filterClass = "saturate-[0.75] contrast-[1.15] brightness-[0.9] hover:saturate-100 hover:contrast-100 hover:brightness-100 transition-all duration-700 ease-out",
  fill = false,
  objectFit
}: { 
  photo: PhotoData; 
  className?: string; 
  filterClass?: string;
  fill?: boolean;
  objectFit?: 'cover' | 'contain';
}) {
  const finalFit = objectFit || (fill ? 'cover' : 'contain');

  return (
    <motion.div 
      className={`relative w-full select-none overflow-hidden ${fill ? 'h-full' : ''} ${className}`}
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt || photo.role}
        loading="lazy"
        style={{ 
          width: '100%', 
          height: fill ? '100%' : 'auto', 
          objectFit: finalFit 
        }}
        className={`select-none pointer-events-none [-webkit-user-drag:none] ${
          fill ? 'w-full h-full' : 'w-full h-auto'
        } ${filterClass}`}
        draggable={false}
      />
    </motion.div>
  );
}
