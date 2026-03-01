import { useTheme } from '../contexts/ThemeContext';
import { Switch } from './ui/switch';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <Sun className="w-4 h-4 text-amber-500/90 dark:text-amber-400/70 shrink-0" aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="data-[state=checked]:bg-[#d4af37]/90 dark:data-[state=unchecked]:bg-muted-foreground/20"
      />
      <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300 shrink-0" aria-hidden />
    </label>
  );
}
