"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent, type TouchEvent } from "react";

type GalleryImage = { url: string; alt: string; width: number; height: number };

/** Large image with thumbnails, swipe on touch, and click/hover zoom. */
export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchStart = useRef<number | null>(null);
  const count = images.length;

  if (!count) {
    return <div className="aspect-[3/4] rounded-3xl bg-sand" role="img" aria-label={`${title} image unavailable`} />;
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);
  const current = images[index];

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[88px_1fr] lg:grid-cols-[96px_1fr]">
      <ul className="order-2 flex gap-3 overflow-x-auto scroll-hide md:order-1 md:flex-col md:overflow-visible" aria-label="Product images">
        {images.map((img, i) => (
          <li key={img.url + i} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === index}
              className={`relative block h-24 w-18 overflow-hidden rounded-xl bg-sand transition md:h-auto md:aspect-[3/4] md:w-full ${
                i === index ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative order-1 md:order-2">
        <div
          className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-sand ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setZoom((z) => !z)}
          onPointerMove={onMove}
          onPointerLeave={() => setZoom(false)}
          onTouchStart={(e: TouchEvent) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e: TouchEvent) => {
            if (touchStart.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt || `${title} view ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="animate-fade-up object-cover transition-transform duration-500 ease-out"
            style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: origin }}
          />
        </div>

        {count > 1 && (
          <div className="mt-4 flex items-center justify-between md:absolute md:inset-x-4 md:bottom-4 md:mt-0 md:justify-between">
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow-md transition hover:bg-ink hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <p className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tabular-nums md:bg-white/95">{index + 1} / {count}</p>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow-md transition hover:bg-ink hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
