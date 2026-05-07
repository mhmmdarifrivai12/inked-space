import { useMemo, useState } from "react";
import { BookOpen, X, ExternalLink } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

// Convert popular share links into embeddable preview URLs
function toEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    // Google Drive: /file/d/<ID>/view -> /file/d/<ID>/preview
    if (u.hostname.includes("drive.google.com")) {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      const id = m?.[1] || u.searchParams.get("id");
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }
    // Dropbox: force raw
    if (u.hostname.includes("dropbox.com")) {
      u.searchParams.set("raw", "1");
      return u.toString();
    }
    // Direct PDF or other -> use Google Docs viewer for reliability
    if (/\.pdf($|\?)/i.test(u.pathname)) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
}

export const Catalog = () => {
  const { content: { catalog } } = useSiteContent();
  const [open, setOpen] = useState(false);
  const embedUrl = useMemo(() => toEmbedUrl(catalog.pdfUrl), [catalog.pdfUrl]);
  if (!catalog.pdfUrl) return null;

  return (
    <section id="catalog" className="py-12 md:py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Koleksi</p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
          {catalog.title} <em className="text-gradient-gold">{catalog.titleAccent}</em>
        </h2>
        <p className="text-muted-foreground mt-3 mb-7 text-sm sm:text-base">{catalog.subtitle}</p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-maroon text-primary-foreground dark:text-foreground px-8 py-4 rounded-full text-sm tracking-wide hover:shadow-glow transition-all duration-500 hover:scale-105"
        >
          <BookOpen className="h-4 w-4" /> {catalog.buttonLabel}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[92vh] glass rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-background/60">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="h-4 w-4 text-accent shrink-0" />
                <h3 className="font-serif text-base sm:text-lg truncate">
                  {catalog.title} <em className="text-gradient-gold">{catalog.titleAccent}</em>
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={catalog.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buka di tab baru"
                  className="h-9 w-9 rounded-full hover:bg-background/80 flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup"
                  className="h-9 w-9 rounded-full hover:bg-background/80 flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <iframe
              src={embedUrl}
              title="Katalog"
              className="w-full flex-1 bg-background"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </section>
  );
};
