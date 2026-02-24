import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

const getApiBase = () =>
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';

export function CancelBookingPage() {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslations(language);
  const [bookingReference, setBookingReference] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = bookingReference.trim().toUpperCase();
    const em = email.trim();
    if (!ref) {
      toast.error(t.cancelBooking.refRequired);
      return;
    }
    if (!em) {
      toast.error(t.checkout.emailRequired);
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(em)) {
      toast.error(t.cancelBooking.invalidEmail);
      return;
    }
    setIsSubmitting(true);
    try {
      const apiBase = getApiBase().replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/send-cancellation-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingReference: ref, email: em }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || t.cancelBooking.errorSending);
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error(t.cancelBooking.errorSending);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#d4af37]/30 p-8 text-center">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">{t.cancelBooking.successTitle}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t.cancelBooking.successMessage}</p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white"
          >
            {t.cancelBooking.backHome}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[#d4af37]/20 bg-white/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#0a0a0a] font-medium hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.summary.back}
          </button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <h1 className="text-2xl font-serif font-bold text-[#0a0a0a] mb-2">{t.cancelBooking.pageTitle}</h1>
        <p className="text-muted-foreground text-sm mb-8">{t.cancelBooking.pageSubtitle}</p>
        <Card className="border-[#d4af37]/30 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cancel-ref">{t.cancelBooking.bookingReference} *</Label>
              <Input
                id="cancel-ref"
                type="text"
                placeholder="EL12345678"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                className="h-12 border-[#d4af37]/30 focus:border-[#d4af37]"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-email">{t.cancelBooking.email} *</Label>
              <Input
                id="cancel-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-[#d4af37]/30 focus:border-[#d4af37]"
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white disabled:opacity-50"
            >
              {isSubmitting ? t.common.loading : t.cancelBooking.submit}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
