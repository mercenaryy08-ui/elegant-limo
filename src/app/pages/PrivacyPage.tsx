import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/ui/button';

export function PrivacyPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const content = {
    en: {
      lastUpdated: 'Last updated: 2025',
      s1Title: '1. Data controller',
      s1: 'Elegant Limo Switzerland is responsible for processing your personal data in connection with bookings, enquiries and use of this website. Contact: via the channels indicated on the website (e.g. email, WhatsApp).',
      s2Title: '2. Data we collect',
      s2: 'We collect name, email, phone number, pickup and destination addresses, travel date and time, number of passengers, and payment information (via Stripe). This data is used for booking fulfilment, communication and legal retention.',
      s3Title: '3. Your rights',
      s3: 'You have the right to access, correct, delete and restrict processing of your data, and to data portability where provided by law. You may lodge a complaint with a supervisory authority.',
      s4Title: '4. Cookies and third parties',
      s4: 'This site may use cookies and third-party services (e.g. Google Maps, reCAPTCHA, Stripe). Please refer to those providers’ privacy policies.',
    },
    de: {
      lastUpdated: 'Stand: 2025',
      s1Title: '1. Verantwortliche Stelle',
      s1: 'Elegant Limo Switzerland ist für die Verarbeitung Ihrer personenbezogenen Daten im Zusammenhang mit Buchungen, Anfragen und der Nutzung dieser Website verantwortlich. Kontakt: über die auf der Website angegebenen Kanäle (z. B. E-Mail, WhatsApp).',
      s2Title: '2. Erhobene Daten',
      s2: 'Wir erfassen Namen, E-Mail, Telefonnummer, Abhol- und Zieladressen, Reisedatum und -zeit, Anzahl der Fahrgäste sowie Zahlungsinformationen (über Stripe). Diese Daten werden für die Buchungsabwicklung, Kommunikation und gesetzliche Aufbewahrung verwendet.',
      s3Title: '3. Ihre Rechte',
      s3: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten sowie auf Datenübertragbarkeit, soweit gesetzlich vorgesehen. Für Beschwerden können Sie sich an eine Aufsichtsbehörde wenden.',
      s4Title: '4. Cookies und Drittanbieter',
      s4: 'Diese Website kann Cookies und Dienste Dritter nutzen (z. B. Google Maps, reCAPTCHA, Stripe). Bitte beachten Sie die jeweiligen Datenschutzerklärungen dieser Anbieter.',
    },
    al: {
      lastUpdated: 'Përditësuar: 2025',
      s1Title: '1. Organi përgjegjës',
      s1: 'Elegant Limo Switzerland është përgjegjës për përpunimin e të dhënave tuaja personale në lidhje me rezervimet, kërkesat dhe përdorimin e kësaj faqeje. Kontakt: përmes kanaleve të treguara në faqe (email, WhatsApp).',
      s2Title: '2. Të dhënat e mbledhura',
      s2: 'Mbledhim emrin, email, telefon, adresat e nisjes dhe të destinacionit, datën dhe orarin e udhëtimit, numrin e pasagjerëve dhe të dhënat e pagesës (përmes Stripe). Këto të dhëna përdoren për përpunimin e rezervimeve, komunikimin dhe ruajtjen ligjore.',
      s3Title: '3. Të drejtat tuaja',
      s3: 'Keni të drejtë për informim, korrigjim, fshirje dhe kufizim të përpunimit të të dhënave tuaja, si dhe për portabilitet të të dhënave, në masën e parashikuar nga ligji.',
      s4Title: '4. Cookies dhe palët e treta',
      s4: 'Kjo faqe mund të përdorë cookies dhe shërbime të palëve të treta (p.sh. Google Maps, reCAPTCHA, Stripe). Ju lutemi konsultoni politikën e privatësisë të këtyre ofruesve.',
    },
  };
  const c = content[language] || content.en;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#d4af37] mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          {t.summary.back}
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t.footer.privacy}</h1>
        <p className="text-sm text-muted-foreground mb-8">Elegant Limo Switzerland · {c.lastUpdated}</p>
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">{c.s1Title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.s1}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">{c.s2Title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.s2}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">{c.s3Title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.s3}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">{c.s4Title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.s4}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
