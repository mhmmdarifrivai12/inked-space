import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ringAlarm, playChime } from "@/lib/queueSound";
import { toast } from "sonner";
import { Loader2, BellRing, Lock, Unlock, Volume2, VolumeX, ArrowLeft, Ticket } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type State = { id: string; is_open: boolean; current_number: number; session_id: string; updated_at: string };
type Ticket = { id: string; session_id: string; number: number; name: string; status: string; created_at: string };

const LS_KEY = "queue_my_ticket";

export default function Queue() {
  const { content } = useSiteContent();
  const nav = useNavigate();
  const [state, setState] = useState<State | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState<{ id: string; number: number; session_id: string; name: string } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mineRef = useRef(mine);
  mineRef.current = mine;
  const rungRef = useRef<Set<string>>(new Set()); // ticketIds already alerted
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // Load existing ticket from LS — auto-take new ticket if none (no modal, frictionless QR flow)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        setMine(JSON.parse(raw));
        return;
      }
    } catch {}
    // No existing ticket → auto-take after state loads
  }, []);

  // Auto take ticket once state is loaded and user has none
  const autoTakeRef = useRef(false);
  useEffect(() => {
    if (autoTakeRef.current) return;
    if (loading || mine || !state) return;
    autoTakeRef.current = true;
    if (state.is_open) takeTicket(true);
  }, [loading, state, mine]);

  const fetchAll = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from("queue_state").select("*").eq("id", "main").maybeSingle(),
      supabase.from("queue_tickets").select("*").order("number", { ascending: true }),
    ]);
    setState(s as State | null);
    const list = ((t as Ticket[]) || []).filter((x) => !s || x.session_id === (s as State).session_id);
    setTickets(s ? list : []);

    const m = mineRef.current;
    if (m && s) {
      const stillHere = list.some((x) => x.id === m.id);
      const sessionOk = m.session_id === (s as State).session_id;
      if (!stillHere || !sessionOk) {
        localStorage.removeItem(LS_KEY);
        setMine(null);
        if (sessionOk && !stillHere) toast.error("Nomor antrian Anda dibatalkan oleh admin");
      }
    }
    setLoading(false);
  };

  // Realtime listeners (DB + broadcast for instant call alerts)
  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("queue_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_state" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => fetchAll())
      .subscribe();

    const bc = supabase
      .channel("queue_calls")
      .on("broadcast", { event: "call" }, ({ payload }) => {
        const m = mineRef.current;
        if (!m) return;
        const matched = payload?.ticketId === m.id || payload?.number === m.number;
        if (!matched) return;
        triggerAlert(m.id, m.number, m.name);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      supabase.removeChannel(bc);
    };
  }, []);

  // DB-driven fallback: if my ticket becomes "serving" or current_number == mine, alert
  useEffect(() => {
    const m = mineRef.current;
    if (!m || !state) return;
    const myTicket = tickets.find((t) => t.id === m.id);
    const isServing = myTicket?.status === "serving" || state.current_number === m.number;
    if (isServing && !rungRef.current.has(m.id)) {
      triggerAlert(m.id, m.number, m.name);
    }
  }, [tickets, state]);

  const triggerAlert = (ticketId: string, n: number, name: string) => {
    if (rungRef.current.has(ticketId)) return;
    rungRef.current.add(ticketId);
    if (soundRef.current) ringAlarm(n, name).catch(() => {});
    try { (navigator as any)?.vibrate?.([400, 200, 400, 200, 600]); } catch {}
    showNotification(n);
    toast.success(`Giliran Anda! Nomor ${n}`, { duration: 10000 });
  };



  const showNotification = (n: number) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification("Giliran Antrian Anda", {
        body: `Nomor ${String(n).padStart(2, "0")} dipanggil. Silakan menuju ruang tato.`,
        icon: "/placeholder.svg",
        tag: "queue-call",
      });
    } catch {}
  };

  const requestPermissions = async () => {
    // Unlock audio context with a quiet chime
    try { await playChime(); } catch {}
    // Ask notification permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
  };

  const takeTicket = async (auto: boolean = false) => {
    setConfirmOpen(false);
    if (!state) {
      // wait for state to load
      const { data: s } = await supabase.from("queue_state").select("*").eq("id", "main").maybeSingle();
      if (!s) return toast.error("Sistem antrian belum siap");
      setState(s as State);
    }
    const s = state || (await supabase.from("queue_state").select("*").eq("id", "main").maybeSingle()).data as State;
    if (!s?.is_open) return toast.error("Antrian sedang ditutup");

    setSubmitting(true);
    if (!auto) await requestPermissions();

    // Generate guest name
    const guestName = `Tamu-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const lastNum = tickets.length ? Math.max(...tickets.map((t) => t.number)) : s.current_number;
    const nextNum = Math.max(lastNum, s.current_number) + 1;

    const { data, error } = await supabase
      .from("queue_tickets")
      .insert({ session_id: s.session_id, number: nextNum, name: guestName })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      fetchAll();
      return toast.error("Gagal mengambil nomor, coba lagi");
    }
    const m = { id: (data as Ticket).id, number: (data as Ticket).number, session_id: (data as Ticket).session_id, name: guestName };
    localStorage.setItem(LS_KEY, JSON.stringify(m));
    setMine(m);
    toast.success(`Nomor antrian Anda: ${m.number}`);
  };

  const declineConfirm = () => {
    setConfirmOpen(false);
    nav("/");
  };

  const confirmCancel = async () => {
    if (!mine) return;
    setCancelOpen(false);
    await supabase.from("queue_tickets").delete().eq("id", mine.id);
    localStorage.removeItem(LS_KEY);
    setMine(null);
    toast.success("Nomor antrian dibatalkan");
    nav("/");
  };

  const isOpen = !!state?.is_open;
  const current = state?.current_number ?? 0;
  const waiting = tickets.filter((t) => t.status !== "done" && t.number !== current).slice(0, 12);
  const servingTickets = tickets.filter((t) => t.status === "serving");
  const ahead = mine ? tickets.filter((t) => t.status !== "done" && t.number < mine.number && t.number !== current).length : 0;
  const myStatus = mine ? (
    tickets.find((x) => x.id === mine.id)?.status === "done" ? "Selesai" :
    tickets.find((x) => x.id === mine.id)?.status === "serving" || mine.number === current ? "Sedang dipanggil" :
    "Menunggu"
  ) : null;

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="glass rounded-full px-3 py-2 text-xs flex items-center gap-1.5 hover:maroon-glow">
            <ArrowLeft className="h-3.5 w-3.5" /> Beranda
          </Link>
          <button onClick={() => setSoundOn((s) => !s)} className="glass rounded-full px-3 py-2 text-xs flex items-center gap-1.5">
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-accent" /> : <VolumeX className="h-3.5 w-3.5" />}
            {soundOn ? "Suara aktif" : "Suara mati"}
          </button>
        </div>

        <header className="text-center mb-8">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-accent mb-2">Antrian</p>
          <h1 className="font-serif text-3xl sm:text-5xl font-light">{content.brand.name}</h1>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] tracking-wider ${isOpen ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`}>
            {isOpen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {isOpen ? "ANTRIAN DIBUKA" : "ANTRIAN DITUTUP"}
          </div>
        </header>

        {loading ? (
          <div className="py-20 grid place-items-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <>
            <section className="glass rounded-3xl p-6 sm:p-10 text-center maroon-glow mb-6">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Sedang Dipanggil</p>
              <div className="font-serif text-7xl sm:text-9xl text-gradient-gold leading-none">
                {current > 0 ? String(current).padStart(2, "0") : "—"}
              </div>
              {servingTickets.length > 1 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Juga dilayani: {servingTickets.filter(t => t.number !== current).map(t => String(t.number).padStart(2,"0")).join(" · ")}
                </p>
              )}
            </section>

            {mine && (
              <section className={`glass rounded-3xl p-5 sm:p-6 mb-6 ${myStatus === "Sedang dipanggil" ? "ring-2 ring-accent animate-pulse" : ""}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Nomor Anda</p>
                    <span className="font-serif text-4xl sm:text-5xl text-accent">{String(mine.number).padStart(2, "0")}</span>
                    <p className="text-xs mt-1">
                      Status: <strong>{myStatus}</strong>
                      {myStatus === "Menunggu" && <> · {ahead} antrian di depan Anda</>}
                    </p>
                  </div>
                  {myStatus === "Sedang dipanggil" && <BellRing className="h-8 w-8 text-accent shrink-0" />}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button onClick={requestPermissions} className="text-[11px] glass rounded-full px-3 py-1.5 hover:maroon-glow inline-flex items-center gap-1.5">
                    <BellRing className="h-3 w-3 text-accent" /> Aktifkan suara & notifikasi
                  </button>
                  <button onClick={() => setCancelOpen(true)} className="text-[11px] text-muted-foreground hover:text-destructive">
                    Batalkan nomor saya
                  </button>
                </div>
              </section>
            )}

            {!mine && (
              <div className="glass rounded-3xl p-6 text-center mb-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {isOpen ? "Mengambil nomor antrian..." : "Antrian sedang ditutup."}
                </p>
                {isOpen && (
                  <button onClick={() => takeTicket(false)} disabled={submitting}
                    className="bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-full px-6 py-3 text-sm tracking-wider inline-flex items-center gap-2 hover:shadow-glow disabled:opacity-50">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ticket className="h-4 w-4" /> Ambil Nomor</>}
                  </button>
                )}
              </div>
            )}

            <section className="glass rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg">Daftar Antrian</h3>
                <span className="text-[11px] text-muted-foreground">{waiting.length} menunggu</span>
              </div>
              {waiting.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada antrian menunggu.</p>
              ) : (
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {waiting.map((t) => (
                    <li key={t.id}
                      className={`flex flex-col items-center justify-center px-2 py-3 rounded-xl ${mine?.id === t.id ? "bg-accent/10 ring-1 ring-accent/40" : "bg-background/40"}`}>
                      <span className="font-serif text-2xl text-accent">{String(t.number).padStart(2, "0")}</span>
                      {mine?.id === t.id && <span className="mt-1 text-[9px] tracking-wider text-accent">ANDA</span>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-4">Nama disembunyikan demi privasi.</p>
            </section>
          </>
        )}

        {/* Cancel ticket */}
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan nomor antrian Anda?</AlertDialogTitle>
              <AlertDialogDescription>
                Nomor antrian Anda akan dihapus dan Anda perlu mengambil nomor baru jika ingin antri kembali.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Tidak</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Ya, Batalkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
