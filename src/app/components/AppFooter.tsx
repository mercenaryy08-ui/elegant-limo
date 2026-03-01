import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { ThemeToggle } from './ThemeToggle';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER || '38348263151';
const SDIT_URL = 'https://sdit-services.com/';

export function AppFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const isOps = location.pathname.startsWith('/ops');

  const handleLogoClick = () => {
    if (isOps) return;
    navigate('/');
  };

  const contactSupportHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need support from Elegant Limo.')}`;

  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-[#d4af37]/10 text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo + motto */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleLogoClick}
              className="bg-transparent border-none cursor-pointer p-0"
              aria-label="Elegant Limo"
            >
              <img src="/images/logoelegantlimo.png" alt="Elegant Limo" className="w-12 h-12 rounded-lg object-cover" />
            </button>
            <p className="text-xs max-w-[220px] text-muted-foreground">{t.footer.motto}</p>
          </div>

          {/* Home · Cancel booking · Privacy · Terms */}
          {!isOps && (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <button
                type="button"
                onClick={handleLogoClick}
                className="text-foreground font-medium hover:text-[#d4af37] transition-colors bg-transparent border-none"
              >
                {t.nav.home}
              </button>
              <span className="text-muted-foreground">·</span>
              <button
                type="button"
                onClick={() => navigate('/cancel-booking')}
                className="text-foreground/80 hover:text-[#d4af37] transition-colors bg-transparent border-none"
              >
                {t.cancelBooking.pageTitle}
              </button>
              <span className="text-muted-foreground">·</span>
              <Link to="/privacy" className="text-foreground/80 hover:text-[#d4af37] transition-colors">
                {t.footer.privacy}
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/terms" className="text-foreground/80 hover:text-[#d4af37] transition-colors">
                {t.footer.terms}
              </Link>
            </div>
          )}

          {/* Theme + Language */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ThemeToggle />
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors bg-transparent border ${
                  language === 'en' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent hover:border-muted-foreground/50'
                }`}
                aria-label="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors bg-transparent border ${
                  language === 'de' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent hover:border-muted-foreground/50'
                }`}
                aria-label="Deutsch"
              >
                DE
              </button>
            </span>
          </div>

          {/* Powered by · All rights reserved · Contact support */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
            <span>{t.footer.poweredBy}</span>
            <a
              href={SDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/80 hover:text-[#d4af37] transition-colors"
            >
              SD IT Services
            </a>
            <span className="text-muted-foreground">·</span>
            <span>{t.footer.allRightsReserved}</span>
            {!isOps && (
              <>
                <span className="text-muted-foreground">·</span>
                <a
                  href={contactSupportHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-[#d4af37] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                  {t.nav.contactSupport}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
