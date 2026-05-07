import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  detail: z.string().trim().min(3, "Jelaskan detail tato").max(400),
  countSize: z.string().trim().min(1, "Isi jumlah & ukuran").max(120),
  reference: z.string().trim().max(300).optional(),
  whatsapp: z.string().trim().min(8, "Nomor tidak valid").max(20).regex(/^[0-9+\-\s]+$/, "Hanya angka"),
  availability: z.string().trim().min(2, "Isi waktu ketersediaan").max(120),
  location: z.string().trim().min(2, "Isi lokasi appointment").max(150),
});

const fields = [
  { name: "name", label: "Nama", type: "text", placeholder: "Nama lengkap" },
  { name: "detail", label: "Detail Tatto", type: "textarea", placeholder: "Ceritakan desain & gaya tato" },
  { name: "countSize", label: "Jumlah Tatto & Ukuran", type: "text", placeholder: "Cth: 2 tato, 5×5 cm & 10×8 cm" },
  { name: "reference", label: "Referensi Tatto (link/opsional)", type: "textarea", placeholder: "Link gambar / Pinterest / Drive" },
  { name: "whatsapp", label: "Nomor WhatsApp", type: "tel", placeholder: "08xxx" },
  { name: "availability", label: "Waktu Ketersediaan", type: "text", placeholder: "Cth: Sabtu sore / 12 Jun jam 14.00" },
  { name: "location", label: "Lokasi Appointment", type: "text", placeholder: "Cth: Studio / Hotel / Alamat" },
] as const;

export const Booking = () => {
  const { content: { booking } } = useSiteContent();
  const [data, setData] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    const d = result.data;
    const msg =
      `Halo, saya ingin booking sesi tato:\n\n` +
      `*Nama:* ${d.name}\n` +
      `*Detail Tatto:* ${d.detail}\n` +
      `*Jumlah & Ukuran:* ${d.countSize}\n` +
      `*Referensi Tatto:* ${d.reference || "-"}\n` +
      `*Nomor WhatsApp:* ${d.whatsapp}\n` +
      `*Waktu Ketersediaan:* ${d.availability}\n` +
      `*Lokasi Appointment:* ${d.location}`;
    window.open(`https://wa.me/${booking.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Mengarahkan ke WhatsApp...");
  };

  return (
    <section id="booking" className="py-12 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Reservasi</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">{booking.title} <em className="text-gradient-gold">{booking.titleAccent}</em></h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">{booking.subtitle}</p>
        </div>

        <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-10 space-y-5 maroon-glow">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={data[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  maxLength={400}
                  className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
              ) : (
                <input
                  type={f.type}
                  value={data[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  maxLength={150}
                  className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              )}
            </div>
          ))}

          <button type="submit" className="w-full bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-2xl py-4 text-sm tracking-wider hover:shadow-glow transition-all duration-500 hover:scale-[1.02] flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Kirim ke WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
};
