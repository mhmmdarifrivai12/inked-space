import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.jpeg";
import about from "@/assets/about2.jpg";

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
  };
  sectionOrder: SectionKey[];
};

export const defaultSectionOrder: SectionKey[] = ["about", "gallery", "catalog", "booking", "faq", "feedback", "contact"];

export const defaultContent: SiteContent = {
  brand: { name: "Inked Space", logoUrl: logo },
  hero: {
    tagline: "Jagua Ink Tattoo Studio",
    title: "Seni Tanpa",
    titleAccent: "Penyesalan.",
    subtitle:
      "Natural · Safe · Halal — tato temporer berbasis jagua ink yang luntur secara alami dalam 2 minggu.",
    imageUrl: hero,
  },
  about: {
    eyebrow: "Tentang Kami",
    title: "Brand untuk yang mencintai seni —",
    titleAccent: "tanpa permanen.",
    p1: "inked.space lahir dari kecintaan pada estetika tubuh dan kebebasan berekspresi. Kami menghadirkan pengalaman tato yang aman, natural, dan dapat diakses semua orang.",
    p2: "Menggunakan Jagua Ink — pewarna alami dari buah Genipa Americana asal Amerika Selatan. Hasil akhir hitam pekat menyerupai tato permanen, halal, food-grade, dan luntur sempurna dalam 10–14 hari.",
    imageUrl: about,
    stats: [
      { v: "100%", l: "Natural" },
      { v: "14d", l: "Tahan Lama" },
      { v: "Halal", l: "Bersertifikat" },
    ],
  },
  gallery: [
    { src: g2, label: "Mandala" },
    { src: g1, label: "Botanical" },
    { src: g4, label: "Floral" },
    { src: g5, label: "Geometric" },
    { src: g3, label: "Minimal" },
    { src: g6, label: "Tribal" },
  ],
  catalog: {
    title: "Lihat",
    titleAccent: "Katalog",
    subtitle: "Telusuri katalog desain lengkap kami dalam bentuk PDF.",
    buttonLabel: "Buka Katalog",
    pdfUrl: "",
  },
  booking: {
    title: "Book Your",
    titleAccent: "Session",
    subtitle: "Isi form, kami konfirmasi via WhatsApp.",
    whatsapp: "6289624466641",
  },
  faq: [
    { q: "Apa itu Jagua Ink?", a: "Pewarna alami dari buah Genipa Americana. Menghasilkan warna hitam-kebiruan yang menyerupai tato permanen, namun hanya bertahan 10–14 hari." },
    { q: "Apakah aman dan halal?", a: "Ya. 100% natural, food-grade, bebas PPD, tidak menyebabkan iritasi pada kulit normal, dan halal karena terbuat dari ekstrak buah." },
    { q: "Berapa lama proses pembuatannya?", a: "Tergantung kompleksitas desain — umumnya 30 menit hingga 2 jam. Warna penuh muncul setelah 24–48 jam." },
    { q: "Apakah bisa custom desain?", a: "Tentu. Kirimkan referensi atau ide pada saat booking, dan artist kami akan mendiskusikan bersama Anda." },
    { q: "Bagaimana cara merawatnya?", a: "Hindari basah selama 2 jam pertama, jangan digosok, dan oleskan pelembab harian untuk menjaga ketajaman warna." },
  ],
  feedback: {
    title: "Kritik &",
    titleAccent: "Saran",
    subtitle: "Bantu kami berkembang. Bagikan pengalaman, masukan, atau ide Anda.",
  },
  contact: {
    studioName: "Kedai Atap",
    address: "Kost Elvindo, Jl. Bumi Manti IV lantai atas, Kp. Baru, Kec. Kedaton, Kota Bandar Lampung",
    whatsapp: "6289624466641",
    instagramUrl: "https://instagram.com",
    instagramHandle: "@inked.space",
    tiktokUrl: "https://tiktok.com/@inked.space",
    tiktokHandle: "@inked.space",
    mapsUrl: "",
    hours: [
      { day: "Jumat – Sabtu", time: "18.00 – 22.00 WIB" }
    ],
  },
  sectionOrder: defaultSectionOrder,
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
  return merged as SiteContent;
}
