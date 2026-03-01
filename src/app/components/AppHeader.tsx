import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER || '38348263151';

interface AppHeaderProps {
  /** If provided, called when logo is clicked instead of navigating home (e.g. for ops PIN on home). */
  onLogoClick?: () => void;
}

export function AppHeader({ onLogoClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const isOps = location.pathname.startsWith('/ops');
  const isHome = location.pathname === '/';

  const handleLogoClick = () => {
    if (isOps) return;
    if (onLogoClick) onLogoClick();
    else navigate('/');
  };

  const contactSupportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need support from Elegant Limo.')}`;

  if (isOps) return null;

  return (
    <header className="border-b border-[#d4af37]/20 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 text-left min-w-0"
            aria-label="Elegant Limo"
          >
            <img src="/images/logoelegantlimo.png" alt="Elegant Limo" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-foreground truncate">
              Elegant Limo
            </h1>
          </button>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a
              href={contactSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 hidden sm:block" aria-hidden />
              {t.nav.contactSupport}
            </a>
            <button
              type="button"
              onClick={() => (isHome ? document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/'))}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white shadow-sm transition-all"
            >
              {t.nav.bookNow}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
