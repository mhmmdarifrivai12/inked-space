import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultContent, defaultSectionOrder, SectionKey, SiteContent } from "@/lib/defaultContent";
import { toast } from "sonner";
import {
  Loader2, LogOut, Plus, Save, Trash2, ExternalLink, ArrowUp, ArrowDown,
  Image as ImageIcon, Layout, Star, Menu, X, MailOpen, Mail, Inbox, Settings2, ListOrdered,
} from "lucide-react";

const Field = ({ label, value, onChange, type = "text", textarea }: any) => (
  <div>
    <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{label}</label>
    {textarea ? (
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-y" />
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
    )}
  </div>
);

const Card = ({ title, children }: any) => (
  <section className="glass rounded-3xl p-5 sm:p-6 md:p-8">
    <h2 className="font-serif text-lg sm:text-xl mb-4 sm:mb-5 text-accent">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

type FeedbackRow = {
  id: string; name: string; message: string; rating: number | null;
  read: boolean; created_at: string;
};

type Tab = "brand" | "hero" | "about" | "gallery" | "catalog" | "booking" | "faq" | "feedback" | "contact" | "order" | "inbox";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "brand", label: "Brand", icon: Settings2 },
  { id: "hero", label: "Hero", icon: Layout },
  { id: "about", label: "About", icon: Layout },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "catalog", label: "Katalog", icon: Layout },
  { id: "booking", label: "Booking", icon: Layout },
  { id: "faq", label: "FAQ", icon: Layout },
  { id: "feedback", label: "Kritik & Saran", icon: Star },
  { id: "contact", label: "Contact", icon: Layout },
  { id: "order", label: "Urutan Section", icon: ListOrdered },
  { id: "inbox", label: "Inbox Masukan", icon: Inbox },
];

export default function Admin() {
  const { session, loading: authLoading } = useAuth();
  const { content, refresh } = useSiteContent();
  const nav = useNavigate();
  const [c, setC] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("brand");
  const [navOpen, setNavOpen] = useState(false);
  const [inbox, setInbox] = useState<FeedbackRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loadingInbox, setLoadingInbox] = useState(false);

  useEffect(() => { setC(content); }, [content]);

  const fetchInbox = async () => {
    setLoadingInbox(true);
    const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
    setInbox((data as FeedbackRow[]) || []);
    setUnread(((data as FeedbackRow[]) || []).filter((r) => !r.read).length);
    setLoadingInbox(false);
  };
  useEffect(() => { if (session) fetchInbox(); }, [session]);

  if (authLoading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!session) return <Navigate to="/auth" replace />;

  const setPath = (path: (string | number)[], val: any) => {
    setC((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      let o = next;
      for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
      o[path[path.length - 1]] = val;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings")
      .update({ data: c as any, updated_by: session.user.id })
      .eq("id", "main");
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    refresh();
  };

  const reset = () => { setC(defaultContent); toast("Direset ke default. Klik Simpan untuk menerapkan."); };
  const signOut = async () => { await supabase.auth.signOut(); nav("/auth"); };

  const toggleRead = async (row: FeedbackRow) => {
    const { error } = await supabase.from("feedback").update({ read: !row.read } as any).eq("id", row.id);
    if (error) return toast.error(error.message);
    fetchInbox();
  };
  const removeFeedback = async (id: string) => {
    if (!confirm("Hapus masukan ini?")) return;
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) return toast.error(error.message);
    fetchInbox();
  };

  const labels: Record<SectionKey, string> = {
    about: "About", gallery: "Gallery", catalog: "Katalog",
    booking: "Booking", faq: "FAQ", feedback: "Kritik & Saran", contact: "Contact",
  };

  const NavList = () => (
    <nav className="space-y-1">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        const count = t.id === "inbox" ? unread : 0;
        return (
          <button key={t.id} onClick={() => { setTab(t.id); setNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-gradient-maroon text-primary-foreground dark:text-foreground" : "hover:bg-secondary/50 text-muted-foreground"}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{t.label}</span>
            {count > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-background font-semibold">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const isDataTab = tab !== "inbox";

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden p-2 -ml-2" onClick={() => setNavOpen(true)} aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-xl truncate">Dashboard Admin</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link to="/" target="_blank" className="glass rounded-full px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs flex items-center gap-1.5 hover:maroon-glow transition-all">
              <ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Lihat Site</span>
            </Link>
            <button onClick={signOut} className="glass rounded-full px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs flex items-center gap-1.5 hover:maroon-glow transition-all">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-background border-r border-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-lg">Menu</span>
              <button onClick={() => setNavOpen(false)} className="p-2"><X className="h-5 w-5" /></button>
            </div>
            <NavList />
          </aside>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="hidden md:block">
          <div className="sticky top-24 glass rounded-2xl p-3">
            <NavList />
          </div>
        </aside>

        <div className="space-y-6 min-w-0">
          {tab === "brand" && (
            <Card title="Brand">
              <Field label="Nama Toko" value={c.brand.name} onChange={(v: string) => setPath(["brand", "name"], v)} />
              <Field label="Logo URL" value={c.brand.logoUrl} onChange={(v: string) => setPath(["brand", "logoUrl"], v)} />
              {c.brand.logoUrl && <img src={c.brand.logoUrl} alt="" className="h-16 w-16 object-cover rounded-full bg-background/40 ring-1 ring-border" />}
            </Card>
          )}

          {tab === "hero" && (
            <Card title="Hero">
              <Field label="Tagline (chip)" value={c.hero.tagline} onChange={(v: string) => setPath(["hero", "tagline"], v)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Judul" value={c.hero.title} onChange={(v: string) => setPath(["hero", "title"], v)} />
                <Field label="Judul Aksen (italic gold)" value={c.hero.titleAccent} onChange={(v: string) => setPath(["hero", "titleAccent"], v)} />
              </div>
              <Field label="Subtitle" value={c.hero.subtitle} onChange={(v: string) => setPath(["hero", "subtitle"], v)} textarea />
              <Field label="Background Image URL" value={c.hero.imageUrl} onChange={(v: string) => setPath(["hero", "imageUrl"], v)} />
            </Card>
          )}

          {tab === "about" && (
            <Card title="About">
              <Field label="Eyebrow" value={c.about.eyebrow} onChange={(v: string) => setPath(["about", "eyebrow"], v)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Judul" value={c.about.title} onChange={(v: string) => setPath(["about", "title"], v)} />
                <Field label="Judul Aksen" value={c.about.titleAccent} onChange={(v: string) => setPath(["about", "titleAccent"], v)} />
              </div>
              <Field label="Paragraf 1" value={c.about.p1} onChange={(v: string) => setPath(["about", "p1"], v)} textarea />
              <Field label="Paragraf 2" value={c.about.p2} onChange={(v: string) => setPath(["about", "p2"], v)} textarea />
              <Field label="Image URL" value={c.about.imageUrl} onChange={(v: string) => setPath(["about", "imageUrl"], v)} />
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Stats (3 item)</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {c.about.stats.map((s, i) => (
                    <div key={i} className="space-y-2">
                      <input value={s.v} onChange={(e) => setPath(["about", "stats", i, "v"], e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm" placeholder="Value" />
                      <input value={s.l} onChange={(e) => setPath(["about", "stats", i, "l"], e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm" placeholder="Label" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {tab === "gallery" && (
            <Card title="Gallery (URL Gambar)">
              <div className="space-y-3">
                {c.gallery.map((g, i) => (
                  <div key={i} className="flex gap-2 sm:gap-3 items-start">
                    {g.src && <img src={g.src} alt="" className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-lg shrink-0" />}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2 min-w-0">
                      <input value={g.src} onChange={(e) => setPath(["gallery", i, "src"], e.target.value)}
                        placeholder="URL gambar" className="bg-background/50 border border-border rounded-xl px-3 py-2 text-sm min-w-0" />
                      <input value={g.label} onChange={(e) => setPath(["gallery", i, "label"], e.target.value)}
                        placeholder="Label" className="bg-background/50 border border-border rounded-xl px-3 py-2 text-sm" />
                    </div>
                    <button onClick={() => setPath(["gallery"], c.gallery.filter((_, j) => j !== i))}
                      className="p-2 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => setPath(["gallery"], [...c.gallery, { src: "", label: "" }])}
                  className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2 hover:maroon-glow"><Plus className="h-3.5 w-3.5" /> Tambah Gambar</button>
              </div>
            </Card>
          )}

          {tab === "catalog" && (
            <Card title="Katalog (PDF)">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Judul" value={c.catalog.title} onChange={(v: string) => setPath(["catalog", "title"], v)} />
                <Field label="Judul Aksen" value={c.catalog.titleAccent} onChange={(v: string) => setPath(["catalog", "titleAccent"], v)} />
              </div>
              <Field label="Subtitle" value={c.catalog.subtitle} onChange={(v: string) => setPath(["catalog", "subtitle"], v)} />
              <Field label="Label Tombol" value={c.catalog.buttonLabel} onChange={(v: string) => setPath(["catalog", "buttonLabel"], v)} />
              <Field label="URL PDF Katalog (kosongkan untuk sembunyikan)" value={c.catalog.pdfUrl} onChange={(v: string) => setPath(["catalog", "pdfUrl"], v)} />
              <p className="text-xs text-muted-foreground">Tip: pakai link PDF langsung (Drive: gunakan format /preview).</p>
            </Card>
          )}

          {tab === "booking" && (
            <Card title="Booking">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Judul" value={c.booking.title} onChange={(v: string) => setPath(["booking", "title"], v)} />
                <Field label="Judul Aksen" value={c.booking.titleAccent} onChange={(v: string) => setPath(["booking", "titleAccent"], v)} />
              </div>
              <Field label="Subtitle" value={c.booking.subtitle} onChange={(v: string) => setPath(["booking", "subtitle"], v)} />
              <Field label="Nomor WhatsApp Tujuan (cth: 6289624466641)" value={c.booking.whatsapp} onChange={(v: string) => setPath(["booking", "whatsapp"], v)} />
            </Card>
          )}

          {tab === "faq" && (
            <Card title="FAQ">
              <div className="space-y-3">
                {c.faq.map((f, i) => (
                  <div key={i} className="glass rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <input value={f.q} onChange={(e) => setPath(["faq", i, "q"], e.target.value)}
                        placeholder="Pertanyaan" className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 text-sm font-medium min-w-0" />
                      <button onClick={() => setPath(["faq"], c.faq.filter((_, j) => j !== i))}
                        className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <textarea value={f.a} onChange={(e) => setPath(["faq", i, "a"], e.target.value)}
                      placeholder="Jawaban" rows={2} className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-sm resize-y" />
                  </div>
                ))}
                <button onClick={() => setPath(["faq"], [...c.faq, { q: "", a: "" }])}
                  className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2 hover:maroon-glow"><Plus className="h-3.5 w-3.5" /> Tambah FAQ</button>
              </div>
            </Card>
          )}

          {tab === "feedback" && (
            <Card title="Kritik & Saran (teks section)">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Judul" value={c.feedback.title} onChange={(v: string) => setPath(["feedback", "title"], v)} />
                <Field label="Judul Aksen" value={c.feedback.titleAccent} onChange={(v: string) => setPath(["feedback", "titleAccent"], v)} />
              </div>
              <Field label="Subtitle" value={c.feedback.subtitle} onChange={(v: string) => setPath(["feedback", "subtitle"], v)} textarea />
              <p className="text-xs text-muted-foreground">Masukan yang masuk dapat dilihat di tab <strong>Inbox Masukan</strong>.</p>
            </Card>
          )}

          {tab === "contact" && (
            <Card title="Contact">
              <Field label="Nama Studio" value={c.contact.studioName} onChange={(v: string) => setPath(["contact", "studioName"], v)} />
              <Field label="Alamat" value={c.contact.address} onChange={(v: string) => setPath(["contact", "address"], v)} textarea />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="WhatsApp" value={c.contact.whatsapp} onChange={(v: string) => setPath(["contact", "whatsapp"], v)} />
                <Field label="Instagram URL" value={c.contact.instagramUrl} onChange={(v: string) => setPath(["contact", "instagramUrl"], v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Instagram Handle" value={c.contact.instagramHandle} onChange={(v: string) => setPath(["contact", "instagramHandle"], v)} />
                <Field label="TikTok Handle" value={c.contact.tiktokHandle} onChange={(v: string) => setPath(["contact", "tiktokHandle"], v)} />
              </div>
              <Field label="TikTok URL" value={c.contact.tiktokUrl} onChange={(v: string) => setPath(["contact", "tiktokUrl"], v)} />
              <Field label="Google Maps URL (opsional, override link tombol)" value={c.contact.mapsUrl} onChange={(v: string) => setPath(["contact", "mapsUrl"], v)} />
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Jam Buka</p>
                <div className="space-y-2">
                  {c.contact.hours.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={h.day} onChange={(e) => setPath(["contact", "hours", i, "day"], e.target.value)}
                        placeholder="Hari" className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 text-sm min-w-0" />
                      <input value={h.time} onChange={(e) => setPath(["contact", "hours", i, "time"], e.target.value)}
                        placeholder="Jam" className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 text-sm min-w-0" />
                      <button onClick={() => setPath(["contact", "hours"], c.contact.hours.filter((_, j) => j !== i))}
                        className="p-2 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setPath(["contact", "hours"], [...c.contact.hours, { day: "", time: "" }])}
                    className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2 hover:maroon-glow"><Plus className="h-3.5 w-3.5" /> Tambah Hari</button>
                </div>
              </div>
            </Card>
          )}

          {tab === "order" && (
            <Card title="Urutan Section">
              <p className="text-xs text-muted-foreground -mt-2">Atur urutan tampilan section pada halaman utama (di bawah Hero).</p>
              <div className="space-y-2">
                {c.sectionOrder.map((key, i) => {
                  const move = (dir: -1 | 1) => {
                    const j = i + dir;
                    if (j < 0 || j >= c.sectionOrder.length) return;
                    const next = [...c.sectionOrder];
                    [next[i], next[j]] = [next[j], next[i]];
                    setPath(["sectionOrder"], next);
                  };
                  return (
                    <div key={key} className="glass rounded-xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
                      <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                      <span className="flex-1 text-sm">{labels[key]}</span>
                      <button onClick={() => move(-1)} disabled={i === 0} className="p-2 disabled:opacity-30 hover:text-accent"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(1)} disabled={i === c.sectionOrder.length - 1} className="p-2 disabled:opacity-30 hover:text-accent"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  );
                })}
                <button onClick={() => setPath(["sectionOrder"], defaultSectionOrder)} className="text-xs text-muted-foreground hover:text-foreground mt-2">Reset urutan default</button>
              </div>
            </Card>
          )}

          {tab === "inbox" && (
            <Card title={`Inbox Masukan${unread ? ` · ${unread} baru` : ""}`}>
              {loadingInbox ? (
                <div className="py-10 grid place-items-center"><Loader2 className="animate-spin" /></div>
              ) : inbox.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada masukan masuk.</p>
              ) : (
                <ul className="space-y-3">
                  {inbox.map((row) => (
                    <li key={row.id} className={`glass rounded-2xl p-4 sm:p-5 ${row.read ? "opacity-70" : "ring-1 ring-accent/40"}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{row.name}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(row.created_at).toLocaleString("id-ID")}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {row.rating != null && (
                            <span className="flex items-center gap-1 text-xs text-accent">
                              <Star className="h-3.5 w-3.5 fill-accent" /> {row.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{row.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-3">
                        <button onClick={() => toggleRead(row)} className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground" title={row.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}>
                          {row.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                        </button>
                        <button onClick={() => removeFeedback(row.id)} className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </div>

      {isDataTab && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button onClick={reset} className="text-[11px] sm:text-xs text-muted-foreground hover:text-foreground">Reset ke default</button>
            <button onClick={save} disabled={saving}
              className="bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider hover:shadow-glow transition-all disabled:opacity-60 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
