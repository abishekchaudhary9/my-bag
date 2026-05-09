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
    <div className="flex items-center gap-1 bg-background/10 dark:bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/5 dark:border-white/10 relative overflow-hidden shadow-sm">
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
                className="absolute inset-0 bg-background dark:bg-white/20 shadow-sm rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
