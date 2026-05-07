import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-11 w-11" />;
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Ubah tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass relative h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 hover:maroon-glow"
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-500 ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-500 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} />
    </button>
  );
};
