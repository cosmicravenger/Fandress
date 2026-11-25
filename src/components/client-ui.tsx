"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Fades children in when they enter the viewport. Disabled under reduced motion via CSS. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Accessible modal built on the native <dialog> element (focus trap + Escape included). */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      style={{ width: size === "lg" ? "min(calc(100vw - 24px), 980px)" : "min(calc(100vw - 24px), 520px)" }}
      className="fd-modal m-auto max-h-[88vh] overflow-hidden rounded-3xl bg-paper p-0 text-ink shadow-[0_30px_80px_rgba(19,32,58,0.25)] backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
        <h2 className="text-xl">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-sand"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="max-h-[calc(88vh-72px)] overflow-y-auto p-5 sm:p-7">{children}</div>
    </dialog>
  );
}

/** Horizontal, scroll-snapped rail with previous/next controls. */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="scroll-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-0 sm:gap-6 sm:px-0"
      >
        {children}
      </div>
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll previous products" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white transition hover:border-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll next products" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white transition hover:border-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
