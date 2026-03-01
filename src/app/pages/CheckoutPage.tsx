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
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { getVehicleById } from '../lib/fleet';
import { formatCHF, ADD_ONS, calculatePrice } from '../lib/pricing';
import { generateInvoiceLineItems } from '../lib/policies';

const getApiBase = () => (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';

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
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { bookingData, updateBookingData } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const onInvalid = (errors: Record<string, unknown>) => {
    const first = Object.keys(errors)[0];
    if (first) {
      const el = document.getElementById(first);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast.error(t.checkout.fillRequiredError);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!data.termsAccepted || !data.cancellationAccepted) {
      toast.error(t.checkout.acceptTermsError);
      return;
    }

    setIsSubmitting(true);
    try {
      const reference = `EL${Date.now().toString().slice(-8)}`;
      const bookingId = `booking-${Date.now()}`;
      const customerEmail = data.email || bookingData.customerDetails?.email;
      const vehicle = getVehicleById(bookingData.vehicleId!);
      if (!vehicle) {
        toast.error('Vehicle not found. Please go back and select a vehicle.');
        setIsSubmitting(false);
        return;
      }
      // Recompute transfer price from from/to/vehicle (fixed route or per-km) so Stripe always gets the correct amount
      let basePrice: number;
      try {
        const calc = calculatePrice({
          from: bookingData.from ?? '',
          to: bookingData.to ?? '',
          vehicle,
          distance: bookingData.distance,
          selectedAddOns: [],
        });
        basePrice = calc.subtotal;
      } catch {
        basePrice = bookingData.totalPrice ?? 0;
      }
      const addOnsTotal = ADD_ONS.filter((a) => (bookingData.selectedAddOns ?? []).includes(a.id)).reduce((s, a) => s + a.price, 0);
      const totalPrice = basePrice + addOnsTotal;
      const vehicleLabel = vehicle ? `${vehicle.name} (${vehicle.className})` : bookingData.vehicleId!;

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const apiBase = getApiBase().replace(/\/$/, '');
      const successUrl = `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout`;

      const payload = {
        id: bookingId,
        bookingReference: reference,
        from: bookingData.from,
        to: bookingData.to,
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        vehicleId: bookingData.vehicleId!,
        vehicleLabel,
        addOns: bookingData.selectedAddOns ?? [],
        totalPrice,
        customerEmail,
        customerPhone: data.phone || bookingData.customerDetails?.phone,
        customerName: [data.firstName, data.lastName].filter(Boolean).join(' ') || '',
        customerFirstName: data.firstName?.trim() || '',
        customerLastName: data.lastName?.trim() || '',
        flightNumber: bookingData.flightNumber ?? '',
        paymentMethod: 'Stripe',
        successUrl,
        cancelUrl,
      };

      const res = await fetch(`${apiBase}/api/create-stripe-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json.error || 'Could not start payment. Please try again.');
        return;
      }
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      toast.error('Payment link not available. Please try again.');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Something went wrong. Please try again or contact us.');
    } finally {
      setIsSubmitting(false);
    }
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

  const getAddOnName = (id: string) => (id === 'vip-meet-inside' ? t.checkout.addOnVipName : ADD_ONS.find((a) => a.id === id)?.name ?? id);

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
          ...ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).map((a) => ({ name: getAddOnName(a.id), price: a.price })),
        ],
      })
    : [
        { description: t.checkout.invoiceTransfer, amount: baseTotal, type: 'base' as const },
        ...ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).map((a) => ({ description: getAddOnName(a.id), amount: a.price, type: 'addon' as const })),
        { description: t.checkout.invoiceTotal, amount: displayTotal, type: 'total' as const },
      ];

  const BookingSummaryCard = () => (
    <Card className="border-[#d4af37]/30 bg-gradient-to-br from-white to-[#fafafa] shadow-lg sticky top-24">
      <div className="h-1 bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#b8941f]" />
      <div className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="text-xl font-semibold text-[#0a0a0a]">{t.checkout.bookingSummary}</h3>
                </div>

        <div className="space-y-4">
          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Car className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t.checkout.vehicleLabel}</p>
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
                <p className="text-xs text-muted-foreground">{t.checkout.toLabel}</p>
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
                {bookingData.passengers} {bookingData.passengers === 1 ? t.common.passenger : t.common.passengers}
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
                    {item.type === 'total' ? t.checkout.invoiceTotal : item.description}
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
            <img src="/images/logoelegantlimo.png" alt="Elegant Limo" className="w-10 h-10 rounded-lg object-cover" />
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
                {t.checkout.title}
              </h2>
              <p className="text-muted-foreground">{t.checkout.justDetails}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
              {/* Customer Details */}
              <Card className="border-[#d4af37]/30">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-xl font-semibold text-[#0a0a0a]">{t.checkout.customerDetails}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t.checkout.firstName} <span className="text-destructive">*</span></Label>
                      <Input
                        id="firstName"
                        placeholder={t.checkout.placeholderFirstName}
                        autoComplete="given-name"
                        {...register('firstName', {
                          validate: (v) => (v != null && String(v).trim() !== '') || t.checkout.firstNameRequired,
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
                      <Label htmlFor="lastName">{t.checkout.lastName} <span className="text-destructive">*</span></Label>
                      <Input
                        id="lastName"
                        placeholder={t.checkout.placeholderLastName}
                        autoComplete="family-name"
                        {...register('lastName', {
                          validate: (v) => (v != null && String(v).trim() !== '') || t.checkout.lastNameRequired,
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
                      {t.checkout.email} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.checkout.placeholderEmail}
                      autoComplete="email"
                      {...register('email', {
                        validate: (v) => {
                          const s = v != null ? String(v).trim() : '';
                          if (s === '') return t.checkout.emailRequired;
                          if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(s)) return t.checkout.emailInvalid;
                          return true;
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
                      {t.checkout.phone} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t.checkout.placeholderPhone}
                      autoComplete="tel"
                      {...register('phone', {
                        validate: (v) => (v != null && String(v).trim() !== '') || t.checkout.phoneRequired,
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
                    <Label htmlFor="specialRequests">{t.checkout.specialRequests} {t.checkout.specialRequestsOptional}</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder={t.checkout.placeholderSpecialRequests}
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
                  <h3 className="text-xl font-semibold text-[#0a0a0a]">{t.checkout.addOns}</h3>
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
                          <span className="font-medium text-[#0a0a0a]">
                            {addon.id === 'vip-meet-inside' ? t.checkout.addOnVipName : addon.name}
                          </span>
                          <span className="ml-2 text-[#d4af37] font-semibold">{formatCHF(addon.price)}</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addon.id === 'vip-meet-inside' ? t.checkout.addOnVipDesc : addon.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>

              {/* Payment – Stripe only */}
              <Card className="border-[#d4af37]/30">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-xl font-semibold text-[#0a0a0a]">{t.checkout.payment}</h3>
                  </div>

                  <Alert className="border-[#d4af37]/30 bg-[#f4e4b7]/10">
                    <AlertCircle className="h-4 w-4 text-[#d4af37]" />
                    <AlertDescription className="text-[#0a0a0a]">
                      <div className="space-y-2">
                        <p className="font-semibold">{t.checkout.payStripe}</p>
                        <p className="text-sm">{t.checkout.payStripeDesc}</p>
                        <ul className="text-sm space-y-1 mt-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                            <span>{t.checkout.secureStripe}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                            <span>{t.checkout.emailReceipt}</span>
                          </li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>

              {/* Cancellation Policy */}
              <Card className="border-[#d4af37]/30 bg-[#fafafa]">
                <div className="p-6 space-y-4">
                  <h4 className="font-semibold text-[#0a0a0a]">{t.cancellationPolicy.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.cancellationPolicy.summary}</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    {[
                      t.cancellationPolicy.detail1,
                      t.cancellationPolicy.detail2,
                      t.cancellationPolicy.detail3,
                      t.cancellationPolicy.detail4,
                      t.cancellationPolicy.detail5,
                    ].map((detail, index) => (
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
                      {t.checkout.cancellationLabel}
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
                      {t.checkout.termsAndPrivacy}
                    </label>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t.checkout.redirecting}
                  </>
                ) : (
                  <>
                    {t.checkout.payWithStripe}
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
    </div>
  );
}