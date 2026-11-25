"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Item = { handle: string; title: string; imageUrl: string | null; priceCents: number; teamName: string };
const KEY = "fd-recently-viewed";

/** Records the current product in localStorage and lists the other recently viewed products. */
export function RecentlyViewed({ current }: { current: Item }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let list: Item[] = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      list = [];
    }
    const others = list.filter((i) => i.handle !== current.handle);
    setItems(others.slice(0, 4));
    const next = [current, ...others].slice(0, 8);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.handle]);

  if (!items.length) return null;
  return (
    <div>
      <h2 className="font-display text-3xl">Recently viewed</h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((item) => (
          <li key={item.handle}>
            <Link href={`/products/${item.handle}`} className="group block">
              <span className="card-media relative block aspect-[3/4]">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />}
              </span>
              <span className="mt-3 block text-sm font-medium group-hover:text-rose">{item.title}</span>
              <span className="block text-sm text-stone">{formatPrice(item.priceCents)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
