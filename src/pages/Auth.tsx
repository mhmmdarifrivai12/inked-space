import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (session) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Email & password (min. 6 karakter) wajib");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Mengarahkan...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="w-full max-w-md">
        <a href="/" className="block text-center font-serif text-2xl mb-8">
          inked<span className="text-accent">.</span>space
        </a>
        <div className="glass rounded-3xl p-8 maroon-glow">
          <h1 className="font-serif text-2xl mb-1 text-center">
            {mode === "signin" ? "Masuk" : "Daftar"}
          </h1>
          <p className="text-xs text-muted-foreground text-center mb-6 tracking-wider">
            {mode === "signin" ? "Akses dashboard admin" : "Buat akun admin baru"}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
            </div>
            <button type="submit" disabled={busy}
              className="w-full bg-gradient-maroon text-primary-foreground dark:text-foreground rounded-2xl py-3.5 text-sm tracking-wider hover:shadow-glow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Masuk" : "Daftar"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground mt-6 transition-colors">
            {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </main>
  );
}
