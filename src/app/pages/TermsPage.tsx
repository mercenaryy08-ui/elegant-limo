import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/ui/button';

export function TermsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslations(language);

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
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t.footer.terms}</h1>
        <p className="text-sm text-muted-foreground mb-8">Elegant Limo Switzerland · Last updated: 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {language === 'de' ? '1. Geltungsbereich' : language === 'al' ? '1. Fushëveprimi' : '1. Scope'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {language === 'de'
                ? 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Buchungen von Fahrdienstleistungen über die Website von Elegant Limo Switzerland. Mit der Buchung akzeptieren Sie diese AGB.'
                : language === 'al'
                  ? 'Këto Kushte të Përgjithshme zbatohen për të gjitha rezervimet e shërbimeve të transportit përmes faqes së Elegant Limo Switzerland. Duke rezervuar, ju pranoni këto kushte.'
                  : 'These Terms & Conditions apply to all bookings of chauffeur services made through the Elegant Limo Switzerland website. By booking, you accept these terms.'}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {language === 'de' ? '2. Buchung und Zahlung' : language === 'al' ? '2. Rezervimi dhe pagesa' : '2. Booking and payment'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {language === 'de'
                ? 'Die Buchung wird nach Zahlungseingang (z. B. per Karte über Stripe) bestätigt. Preise werden in CHF angezeigt und berechnet. Es gelten die zum Buchungszeitpunkt angezeigten Preise.'
                : language === 'al'
                  ? 'Rezervimi konfirmohet pas pranimit të pagesës (p.sh. me kartë përmes Stripe). Çmimet shfaqen dhe llogariten në CHF. Zbatohen çmimet e shfaqura në kohën e rezervimit.'
                  : 'The booking is confirmed upon receipt of payment (e.g. by card via Stripe). Prices are displayed and charged in CHF. The prices shown at the time of booking apply.'}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {language === 'de' ? '3. Stornierung' : language === 'al' ? '3. Anulimi' : '3. Cancellation'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {language === 'de'
                ? 'Kostenlose Stornierung bis 48 Stunden vor der geplanten Abholung. Zwischen 24 und 48 Stunden vor Abholung: kostenlose Stornierung (Karenz). Weniger als 24 Stunden vor Abholung: 50 % Stornierungsgebühr. Details finden Sie in unserer Stornierungsbedingungen auf der Buchungsseite.'
                : language === 'al'
                  ? 'Anulim falas deri 48 orë para nisjes së planifikuar. Midis 24 dhe 48 orëve para: anulim falas (periudhë e mirë). Më pak se 24 orë para: tarifë anulimi 50 %. Detajet janë në politikën e anulimit në faqen e rezervimit.'
                  : 'Free cancellation up to 48 hours before the scheduled pickup. Between 24 and 48 hours before pickup: free cancellation (grace period). Less than 24 hours before pickup: 50% cancellation fee. See our cancellation policy on the booking page for details.'}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {language === 'de' ? '4. Haftung' : language === 'al' ? '4. Përgjegjësia' : '4. Liability'}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {language === 'de'
                ? 'Elegant Limo Switzerland haftet im gesetzlich zulässigen Umfang für Schäden, die durch die Erbringung der Dienstleistung entstehen. Die Haftung für indirekte oder Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.'
                : language === 'al'
                  ? 'Elegant Limo Switzerland përgjigjet brenda kufijve të ligjit për dëme të shkaktuara nga ofrimi i shërbimit. Përgjegjësia për dëme indirekte ose pasojë përjashtohet ku e lejon ligji.'
                  : 'Elegant Limo Switzerland is liable within the limits of the law for damage arising from the provision of the service. Liability for indirect or consequential damage is excluded where permitted by law.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
