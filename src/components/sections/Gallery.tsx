import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

type Item = { src: string; label: string };

const Row = ({ items, direction, speed = 30, onOpen }: { items: Item[]; direction: 1 | -1; speed?: number; onOpen: (it: Item) => void }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => { halfWidthRef.current = el.scrollWidth / 2; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const el = trackRef.current;
      if (el && !paused && !draggingRef.current && halfWidthRef.current > 0) {
        offsetRef.current -= direction * speed * dt;
        const half = halfWidthRef.current;
        if (offsetRef.current <= -half) offsetRef.current += half;
        if (offsetRef.current >= 0) offsetRef.current -= half;
        el.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, speed, paused]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    movedRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    movedRef.current += Math.abs(dx);
    const el = trackRef.current;
    if (!el) return;
    offsetRef.current += dx;
    const half = halfWidthRef.current;
    if (half > 0) {
      if (offsetRef.current <= -half) offsetRef.current += half;
      if (offsetRef.current >= 0) offsetRef.current -= half;
    }
    el.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <div
      className="relative overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex gap-4 w-max will-change-transform">
        {[...items, ...items].map((it, i) => (
          <button
            type="button"
            key={i}
            onClick={() => { if (movedRef.current < 6) onOpen(it); }}
            className="relative overflow-hidden rounded-2xl h-[260px] w-[200px] sm:h-[300px] sm:w-[240px] shrink-0 block"
          >
            <img src={it.src} alt={`Tato ${it.label}`} loading="lazy" draggable={false} className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] uppercase text-white pointer-events-none">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const Gallery = () => {
  const { content: { gallery } } = useSiteContent();
  const [active, setActive] = useState<Item | null>(null);
  if (!gallery.length) return null;
  const mid = Math.ceil(gallery.length / 2);
  const rowA = gallery.slice(0, mid);
  const rowB = gallery.slice(mid).length ? gallery.slice(mid) : gallery;

  return (
    <section id="gallery" className="py-12 md:py-24 px-0 md:px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-14 px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Portfolio</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">Karya <em className="text-gradient-gold">Pilihan</em></h2>
        </div>

        <div className="md:hidden space-y-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <Row items={rowA} direction={1} speed={28} onOpen={setActive} />
          <Row items={rowB} direction={-1} speed={28} onOpen={setActive} />
        </div>

        <div className="hidden md:block columns-2 md:columns-3 gap-5 space-y-5">
          {gallery.map((it, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActive(it)}
              className="relative group overflow-hidden rounded-3xl break-inside-avoid w-full block"
              style={{ height: 380 + ((i * 70) % 200) }}
            >
              <img src={it.src} alt={`Tato ${it.label}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute bottom-4 left-4 text-xs tracking-[0.2em] uppercase text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                {it.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <button onClick={() => setActive(null)} aria-label="Tutup" className="absolute top-4 right-4 h-11 w-11 rounded-full bg-background/80 hover:bg-background flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
          <figure className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img src={active.src} alt={`Tato ${active.label}`} className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain" />
            <figcaption className="text-xs tracking-[0.3em] uppercase text-white/80">{active.label}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
};
