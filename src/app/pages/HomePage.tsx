import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CalendarIcon, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { useTranslations } from '../lib/translations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BookingMap } from '../components/BookingMap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { setOpsAuthenticated } from '../lib/ops-auth';
import { toast } from 'sonner';

const OPS_PIN = '21220';
const RAPID_CLICK_WINDOW_MS = 2000;
const RAPID_CLICK_COUNT = 5;

interface BookingFormData {
  from: string;
  to: string;
  date: Date;
  time: string;
  passengers: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const t = useTranslations('en');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [opsPinOpen, setOpsPinOpen] = useState(false);
  const [opsPinValue, setOpsPinValue] = useState('');
  const [opsPinError, setOpsPinError] = useState('');
  const rapidClickCount = useRef(0);
  const rapidClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleElegantLimoClick = useCallback(() => {
    rapidClickCount.current += 1;
    if (rapidClickTimer.current) clearTimeout(rapidClickTimer.current);
    if (rapidClickCount.current >= RAPID_CLICK_COUNT) {
      rapidClickCount.current = 0;
      setOpsPinOpen(true);
      setOpsPinValue('');
      setOpsPinError('');
    } else {
      rapidClickTimer.current = setTimeout(() => {
        rapidClickCount.current = 0;
        rapidClickTimer.current = null;
      }, RAPID_CLICK_WINDOW_MS);
    }
  }, []);

  const handleOpsPinSubmit = useCallback(() => {
    if (opsPinValue.trim() === OPS_PIN) {
      setOpsAuthenticated();
      setOpsPinOpen(false);
      setOpsPinValue('');
      setOpsPinError('');
      navigate('/ops');
    } else {
      setOpsPinError('Wrong PIN');
    }
  }, [opsPinValue, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<BookingFormData>({
    defaultValues: {
      from: bookingData.from,
      to: bookingData.to,
      passengers: 1,
      time: '09:00',
    },
  });

  const watchFrom = watch('from');
  const watchTo = watch('to');
  const watchPassengers = watch('passengers');

  const onSubmit = async (data: BookingFormData) => {
    const fromVal = (data.from ?? watchFrom ?? '').toString().trim();
    const toVal = (data.to ?? watchTo ?? '').toString().trim();
    if (!fromVal) {
      setError('from', { type: 'required', message: t.home.validation.requiredField });
      return;
    }
    if (!toVal) {
      setError('to', { type: 'required', message: t.home.validation.requiredField });
      return;
    }
    if (!selectedDate) {
      toast.error(t.home.validation.invalidDate);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error(t.home.validation.pastDate);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateBookingData({
      from: fromVal,
      to: toVal,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: data.time,
      passengers: data.passengers,
    });

    setIsLoading(false);
    navigate('/summary');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#d4af37]/20 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0a0a0a]">
                {t.home.hero.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Background map + hero (image fallback when no map) */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <BookingMap
            background
            from={bookingData.fromLatLon ?? undefined}
            to={bookingData.toLatLon ?? undefined}
            className="w-full h-full min-h-[280px]"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              {t.home.hero.title}
            </h2>
            <p className="text-xl md:text-2xl text-[#f4e4b7] font-light tracking-wide">
              {t.home.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="container mx-auto px-4 -mt-20 md:-mt-24 relative z-30 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#d4af37]/30 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#b8941f]" />
            <div className="p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-[#0a0a0a]">
                Book Your Premium Journey
              </h3>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Addresses in Switzerland only. Select a suggestion for best results.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* From: controlled + Switzerland autocomplete */}
                <div className="space-y-2">
                  <Label htmlFor="from" className="flex items-center gap-2 text-[#0a0a0a]">
                    <MapPin className="w-4 h-4 text-[#d4af37]" />
                    {t.home.form.from}
                  </Label>
                  <AddressAutocomplete
                    id="from"
                    value={watchFrom ?? ''}
                    onChange={(v) => setValue('from', v, { shouldValidate: true })}
                    onSelect={(address, lat, lng) => {
                      setValue('from', address, { shouldValidate: true });
                      updateBookingData({ from: address, fromLatLon: { lat, lng } });
                    }}
                    placeholder={t.home.form.pickupPlaceholder}
                    className="h-14 text-base border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37] bg-[#fafafa]"
                    aria-invalid={errors.from ? 'true' : 'false'}
                  />
                  {errors.from && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.from.message}
                    </p>
                  )}
                </div>

                {/* To: controlled + Switzerland autocomplete */}
                <div className="space-y-2">
                  <Label htmlFor="to" className="flex items-center gap-2 text-[#0a0a0a]">
                    <MapPin className="w-4 h-4 text-[#d4af37]" />
                    {t.home.form.to}
                  </Label>
                  <AddressAutocomplete
                    id="to"
                    value={watchTo ?? ''}
                    onChange={(v) => setValue('to', v, { shouldValidate: true })}
                    onSelect={(address, lat, lng) => {
                      setValue('to', address, { shouldValidate: true });
                      updateBookingData({ to: address, toLatLon: { lat, lng } });
                    }}
                    placeholder={t.home.form.dropoffPlaceholder}
                    className="h-14 text-base border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37] bg-[#fafafa]"
                    aria-invalid={errors.to ? 'true' : 'false'}
                  />
                  {errors.to && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.to.message}
                    </p>
                  )}
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[#0a0a0a]">
                      <CalendarIcon className="w-4 h-4 text-[#d4af37]" />
                      {t.home.form.date}
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-14 justify-start text-left font-normal border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#fafafa] bg-[#fafafa]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#d4af37]" />
                          {selectedDate ? (
                            format(selectedDate, 'PPP')
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) setCalendarOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2 text-[#0a0a0a]">
                      <Clock className="w-4 h-4 text-[#d4af37]" />
                      {t.home.form.time}
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      {...register('time', {
                        required: t.home.validation.requiredField,
                      })}
                      defaultValue="09:00"
                      className="h-14 text-base border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37] bg-[#fafafa]"
                      aria-invalid={errors.time ? 'true' : 'false'}
                    />
                    {errors.time && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <Label htmlFor="passengers" className="flex items-center gap-2 text-[#0a0a0a]">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    {t.home.form.passengers}
                  </Label>
                  <Select
                    value={watchPassengers?.toString()}
                    onValueChange={(value) => setValue('passengers', parseInt(value))}
                  >
                    <SelectTrigger className="h-14 text-base border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37] bg-[#fafafa]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Passenger' : 'Passengers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 text-lg bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? t.common.loading : 'Book'}
                </Button>
              </form>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-[#d4af37]">24/7</div>
              <p className="text-sm text-muted-foreground">Available Service</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-[#d4af37]">15+</div>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-[#d4af37]">10k+</div>
              <p className="text-sm text-muted-foreground">Happy Clients</p>
            </div>
          </div>

          <footer className="mt-16 pt-8 border-t border-[#d4af37]/10 text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={handleElegantLimoClick}
              className="text-[#0a0a0a] font-medium hover:text-[#d4af37] transition-colors cursor-pointer bg-transparent border-none"
              aria-label="Elegant Limo"
            >
              Elegant Limo
            </button>
          </footer>
        </div>
      </section>

      <Dialog open={opsPinOpen} onOpenChange={setOpsPinOpen}>
        <DialogContent className="border-[#d4af37]/30 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>Enter the PIN to access the ops dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="ops-pin">PIN</Label>
            <Input
              id="ops-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={opsPinValue}
              onChange={(e) => {
                setOpsPinValue(e.target.value);
                setOpsPinError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleOpsPinSubmit()}
              className="border-[#d4af37]/30"
              placeholder="•••••"
            />
            {opsPinError && <p className="text-sm text-destructive">{opsPinError}</p>}
          </div>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#d4af37] text-white h-10 px-4 hover:bg-[#b8941f]"
              onClick={handleOpsPinSubmit}
            >
              Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}