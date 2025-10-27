import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

const options = [
  { value: "light", label: "Light", icon: <Sun size={18} /> },
  { value: "dark", label: "Dark", icon: <Moon size={18} /> },
  { value: "system", label: "System", icon: <Laptop size={18} /> },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (theme === "dark" || (theme === "system" && darkQuery.matches)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    const listener = () => applyTheme();
    darkQuery.addEventListener("change", listener);
    return () => darkQuery.removeEventListener("change", listener);
  }, [theme]);

  return (
    <div className="relative inline-block">
      {/* Selected / Compact */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center p-2 rounded-md text-gray-800 dark:text-gray-200"
      >
        {options.find((o) => o.value === theme).icon}
      </button>

      {/* Dropdown Options */}
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
