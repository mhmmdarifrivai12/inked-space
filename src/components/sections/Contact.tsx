import { Instagram, MapPin, MessageCircle, ArrowUpRight, Clock, Navigation } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82a4.28 4.28 0 0 1-3.77-2.32h-2.7v11.04a2.5 2.5 0 1 1-1.78-2.4V9.36a5.27 5.27 0 1 0 4.48 5.21V9.13a7.05 7.05 0 0 0 3.77 1.1V7.5a4.3 4.3 0 0 1 0-1.68z"/>
  </svg>
);

export const Contact = () => {
  const { content: { contact } } = useSiteContent();
  const mapsUrl = contact.mapsUrl?.trim() || "https://maps.google.com/?q=" + encodeURIComponent(contact.address);
  const links = [
    { Icon: MessageCircle, label: "WhatsApp", sub: "Chat langsung dengan artist", href: `https://wa.me/${contact.whatsapp}` },
    { Icon: Instagram, label: "Instagram", sub: contact.instagramHandle, href: contact.instagramUrl },
    { Icon: TiktokIcon, label: "TikTok", sub: contact.tiktokHandle, href: contact.tiktokUrl },
  ];

  return (
    <section id="contact" className="py-12 md:py-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Terhubung</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">Mari <em className="text-gradient-gold">Berbincang</em></h2>
        </div>

        <div className="space-y-3 mb-8">
          {links.filter((l) => l.href).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="glass group flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 hover:maroon-glow hover:-translate-y-0.5">
              <div className="h-12 w-12 rounded-xl bg-gradient-maroon flex items-center justify-center text-primary-foreground dark:text-foreground">
                <l.Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.sub}</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-45" />
            </a>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 maroon-glow">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-maroon flex items-center justify-center text-primary-foreground dark:text-foreground shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Studio</p>
              <h3 className="font-serif text-xl mb-2">{contact.studioName}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{contact.address}</p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-accent" />
              <p className="text-xs tracking-[0.25em] uppercase text-accent">Jam Buka</p>
            </div>
            <ul className="space-y-2">
              {contact.hours.map((h, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="font-medium">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 w-full bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-xl py-3 text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 hover:maroon-glow">
            <Navigation className="h-4 w-4" />
            Buka di Google Maps
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>
    </section>
  );
};
