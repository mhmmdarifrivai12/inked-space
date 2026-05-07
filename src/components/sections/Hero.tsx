import { ArrowRight, Sparkles, BookOpen, Eye } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Hero = () => {
  const {
    content: { hero },
  } = useSiteContent();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src={hero.imageUrl}
          alt="Tato jagua ink artistik"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs tracking-[0.2em] uppercase mb-8 animate-fade-in text-amber-100 border border-white/10">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>{hero.tagline}</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-light leading-[0.95] text-amber-50 animate-fade-up">
          {hero.title}
          <span className="block italic text-gradient-gold mt-2">
            {hero.titleAccent}
          </span>
        </h1>

        <p
          className="mt-8 text-base sm:text-lg text-amber-100/90 max-w-xl mx-auto animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {hero.subtitle}
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 animate-fade-up w-full max-w-md mx-auto sm:max-w-none"
          style={{ animationDelay: "0.4s" }}
        >
          {/* Primary Action */}
          <a
            href="#booking"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-maroon text-amber-50 px-10 py-5 rounded-2xl text-base font-medium tracking-wide hover:shadow-glow transition-all duration-500 hover:scale-[1.02] overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative">Book Your Session</span>
            <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="#catalog"
              className="group relative inline-flex items-center justify-center gap-2 border-2 border-amber-600/50 backdrop-blur-md bg-amber-950/20 text-amber-100 px-6 py-3.5 rounded-xl text-sm font-medium tracking-wide hover:border-amber-500 hover:bg-amber-950/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <BookOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Browse Catalog</span>
            </a>
            <a
              href="#gallery"
              className="group relative inline-flex items-center justify-center gap-2 border-2 border-amber-600/30 backdrop-blur-md bg-white/5 text-amber-100 px-6 py-3.5 rounded-xl text-sm font-medium tracking-wide hover:border-amber-500/50 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>View Gallery</span>
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-100/60 text-xs tracking-[0.3em] animate-fade-in">
        SCROLL
      </div>
    </section>
  );
};
