import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Lock, Unlock, RotateCcw, Trash2, BellRing, RefreshCw,
  PhoneCall, Check, CheckCircle2,
} from "lucide-react";
import { ringAlarm } from "@/lib/queueSound";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type State = { id: string; is_open: boolean; current_number: number; session_id: string };
type Ticket = { id: string; session_id: string; number: number; name: string; status: string; created_at: string };

export const QueuePanel = () => {
  const [state, setState] = useState<State | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Ticket | null>(null);
  const broadcastRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchAll = async (manual = false) => {
    if (manual) setRefreshing(true);
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from("queue_state").select("*").eq("id", "main").maybeSingle(),
      supabase.from("queue_tickets").select("*").order("number", { ascending: true }),
    ]);
    setState(s as State | null);
    if (s) setTickets(((t as Ticket[]) || []).filter((x) => x.session_id === (s as State).session_id));
    setLoading(false);
    if (manual) {
      setRefreshing(false);
      toast.success("Antrian diperbarui");
    }
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("admin_queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_state" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => fetchAll())
      .subscribe();
    const bc = supabase.channel("queue_calls").subscribe();
    broadcastRef.current = bc;
    return () => {
      supabase.removeChannel(ch);
      supabase.removeChannel(bc);
    };
  }, []);

  const broadcastCall = (ticket: Ticket) => {
    broadcastRef.current?.send({
      type: "broadcast",
      event: "call",
      payload: { ticketId: ticket.id, number: ticket.number, name: ticket.name },
    });
  };

  const toggleOpen = async () => {
    if (!state) return;
    setBusy(true);
    const { error } = await supabase.from("queue_state")
      .update({ is_open: !state.is_open, updated_at: new Date().toISOString() }).eq("id", "main");
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(!state.is_open ? "Antrian dibuka" : "Antrian ditutup");
  };

  const callTicket = async (t: Ticket) => {
    if (!state) return;
    setBusy(true);
    // any current "serving" → keep as serving until finished; allow multiple? user said free order. Keep simple:
    // mark this one serving, set current_number for public display
    await Promise.all([
      supabase.from("queue_state").update({ current_number: t.number, updated_at: new Date().toISOString() }).eq("id", "main"),
      supabase.from("queue_tickets").update({ status: "serving" }).eq("id", t.id),
    ]);
    setBusy(false);
    broadcastCall(t);
    ringAlarm(t.number, t.name).catch(() => {});
    toast.success(`Memanggil nomor ${t.number}`);
  };

  const finishTicket = async (t: Ticket) => {
    setBusy(true);
    const { error } = await supabase.from("queue_tickets").update({ status: "done" }).eq("id", t.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Nomor ${t.number} selesai`);
  };

  const recall = (t: Ticket) => {
    broadcastCall(t);
    ringAlarm(t.number, t.name).catch(() => {});
  };

  const confirmReset = async () => {
    setResetOpen(false);
    setBusy(true);
    if (state) await supabase.from("queue_tickets").delete().eq("session_id", state.session_id);
    await supabase.from("queue_state").update({
      current_number: 0,
      session_id: crypto.randomUUID(),
      updated_at: new Date().toISOString(),
    }).eq("id", "main");
    setBusy(false);
    toast.success("Sesi antrian baru dimulai");
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const t = removeTarget;
    setRemoveTarget(null);
    const { error } = await supabase.from("queue_tickets").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success(`Nomor ${t.number} dibatalkan`);
  };

  if (loading) return <div className="py-10 grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!state) return <p className="text-sm text-muted-foreground">State antrian tidak ditemukan.</p>;

  const active = tickets.filter((t) => t.status !== "done");
  const done = tickets.filter((t) => t.status === "done");

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Status Antrian</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${state.is_open ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`}>
            {state.is_open ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {state.is_open ? "DIBUKA" : "DITUTUP"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Aktif: <strong className="text-foreground">{active.length}</strong> · Selesai: <strong className="text-foreground">{done.length}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="glass rounded-full px-4 py-2.5 text-xs flex items-center gap-2 hover:maroon-glow disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setResetOpen(true)} disabled={busy}
            className="glass rounded-full px-4 py-2.5 text-xs flex items-center gap-2 text-muted-foreground hover:text-destructive">
            <RotateCcw className="h-3.5 w-3.5" /> Sesi Baru
          </button>
          <button onClick={toggleOpen} disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
              state.is_open ? "bg-destructive text-destructive-foreground" : "bg-gradient-maroon text-primary-foreground dark:text-foreground hover:shadow-glow"
            }`}>
            {state.is_open ? <><Lock className="h-4 w-4" /> Tutup</> : <><Unlock className="h-4 w-4" /> Buka</>}
          </button>
        </div>
      </div>

      {/* Active cards */}
      <div>
        <h3 className="font-serif text-base mb-3">Antrian Aktif</h3>
        {active.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Belum ada antrian.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((t) => {
              const isServing = t.status === "serving";
              return (
                <div key={t.id}
                  className={`glass rounded-2xl p-4 flex flex-col gap-3 transition-all ${isServing ? "ring-2 ring-accent maroon-glow" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-serif text-4xl text-gradient-gold leading-none">{String(t.number).padStart(2, "0")}</div>
                      <p className="text-sm mt-2 truncate">{t.name}</p>
                      {isServing && <span className="inline-block mt-1 text-[10px] tracking-[0.2em] uppercase text-accent">Sedang Dipanggil</span>}
                    </div>
                    <button onClick={() => setRemoveTarget(t)} className="p-2 text-muted-foreground hover:text-destructive shrink-0" aria-label="Hapus">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <button onClick={() => isServing ? recall(t) : callTicket(t)} disabled={busy}
                      className="flex-1 bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-full py-2 text-xs flex items-center justify-center gap-1.5 hover:shadow-glow disabled:opacity-50">
                      {isServing ? <><BellRing className="h-3.5 w-3.5" /> Bunyikan</> : <><PhoneCall className="h-3.5 w-3.5" /> Panggil</>}
                    </button>
                    <button onClick={() => finishTicket(t)} disabled={busy}
                      className="flex-1 glass rounded-full py-2 text-xs flex items-center justify-center gap-1.5 hover:text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Selesai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h3 className="font-serif text-base mb-3 text-muted-foreground">Selesai ({done.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {done.slice().reverse().map((t) => (
              <div key={t.id} className="glass rounded-xl p-3 flex items-center gap-3 opacity-70">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-serif text-lg leading-none">{String(t.number).padStart(2, "0")}</div>
                  <p className="text-xs text-muted-foreground truncate">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset dialog */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mulai sesi antrian baru?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua nomor antrian saat ini akan dihapus dan penomoran dimulai ulang dari 1.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Mulai Sesi Baru
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan nomor antrian?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget && <>Nomor <strong>{String(removeTarget.number).padStart(2, "0")}</strong> atas nama <strong>{removeTarget.name}</strong> akan dihapus.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus Nomor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
