import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Star, MessageSquareHeart, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  message: z.string().trim().min(5, "Pesan minimal 5 karakter").max(1000),
  rating: z.number().int().min(1).max(5).nullable(),
});

export const Feedback = () => {
  const { content: { feedback } } = useSiteContent();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, message, rating });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("feedback").insert({
      name: parsed.data.name,
      message: parsed.data.message,
      rating: parsed.data.rating,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Terima kasih atas masukannya!");
    setName(""); setMessage(""); setRating(null);
  };

  return (
    <section id="feedback" className="py-12 md:py-24 px-6 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Masukan</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
            {feedback.title} <em className="text-gradient-gold">{feedback.titleAccent}</em>
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">{feedback.subtitle}</p>
        </div>

        <form onSubmit={submit} className="glass rounded-3xl p-5 sm:p-8 space-y-4 maroon-glow">
          <div className="flex items-center gap-2 text-accent">
            <MessageSquareHeart className="h-4 w-4" />
            <span className="text-xs tracking-[0.25em] uppercase">Bagikan pengalaman Anda</span>
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Nama Anda"
              className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Rating (opsional)</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(rating === n ? null : n)}
                  className="p-1 transition-transform hover:scale-110" aria-label={`Beri ${n} bintang`}>
                  <Star className={`h-6 w-6 ${(hover || rating || 0) >= n ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Pesan / Saran</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={4}
              placeholder="Tulis kritik, saran, atau pengalaman Anda di sini…"
              className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-y" />
            <div className="text-[10px] text-muted-foreground text-right mt-1">{message.length}/1000</div>
          </div>

          <button type="submit" disabled={busy}
            className="w-full bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-2xl py-3.5 text-sm tracking-wider hover:shadow-glow transition-all duration-500 hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Kirim Masukan
          </button>
        </form>
      </div>
    </section>
  );
};
