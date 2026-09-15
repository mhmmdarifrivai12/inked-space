export type SectionKey = "about" | "gallery" | "catalog" | "booking" | "faq" | "feedback" | "contact";

export type SiteContent = {
  brand: { name: string; logoUrl: string };
  hero: { tagline: string; title: string; titleAccent: string; subtitle: string; imageUrl: string };
  about: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    p1: string;
    p2: string;
    imageUrl: string;
    stats: { v: string; l: string }[];
  };
  gallery: { src: string; label: string }[];
  catalog: { title: string; titleAccent: string; subtitle: string; buttonLabel: string; pdfUrl: string };
  booking: { title: string; titleAccent: string; subtitle: string; whatsapp: string };
  faq: { q: string; a: string }[];
  feedback: { title: string; titleAccent: string; subtitle: string };
  contact: {
    studioName: string;
    address: string;
    whatsapp: string;
    instagramUrl: string;
    instagramHandle: string;
    tiktokUrl: string;
    tiktokHandle: string;
    mapsUrl: string;
    hours: { day: string; time: string }[];
    locations?: ContactLocation[];
  };
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
};

export type ContactLocation = {
  studioName: string;
  address: string;
  mapsUrl: string;
  hours: { day: string; time: string }[];
};

export const defaultSectionOrder: SectionKey[] = ["about", "gallery", "catalog", "booking", "faq", "feedback", "contact"];

// Empty shell only — no placeholder text or images. Real content always comes from the database.
export const defaultContent: SiteContent = {
  brand: { name: "", logoUrl: "" },
  hero: { tagline: "", title: "", titleAccent: "", subtitle: "", imageUrl: "" },
  about: { eyebrow: "", title: "", titleAccent: "", p1: "", p2: "", imageUrl: "", stats: [] },
  gallery: [],
  catalog: { title: "", titleAccent: "", subtitle: "", buttonLabel: "", pdfUrl: "" },
  booking: { title: "", titleAccent: "", subtitle: "", whatsapp: "" },
  faq: [],
  feedback: { title: "", titleAccent: "", subtitle: "" },
  contact: {
    studioName: "",
    address: "",
    whatsapp: "",
    instagramUrl: "",
    instagramHandle: "",
    tiktokUrl: "",
    tiktokHandle: "",
    mapsUrl: "",
    hours: [],
    locations: [],
  },
  sectionOrder: defaultSectionOrder,
  hiddenSections: [],
};

// Deep merge for partial DB content
export function mergeContent(partial: any): SiteContent {
  if (!partial || typeof partial !== "object") return defaultContent;
  const merged: any = { ...defaultContent };
  for (const k of Object.keys(defaultContent) as (keyof SiteContent)[]) {
    const p = partial[k];
    if (p == null) continue;
    if (Array.isArray(p)) merged[k] = p;
    else if (typeof p === "object") merged[k] = { ...(defaultContent[k] as any), ...p };
    else merged[k] = p;
  }
  // Sanitize sectionOrder: keep only valid keys, append any missing defaults
  const valid = new Set(defaultSectionOrder);
  const ord = Array.isArray(merged.sectionOrder) ? merged.sectionOrder.filter((s: any) => valid.has(s)) : [];
  for (const s of defaultSectionOrder) if (!ord.includes(s)) ord.push(s);
  merged.sectionOrder = ord;
  merged.hiddenSections = Array.isArray(merged.hiddenSections)
    ? merged.hiddenSections.filter((s: any) => valid.has(s))
    : [];
  // Migrate legacy single-location fields into locations[] when present
  if (!Array.isArray(merged.contact?.locations)) merged.contact.locations = [];
  if (merged.contact.locations.length === 0 && (merged.contact.studioName || merged.contact.address)) {
    merged.contact.locations = [{
      studioName: merged.contact.studioName || "",
      address: merged.contact.address || "",
      mapsUrl: merged.contact.mapsUrl || "",
      hours: Array.isArray(merged.contact.hours) ? merged.contact.hours : [],
    }];
  }
  return merged as SiteContent;
}
