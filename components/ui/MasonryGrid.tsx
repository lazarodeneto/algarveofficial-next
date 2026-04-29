"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";

export type MasonryGridItem = {
  id: string;
  title?: string;
  image: string;
  imageAlt?: string;
};

interface MasonryGridProps {
  items: MasonryGridItem[];
}

function MasonryCard({ item }: { item: MasonryGridItem }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-neutral-100 shadow-sm transition duration-300 hover:shadow-xl">
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" aria-hidden="true" />
      ) : null}

      <Image
        src={item.image}
        alt={item.imageAlt ?? item.title ?? ""}
        width={800}
        height={600}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        quality={70}
        priority={false}
        onLoad={() => setLoaded(true)}
        className={[
          "h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />

      <button
        type="button"
        aria-label={item.title ? `Save ${item.title}` : "Save item"}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
      >
        <Heart className="h-4 w-4 text-neutral-700" />
      </button>

      {item.title ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 text-white">
          <p className="text-sm font-medium">{item.title}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function MasonryGrid({ items }: MasonryGridProps) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
      {items.map((item) => (
        <MasonryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
