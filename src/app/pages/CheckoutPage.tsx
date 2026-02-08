import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  CheckCircle2,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Car,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { CalendarPlus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getVehicleById } from '../lib/fleet';
import { addBooking } from '../lib/bookings-store';

const WHATSAPP_NUMBER = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER || '38348263151';
import { formatCHF, ADD_ONS } from '../lib/pricing';
import { PAYMENT_POLICY, CANCELLATION_POLICY, generateInvoiceLineItems } from '../lib/policies';
import {
  sendBookingConfirmationEmail,
  sendNewBookingAlertEmail,
  sendWhatsAppBookingAlert,
  submitBookingToFormSubmit,
} from '../lib/notifications';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  termsAccepted: boolean;
  cancellationAccepted: boolean;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData, resetBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: bookingData.customerDetails?.firstName ?? '',
      lastName: bookingData.customerDetails?.lastName ?? '',
      email: bookingData.customerDetails?.email ?? '',
      phone: bookingData.customerDetails?.phone ?? '',
      specialRequests: bookingData.customerDetails?.specialRequests ?? '',
      termsAccepted: false,
      cancellationAccepted: false,
    },
    mode: 'onSubmit',
  });

  const termsAccepted = watch('termsAccepted');
  const cancellationAccepted = watch('cancellationAccepted');

  const onSubmit = async (data: CheckoutFormData) => {
    if (!data.termsAccepted || !data.cancellationAccepted) {
      toast.error('Please accept the terms and cancellation policy');
      return;
    }

    setIsSubmitting(true);

    const reference = `EL${Date.now().toString().slice(-8)}`;
    const bookingId = `booking-${Date.now()}`;

    const customerEmail = data.email || bookingData.customerDetails?.email;
    const totalPrice =
      (bookingData.totalPrice ?? 0) +
      ADD_ONS.filter((a) => (bookingData.selectedAddOns ?? []).includes(a.id)).reduce((s, a) => s + a.price, 0);
    const bookingPayload = {
      id: bookingId,
      bookingReference: reference,
      from: bookingData.from,
      to: bookingData.to,
      date: bookingData.date,
      time: bookingData.time,
      passengers: bookingData.passengers,
      vehicleId: bookingData.vehicleId!,
      addOns: bookingData.selectedAddOns ?? [],
      totalPrice,
      customerEmail,
      customerPhone: data.phone || bookingData.customerDetails?.phone,
      customerName: [data.firstName, data.lastName].filter(Boolean).join(' ') || [bookingData.customerDetails?.firstName, bookingData.customerDetails?.lastName].filter(Boolean).join(' '),
      paymentMethod: bookingData.paymentMethod ?? 'Credit card in vehicle',
    };

    // Persist booking to localStorage so ops dashboard/calendar can see it
    addBooking({
      id: bookingId,
      bookingReference: reference,
      status: 'confirmed',
      from: bookingData.from,
      to: bookingData.to,
      date: bookingData.date,
      time: bookingData.time,
      passengers: bookingData.passengers,
      vehicleId: bookingData.vehicleId!,
      totalPrice,
      customerDetails: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialRequests: data.specialRequests,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Send booking notification via FormSubmit (AJAX, no redirect)
    try {
      await submitBookingToFormSubmit(bookingPayload);
    } catch (e) {
      console.warn('FormSubmit notification failed:', e);
    }

    // Also try backend APIs (will silently fail if no backend is running)
    try {
      await sendBookingConfirmationEmail(bookingId, customerEmail ?? '');
      await sendNewBookingAlertEmail(bookingPayload);
      await sendWhatsAppBookingAlert(bookingPayload);
    } catch (e) {
      console.warn('Backend notification send failed (backend may be unavailable):', e);
    }

    setBookingReference(reference);
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetBooking();
    navigate('/');
  };

  // Redirect if no booking data
  if (!bookingData.from || !bookingData.to || !bookingData.vehicleId) {
    navigate('/');
    return null;
  }

  const vehicle = getVehicleById(bookingData.vehicleId);
  if (!vehicle) {
    navigate('/');
    return null;
  }

  const baseTotal = bookingData.totalPrice ?? 0;
  const selectedAddOns = bookingData.selectedAddOns ?? [];
  const addOnsTotal = ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const displayTotal = baseTotal + addOnsTotal;

  // Generate invoice line items (or build from summary total + add-ons)
  const invoiceItems = bookingData.priceCalculation
    ? generateInvoiceLineItems({
        basePrice: bookingData.priceCalculation.basePrice,
        basePriceDescription:
          bookingData.priceCalculation.pricingMethod === 'fixed-route'
            ? bookingData.priceCalculation.fixedRoute!.description
            : `${bookingData.distance?.toFixed(1)} km × ${formatCHF(bookingData.priceCalculation.perKmRate!)}`,
        addOns: [
          ...(bookingData.priceCalculation.addOns ?? []),
          ...ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).map((a) => ({ name: a.name, price: a.price })),
        ],
      })
    : [
        { description: 'Transfer', amount: baseTotal, type: 'base' as const },
        ...ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).map((a) => ({ description: a.name, amount: a.price, type: 'addon' as const })),
        { description: 'Total', amount: displayTotal, type: 'total' as const },
      ];

  const BookingSummaryCard = () => (
    <Card className="border-[#d4af37]/30 bg-gradient-to-br from-white to-[#fafafa] shadow-lg sticky top-24">
      <div className="h-1 bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#b8941f]" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
          <h3 className="text-xl font-semibold text-[#0a0a0a]">Booking Summary</h3>
        </div>

        <div className="space-y-4">
          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Car className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Vehicle</p>
              <p className="text-sm font-medium text-[#0a0a0a]">
                {vehicle.name} ({vehicle.className})
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-sm font-medium text-[#0a0a0a]">{bookingData.from}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="text-sm font-medium text-[#0a0a0a]">{bookingData.to}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-[#d4af37]/20" />

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[#0a0a0a]">
                {bookingData.date && format(new Date(bookingData.date), 'PPP')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[#0a0a0a]">{bookingData.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[#0a0a0a]">
                {bookingData.passengers} {bookingData.passengers === 1 ? 'Passenger' : 'Passengers'}
              </span>
            </div>
          </div>

          <Separator className="bg-[#d4af37]/20" />

          {/* Invoice */}
          <div className="space-y-2">
            {invoiceItems.map((item, index) => (
              <div key={index}>
                {item.type === 'total' && <Separator className="bg-[#d4af37]/20 my-2" />}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${item.type === 'total' ? 'font-semibold text-[#0a0a0a]' : 'text-muted-foreground'}`}
                  >
                    {item.description}
                  </span>
                  <span
                    className={`${item.type === 'total' ? 'text-xl font-bold text-[#d4af37]' : 'text-sm font-medium text-[#0a0a0a]'}`}
                  >
                    {formatCHF(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight text-[#0a0a0a] cursor-pointer"
              onClick={() => navigate('/')}
            >
              Elegant Limo
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-2">
                Complete Your Reservation
              </h2>
              <p className="text-muted-foreground">Just a few more details to confirm your booking</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Customer Details */}
              <Card className="border-[#d4af37]/30">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-xl font-semibold text-[#0a0a0a]">Customer Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        autoComplete="given-name"
                        {...register('firstName', {
                          required: 'First name is required',
                        })}
                        className="h-12 border-[#d4af37]/30 focus:border-[#d4af37] bg-[#fafafa]"
                        aria-invalid={errors.firstName ? 'true' : 'false'}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        autoComplete="family-name"
                        {...register('lastName', {
                          required: 'Last name is required',
                        })}
                        className="h-12 border-[#d4af37]/30 focus:border-[#d4af37] bg-[#fafafa]"
                        aria-invalid={errors.lastName ? 'true' : 'false'}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#d4af37]" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      autoComplete="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="h-12 border-[#d4af37]/30 focus:border-[#d4af37] bg-[#fafafa]"
                      aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#d4af37]" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+41 79 123 4567"
                      autoComplete="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                      })}
                      className="h-12 border-[#d4af37]/30 focus:border-[#d4af37] bg-[#fafafa]"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requirements or preferences..."
                      {...register('specialRequests')}
                      className="min-h-24 border-[#d4af37]/30 focus:border-[#d4af37] bg-[#fafafa]"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* Add-ons (e.g. VIP) */}
              <Card className="border-[#d4af37]/30">
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-[#0a0a0a]">Add-ons</h3>
                  {ADD_ONS.map((addon) => {
                    const checked = selectedAddOns.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className="flex items-start gap-3 cursor-pointer rounded-lg border border-[#d4af37]/30 p-4 hover:bg-[#f4e4b7]/10"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const next = c ? [...selectedAddOns, addon.id] : selectedAddOns.filter((id) => id !== addon.id);
                            updateBookingData({ selectedAddOns: next });
                          }}
                          className="border-[#d4af37] data-[state=checked]:bg-[#d4af37] mt-0.5"
                        />
                        <div>
                          <span className="font-medium text-[#0a0a0a]">{addon.name}</span>
                          <span className="ml-2 text-[#d4af37] font-semibold">{formatCHF(addon.price)}</span>
                          <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="border-[#d4af37]/30">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-xl font-semibold text-[#0a0a0a]">Payment Method</h3>
                  </div>

                  <Alert className="border-[#d4af37]/30 bg-[#f4e4b7]/10">
                    <AlertCircle className="h-4 w-4 text-[#d4af37]" />
                    <AlertDescription className="text-[#0a0a0a]">
                      <div className="space-y-2">
                        <p className="font-semibold">{PAYMENT_POLICY.method}</p>
                        <p className="text-sm">{PAYMENT_POLICY.description}</p>
                        <ul className="text-sm space-y-1 mt-2">
                          {PAYMENT_POLICY.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>

              {/* Cancellation Policy */}
              <Card className="border-[#d4af37]/30 bg-[#fafafa]">
                <div className="p-6 space-y-4">
                  <h4 className="font-semibold text-[#0a0a0a]">{CANCELLATION_POLICY.title}</h4>
                  <p className="text-sm text-muted-foreground">{CANCELLATION_POLICY.summary}</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {CANCELLATION_POLICY.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full mt-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-start gap-3 pt-4">
                    <Checkbox
                      id="cancellation"
                      checked={cancellationAccepted}
                      onCheckedChange={(checked) =>
                        setValue('cancellationAccepted', checked as boolean)
                      }
                      className="border-[#d4af37] data-[state=checked]:bg-[#d4af37] mt-1"
                    />
                    <label
                      htmlFor="cancellation"
                      className="text-sm text-[#0a0a0a] cursor-pointer leading-relaxed"
                    >
                      I have read and accept the cancellation policy
                    </label>
                  </div>
                </div>
              </Card>

              {/* Terms and Conditions */}
              <Card className="border-[#d4af37]/30 bg-[#fafafa]">
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setValue('termsAccepted', checked as boolean)
                      }
                      className="border-[#d4af37] data-[state=checked]:bg-[#d4af37] mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-[#0a0a0a] cursor-pointer leading-relaxed"
                    >
                      I agree to the Terms & Conditions and Privacy Policy
                    </label>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !termsAccepted || !cancellationAccepted}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Desktop Summary - Hidden on mobile */}
          <div className="hidden lg:block">
            <BookingSummaryCard />
          </div>
        </div>

        {/* Mobile Summary - Shows at bottom on mobile */}
        {isMobile && (
          <div className="mt-8 lg:hidden">
            <BookingSummaryCard />
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md border-[#d4af37]/30">
          <div className="h-1 bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#b8941f] absolute top-0 left-0 right-0" />
          <DialogHeader className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl text-center text-[#0a0a0a]">
              Booking confirmed
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <p className="text-muted-foreground">
                A confirmation email has been sent to your inbox with your booking ID.
              </p>
              {bookingData.date && (
                <p className="text-sm font-medium text-[#0a0a0a]">
                  Pickup: {format(new Date(bookingData.date), 'PPP')} at {bookingData.time}
                </p>
              )}
              <div className="bg-[#fafafa] p-4 rounded-lg border border-[#d4af37]/20">
                <p className="text-xs text-muted-foreground mb-1">Booking ID</p>
                <p className="text-xl font-bold text-[#d4af37] tracking-wider">{bookingReference}</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={(() => {
                    const d = bookingData.date;
                    const t = bookingData.time || '09:00';
                    const [h, m] = t.split(':').map((x) => parseInt(x, 10) || 0);
                    const start = new Date(d + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00');
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                    const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
                    const text = encodeURIComponent(`Elegant Limo: ${bookingData.from} → ${bookingData.to}`);
                    const details = encodeURIComponent(`Booking ${bookingReference}. ${bookingData.passengers} passenger(s).`);
                    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-[#d4af37]/50 bg-[#f4e4b7]/20 text-[#0a0a0a] font-medium hover:bg-[#f4e4b7]/40 transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Add to Google Calendar
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I have a booking with Elegant Limo. My booking ID: ${bookingReference}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-[#25D366] bg-[#25D366]/10 text-[#0a0a0a] font-medium hover:bg-[#25D366]/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp (with booking ID)
                </a>
              </div>
              <div className="bg-[#f4e4b7]/20 border border-[#d4af37]/30 rounded-lg p-4">
                <p className="text-sm text-[#0a0a0a] font-medium mb-2">Payment</p>
                <p className="text-xs text-muted-foreground">
                  Payment will be collected by card on the vehicle at the end of your trip.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={handleSuccessClose}
            className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white"
          >
            Return to Home
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}