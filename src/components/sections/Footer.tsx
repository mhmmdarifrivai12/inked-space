import { Instagram, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82a4.28 4.28 0 0 1-3.77-2.32h-2.7v11.04a2.5 2.5 0 1 1-1.78-2.4V9.36a5.27 5.27 0 1 0 4.48 5.21V9.13a7.05 7.05 0 0 0 3.77 1.1V7.5a4.3 4.3 0 0 1 0-1.68z"/>
  </svg>
);

export const Footer = () => {
  const { content } = useSiteContent();
  const [first, ...rest] = content.brand.name.split(".");
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="font-serif text-xl">
          {first}{rest.length > 0 && <><span className="text-accent">.</span>{rest.join(".")}</>}
        </div>
        <div className="flex gap-4">
          {content.contact.instagramUrl && (
            <a href={content.contact.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram" className="glass h-10 w-10 rounded-full flex items-center justify-center hover:maroon-glow transition-all">
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {content.contact.tiktokUrl && (
            <a href={content.contact.tiktokUrl} target="_blank" rel="noopener" aria-label="TikTok" className="glass h-10 w-10 rounded-full flex items-center justify-center hover:maroon-glow transition-all">
              <TiktokIcon className="h-4 w-4" />
            </a>
          )}
          <a href={`https://wa.me/${content.contact.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="glass h-10 w-10 rounded-full flex items-center justify-center hover:maroon-glow transition-all">
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground tracking-wider">© {new Date().getFullYear()} {content.brand.name} — Jagua Ink Tattoo</p>
      </div>
    </footer>
  );
};
