import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Catalog } from "@/components/sections/Catalog";
import { Booking } from "@/components/sections/Booking";
import { FAQ } from "@/components/sections/FAQ";
import { Feedback } from "@/components/sections/Feedback";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { FloatingWA } from "@/components/FloatingWA";
import { Splash } from "@/components/Splash";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { SectionKey } from "@/lib/defaultContent";

const SECTIONS: Record<SectionKey, React.ComponentType> = {
  about: About,
  gallery: Gallery,
  catalog: Catalog,
  booking: Booking,
  faq: FAQ,
  feedback: Feedback,
  contact: Contact,
};

const Index = () => {
  const { content } = useSiteContent();
  return (
    <>
      <Splash />
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />
        <Hero />
        {content.sectionOrder.map((key) => {
          const C = SECTIONS[key];
          return C ? <C key={key} /> : null;
        })}
        <Footer />
        <FloatingWA />
      </main>
    </>
  );
};

export default Index;
