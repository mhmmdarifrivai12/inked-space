import { useSiteContent } from "@/hooks/useSiteContent";

export const About = () => {
  const { content: { about } } = useSiteContent();
  return (
    <section id="about" className="py-12 md:py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-maroon rounded-[2rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700" />
          <img src={about.imageUrl} alt="Studio inked.space" loading="lazy" className="relative rounded-[2rem] shadow-soft w-full" />
        </div>

        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">{about.eyebrow}</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-5">
            {about.title} <em className="text-gradient-gold">{about.titleAccent}</em>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3 text-sm sm:text-base">{about.p1}</p>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">{about.p2}</p>
          <div className="grid grid-cols-3 gap-4">
            {about.stats.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <div className="font-serif text-2xl text-accent">{s.v}</div>
                <div className="text-xs text-muted-foreground tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
