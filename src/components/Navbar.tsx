import { ThemeToggle } from "./ThemeToggle";
import { useSiteContent } from "@/hooks/useSiteContent";

const links = [
  { href: "#about", label: "About", key: "about" },
  { href: "#gallery", label: "Gallery", key: "gallery" },
  { href: "#catalog", label: "Katalog", key: "catalog" },
  { href: "#booking", label: "Booking", key: "booking" },
  { href: "/queue", label: "Antrian" },
  { href: "#faq", label: "FAQ", key: "faq" },
  { href: "#feedback", label: "Saran", key: "feedback" },
  { href: "#contact", label: "Contact", key: "contact" },
] as const;

export const Navbar = () => {
  const { content } = useSiteContent();
  const hidden = content.hiddenSections ?? [];
  const visibleLinks = links.filter((l) => !("key" in l && hidden.includes(l.key as any)));
  const [first, ...rest] = content.brand.name.split(".");
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 pt-4">
      <nav className="glass max-w-5xl mx-auto rounded-full pl-2 pr-5 py-2 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-background/40 ring-1 ring-border overflow-hidden flex items-center justify-center maroon-glow shrink-0">
            {content.brand.logoUrl && (
              <img src={content.brand.logoUrl} alt={`${content.brand.name} logo`} width={40} height={40} className="h-full w-full object-cover rounded-full" />
            )}
          </span>
          <span className="font-serif text-base sm:text-lg tracking-wide">
            {first}{rest.length > 0 && <><span className="text-accent">.</span>{rest.join(".")}</>}
          </span>
        </a>
        <ul className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {visibleLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-foreground transition-colors duration-300">{l.label}</a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
};
