import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, CalendarPlus, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { addBooking } from '../lib/bookings-store';
import { sendBookingEmails } from '../lib/notifications';

const WHATSAPP_NUMBER = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER || '38348263151';
const getApiBase = () => (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';

interface SessionBooking {
  id: string;
  bookingReference: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  vehicleId: string;
  vehicleLabel?: string;
  totalPrice: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  customerFirstName?: string;
  customerLastName?: string;
  addOns: string[];
  paymentMethod: string;
}

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [booking, setBooking] = useState<SessionBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing session ID');
      return;
    }

    const apiBase = getApiBase().replace(/\/$/, '');
    const url = `${apiBase}/api/stripe-session-success?session_id=${encodeURIComponent(sessionId)}`;

    fetch(url)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.ok || !data.booking) {
          setStatus('error');
          setErrorMessage(data.error || 'Invalid session');
          return;
        }

        const b = data.booking as SessionBooking;
        setBooking(b);

        const adminBooking = {
          id: b.id,
          bookingReference: b.bookingReference,
          status: 'confirmed' as const,
          from: b.from,
          to: b.to,
          date: b.date,
          time: b.time,
          passengers: b.passengers,
          vehicleId: b.vehicleId,
          totalPrice: b.totalPrice,
          customerDetails: {
            firstName: b.customerFirstName || b.customerName?.split(/\s+/)[0] || '',
            lastName: b.customerLastName || b.customerName?.split(/\s+/).slice(1).join(' ') || '',
            email: b.customerEmail,
            phone: b.customerPhone,
            specialRequests: '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addBooking(adminBooking);

        const payload = {
          ...b,
          customerName: b.customerName || [adminBooking.customerDetails.firstName, adminBooking.customerDetails.lastName].filter(Boolean).join(' '),
        };
        await sendBookingEmails(payload);

        const receiptUrl = `${apiBase}/api/send-receipt-email`;
        try {
          await fetch(receiptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: b.customerEmail,
              customerName: b.customerName,
              bookingReference: b.bookingReference,
              totalPrice: b.totalPrice,
            }),
          });
        } catch {
          // receipt is best-effort
        }

        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Something went wrong');
      });
  }, [searchParams]);

  const handleClose = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <p className="text-destructive font-medium mb-2">We couldn't confirm your booking.</p>
          <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
          <Button onClick={() => navigate('/')} className="bg-[#d4af37] hover:bg-[#b8941f] text-white">
            Return to home
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const calendarUrl = (() => {
    const d = booking.date;
    const t = booking.time || '09:00';
    const [h, m] = t.split(':').map((x) => parseInt(x, 10) || 0);
    const start = new Date(d + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00');
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const text = encodeURIComponent(`Elegant Limo: ${booking.from} → ${booking.to}`);
    const details = encodeURIComponent(`Booking ${booking.bookingReference}. ${booking.passengers} passenger(s).`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
  })();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I have a booking with Elegant Limo. My booking ID: ${booking.bookingReference}.`)}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-[#d4af37]/30" onPointerDownOutside={handleClose}>
          <div className="h-1 bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#b8941f] absolute top-0 left-0 right-0" />
          <DialogHeader className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl text-center text-[#0a0a0a">
              Payment complete – booking confirmed
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <p className="text-muted-foreground">
                A confirmation and receipt have been sent to your email.
              </p>
              {booking.date && (
                <p className="text-sm font-medium text-[#0a0a0a]">
                  Pickup: {format(new Date(booking.date), 'PPP')} at {booking.time}
                </p>
              )}
              <div className="bg-[#fafafa] p-4 rounded-lg border border-[#d4af37]/20">
                <p className="text-xs text-muted-foreground mb-1">Booking ID</p>
                <p className="text-xl font-bold text-[#d4af37] tracking-wider">{booking.bookingReference}</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-[#d4af37]/50 bg-[#f4e4b7]/20 text-[#0a0a0a] font-medium hover:bg-[#f4e4b7]/40 transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Add to Google Calendar
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-[#25D366] bg-[#25D366]/10 text-[#0a0a0a] font-medium hover:bg-[#25D366]/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp
                </a>
              </div>
              <div className="bg-[#f4e4b7]/20 border border-[#d4af37]/30 rounded-lg p-4">
                <p className="text-sm text-[#0a0a0a] font-medium mb-2">Paid online</p>
                <p className="text-xs text-muted-foreground">
                  CHF {(booking.totalPrice ?? 0).toFixed(2)} paid by card. Receipt sent to your email.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={handleClose}
            className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white"
          >
            Return to home
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
