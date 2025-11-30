import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-full border-2 border-border hover:border-primary bg-background flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group"
      aria-label="Toggle theme"
    >
      {/* Sun icon */}
      <Sun className="absolute h-5 w-5 text-primary transition-all duration-500 ease-out rotate-0 scale-100 dark:-rotate-180 dark:scale-0" />
      {/* Moon icon */}
      <Moon className="absolute h-5 w-5 text-primary transition-all duration-500 ease-out rotate-180 scale-0 dark:rotate-0 dark:scale-100" />
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
    </button>
  );
}
