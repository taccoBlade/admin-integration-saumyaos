'use client';

import { motion } from "framer-motion";
import { PhotoData } from "@/data/photos";
import Image from "next/image";

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

  if (fill) {
    return (
      <motion.div 
        className={`relative w-full select-none overflow-hidden h-full ${className}`}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src={photo.src}
          alt={photo.alt || photo.role || "Editorial photo"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`select-none pointer-events-none [-webkit-user-drag:none] ${filterClass}`}
          style={{ objectFit: finalFit }}
          draggable={false}
          priority={photo.role === "Hero"}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`relative w-full select-none overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={photo.src}
        alt={photo.alt || photo.role || "Editorial photo"}
        width={1200}
        height={800}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`select-none pointer-events-none [-webkit-user-drag:none] ${filterClass}`}
        style={{ 
          width: '100%', 
          height: 'auto', 
          objectFit: finalFit 
        }}
        draggable={false}
        priority={photo.role === "Hero"}
      />
    </motion.div>
  );
}
