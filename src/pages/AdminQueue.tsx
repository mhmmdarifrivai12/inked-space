import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QueuePanel } from "@/components/admin/QueuePanel";
import { ArrowLeft, ExternalLink, Loader2, LogOut } from "lucide-react";

export default function AdminQueue() {
  const { session, loading } = useAuth();
  const nav = useNavigate();

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!session) return <Navigate to="/auth" replace />;

  const signOut = async () => { await supabase.auth.signOut(); nav("/auth"); };

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/admin" className="glass rounded-full p-2 hover:maroon-glow" aria-label="Kembali ke dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-xl truncate">Manajemen Antrian</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link to="/queue" target="_blank" className="glass rounded-full px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs flex items-center gap-1.5 hover:maroon-glow">
              <ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Halaman Publik</span>
            </Link>
            <button onClick={signOut} className="glass rounded-full px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs flex items-center gap-1.5 hover:maroon-glow">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <QueuePanel />
      </div>
    </main>
  );
}
