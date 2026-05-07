import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Splash = () => {
  const { loading, content } = useSiteContent();
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setFade(true), 250);
    const t2 = setTimeout(() => setShow(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  if (!show) return null;
  const [first, ...rest] = content.brand.name.split(".");

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] grid place-items-center bg-background transition-opacity duration-500 ${fade ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-gradient-maroon opacity-30 blur-2xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-full overflow-hidden ring-1 ring-border bg-background/40">
            {content.brand.logoUrl && (
              <img src={content.brand.logoUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
        <div className="font-serif text-xl tracking-wide">
          {first}{rest.length > 0 && <><span className="text-accent">.</span>{rest.join(".")}</>}
        </div>
        <div className="h-[2px] w-32 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 bg-gradient-maroon animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
      <style>{`@keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
};
