import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-border/50 relative overflow-hidden">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`relative z-10 p-2 rounded-full transition-colors duration-500 ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title={opt.label}
          >
            <Icon className="h-3.5 w-3.5 relative z-10" />
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-background shadow-lift rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
