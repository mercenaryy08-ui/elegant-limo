import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from './ThemeToggle';

export function AppFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isOps = location.pathname.startsWith('/ops');

  const handleElegantLimoClick = () => {
    if (isOps) return;
    navigate('/');
  };

  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-[#d4af37]/10 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {!isOps && (
              <>
                <button
                  type="button"
                  onClick={handleElegantLimoClick}
                  className="text-foreground font-medium hover:text-[#d4af37] transition-colors cursor-pointer bg-transparent border-none"
                  aria-label="Elegant Limo"
                >
                  Elegant Limo
                </button>
                <span className="text-muted-foreground hidden sm:inline">·</span>
              </>
            )}
            <span className="flex items-center justify-center gap-2 text-muted-foreground flex-wrap">
              <span className="text-xs sm:text-sm">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              <ThemeToggle />
            </span>
            <span className="text-muted-foreground hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors bg-transparent border ${
                  language === 'en'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
                aria-label="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors bg-transparent border ${
                  language === 'de'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
                aria-label="Deutsch"
              >
                DE
              </button>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
