import { ArrowRight, Sparkles } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Hero = () => {
  const { content: { hero } } = useSiteContent();
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {hero.imageUrl && <img src={hero.imageUrl} alt={hero.title || "Hero"} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs tracking-[0.2em] uppercase mb-8 animate-fade-in text-primary-foreground dark:text-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          <span>{hero.tagline}</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-light leading-[0.95] text-primary-foreground dark:text-foreground animate-fade-up">
          {hero.title}
          <span className="block italic text-gradient-gold mt-2">{hero.titleAccent}</span>
        </h1>

        <p className="mt-8 text-base sm:text-lg text-primary-foreground/80 dark:text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {hero.subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a href="#booking" className="group inline-flex items-center gap-2 bg-gradient-maroon text-primary-foreground dark:text-foreground px-8 py-4 rounded-full text-sm tracking-wide hover:shadow-glow transition-all duration-500 hover:scale-105">
            Book Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="#gallery" className="glass inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide hover:scale-105 transition-all duration-500 text-primary-foreground dark:text-foreground">
            Explore Gallery
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 dark:text-muted-foreground text-xs tracking-[0.3em] animate-fade-in">
        SCROLL
      </div>
    </section>
  );
};
