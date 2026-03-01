import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Car } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../lib/translations';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BookingMap } from '../components/BookingMap';
import { getAvailableVehicles, getVehicleById } from '../lib/fleet';
import { calculatePrice, formatCHF } from '../lib/pricing';
import { fetchOsrmRoute } from '../lib/route-utils';
import { geocodeAddress } from '../lib/nominatim';
import { toast } from 'sonner';

const VEHICLE_CARDS = [
  {
    id: 'vehicle-standard-eclass',
    badgeKey: 'badgeMax3Pax' as const,
    popular: false,
    imageUrl: '/images/fleet/mercedeseqs.png',
    title: 'Mercedes E-Class',
    subtitle: 'Business Class',
    featureKeys: ['featureLeatherInterior', 'featureFreeWifi', 'feature2Suitcases'] as const,
  },
  {
    id: 'vehicle-premium-sclass',
    badgeKey: null,
    popular: true,
    imageUrl: '/images/fleet/eclass.png',
    title: 'Mercedes S-Class',
    subtitle: 'First Class',
    featureKeys: ['featureExecutiveComfort', 'featureExtraLegroom', 'feature3Suitcases'] as const,
  },
  {
    id: 'vehicle-van-vclass',
    badgeKey: 'badgeMax7Pax' as const,
    popular: false,
    imageUrl: '/images/fleet/vclass.png',
    title: 'Mercedes V-Class',
    subtitle: 'Business Van',
    featureKeys: ['featureFamiliesGroups', 'featureConferenceSeating', 'feature7Suitcases'] as const,
  },
];

export function BookingSummaryPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { bookingData, updateBookingData } = useBooking();
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [routeGeoJson, setRouteGeoJson] = useState<unknown>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(bookingData.vehicleId);

  const hasTrip = bookingData.from && bookingData.to && bookingData.date && bookingData.time;

  useEffect(() => {
    if (!hasTrip) {
      toast.error(t.summary.completeFormFirst);
      navigate('/');
      return;
    }
  }, [hasTrip, navigate, t.summary.completeFormFirst]);

  const fromLatLon = bookingData.fromLatLon;
  const toLatLon = bookingData.toLatLon;
  const distance = bookingData.distance ?? 0;
  const duration = bookingData.estimatedDuration ?? 0;

  // Geocode when we have from/to text but no coords
  useEffect(() => {
    const fromText = (bookingData.from || '').trim();
    const toText = (bookingData.to || '').trim();
    if (fromText.length < 3 || toText.length < 3) return;
    if (bookingData.fromLatLon && bookingData.toLatLon) return;
    let cancelled = false;
    const run = async () => {
      if (!bookingData.fromLatLon) {
        const coords = await geocodeAddress(fromText);
        if (coords && !cancelled) updateBookingData({ fromLatLon: coords });
      }
      if (!bookingData.toLatLon) {
        const coords = await geocodeAddress(toText);
        if (coords && !cancelled) updateBookingData({ toLatLon: coords });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [bookingData.from, bookingData.to, bookingData.fromLatLon, bookingData.toLatLon, updateBookingData]);

  useEffect(() => {
    if (!fromLatLon || !toLatLon) return;
    let cancelled = false;
    fetchOsrmRoute(fromLatLon, toLatLon).then((info) => {
      if (cancelled) return;
      if (info.routePoints?.length) setRoutePoints(info.routePoints);
      if (info.geoJson) setRouteGeoJson(info.geoJson);
      if (!bookingData.distance && info.distanceKm) {
        updateBookingData({
          distance: info.distanceKm,
          estimatedDuration: info.durationMinutes,
        });
      }
    });
    return () => { cancelled = true; };
  }, [fromLatLon?.lat, fromLatLon?.lng, toLatLon?.lat, toLatLon?.lng]);

  const recalculateRoute = async () => {
    if (!bookingData.from?.trim() || !bookingData.to?.trim()) {
      toast.error(t.summary.enterBothAddresses);
      return;
    }
    if (!bookingData.fromLatLon || !bookingData.toLatLon) {
      toast.error(t.summary.selectAddressesToRecalc);
      return;
    }
    setRecalculating(true);
    try {
      const info = await fetchOsrmRoute(bookingData.fromLatLon, bookingData.toLatLon);
      setRoutePoints(info.routePoints ?? []);
      setRouteGeoJson(info.geoJson ?? null);
      updateBookingData({
        distance: info.distanceKm,
        estimatedDuration: info.durationMinutes,
      });
      toast.success(t.summary.routeUpdated);
    } catch {
      toast.error(t.summary.recalcError);
    } finally {
      setRecalculating(false);
    }
  };

  const suitableVehicles = getAvailableVehicles(bookingData.passengers ?? 1);
  const vehiclePrices: Record<string, number> = {};
  suitableVehicles.forEach((v) => {
    try {
      const calc = calculatePrice({
        from: bookingData.from,
        to: bookingData.to,
        vehicle: v,
        distance: bookingData.distance,
      });
      vehiclePrices[v.id] = calc.subtotal;
    } catch {
      vehiclePrices[v.id] = 0;
    }
  });

  const handleContinue = () => {
    if (!selectedVehicleId) {
      toast.error(t.summary.chooseVehicleToast);
      return;
    }
    const price = vehiclePrices[selectedVehicleId] ?? 0;
    updateBookingData({
      vehicleId: selectedVehicleId,
      totalPrice: price,
      priceCalculation: undefined,
    });
    navigate('/checkout');
  };

  if (!hasTrip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-[#d4af37]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif text-[#0f172a]">{t.summary.pageTitle}</h1>
          <p className="text-sm text-slate-500">{t.summary.pageSubtitle}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 1. Trip details (editable From/To) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-serif font-bold mb-4 border-b pb-2">1. {t.summary.tripDetails}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">{t.summary.pickup}</Label>
              <AddressAutocomplete
                id="summary-from"
                value={bookingData.from}
                onChange={(v) => updateBookingData({ from: v })}
                onSelect={(address, lat, lng) =>
                  updateBookingData({ from: address, fromLatLon: { lat, lng } })
                }
                placeholder="From"
                className="mt-1 h-12 border-[#d4af37]/30"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">{t.summary.dropoff}</Label>
              <AddressAutocomplete
                id="summary-to"
                value={bookingData.to}
                onChange={(v) => updateBookingData({ to: v })}
                onSelect={(address, lat, lng) =>
                  updateBookingData({ to: address, toLatLon: { lat, lng } })
                }
                placeholder="To"
                className="mt-1 h-12 border-[#d4af37]/30"
              />
            </div>
            <div className="flex flex-col justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={recalculateRoute}
                disabled={recalculating}
                className="border-[#1e293b] text-[#1e293b] hover:bg-slate-100"
              >
                {recalculating ? t.summary.calculating : t.summary.recalculate}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span><strong>{t.summary.date}:</strong> {bookingData.date && format(new Date(bookingData.date), 'PPP')}</span>
            <span><strong>{t.summary.time}:</strong> {bookingData.time}</span>
            <span><strong>{t.summary.passengers}:</strong> {bookingData.passengers}</span>
          </div>
        </section>

        {/* Map + Route overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <BookingMap
              from={bookingData.fromLatLon ?? undefined}
              to={bookingData.toLatLon ?? undefined}
              routePoints={routePoints.length >= 2 ? routePoints : undefined}
              geoJson={routeGeoJson ?? undefined}
              className="w-full h-[320px] rounded-lg"
            />
          </div>
          <div className="bg-[#0f172a] text-white p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-[#D4AF37] font-serif text-xl mb-4">{t.summary.routeOverview}</h3>
            <div className="space-y-4 border-b border-gray-700 pb-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm uppercase">{t.summary.distance}</span>
                <span className="text-xl font-bold">{distance ? `${distance} km` : '––– km'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm uppercase">{t.summary.estDuration}</span>
                <span className="text-xl font-bold">
                  {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '––– min'}
                </span>
              </div>
            </div>
            {selectedVehicleId && vehiclePrices[selectedVehicleId] != null && (
              <div className="pt-4">
                <span className="text-gray-400 text-sm uppercase block mb-1">{t.summary.estimatedPrice}</span>
                <span className="text-4xl font-serif text-[#D4AF37]">
                  CHF {Math.round(vehiclePrices[selectedVehicleId])}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 2. Choose vehicle */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-bold mb-4">2. {t.summary.chooseVehicle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VEHICLE_CARDS.map((card) => {
              const vehicle = getVehicleById(card.id);
              const canUse = vehicle && (bookingData.passengers ?? 1) >= vehicle.capacity.min && (bookingData.passengers ?? 1) <= vehicle.capacity.max;
              const price = vehiclePrices[card.id];
              const selected = selectedVehicleId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => canUse && setSelectedVehicleId(card.id)}
                  className={`relative rounded-xl border-2 p-4 bg-white shadow-sm transition-all cursor-pointer ${
                    selected ? 'border-[#d4af37] bg-[#fffdf5] shadow-lg' : 'border-transparent hover:border-[#d4af37]/50'
                  } ${!canUse ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {card.popular && (
                    <div className="absolute top-0 right-0 bg-[#C5A028] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      {t.summary.popular}
                    </div>
                  )}
                  {card.badgeKey && !card.popular && (
                    <div className="absolute top-4 right-4 bg-gray-100 text-xs font-bold px-2 py-1 rounded">
                      {t.summary[card.badgeKey]}
                    </div>
                  )}
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-[#0a0a0a]">{card.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{card.subtitle}</p>
                  <ul className="text-xs text-gray-500 space-y-1 mb-4">
                    {card.featureKeys.map((key, i) => (
                      <li key={i}>• {t.summary[key]}</li>
                    ))}
                  </ul>
                  <div className="text-[#B08D22] font-bold">
                    {price != null ? `CHF ${Math.round(price)}` : 'CHF –––'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Flight number (optional) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-serif font-bold mb-4 border-b pb-2">
            {t.summary.flightDetails}
          </h2>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="flightNumber" className="text-sm text-gray-700">
              {t.summary.flightNumberLabel}
            </Label>
            <Input
              id="flightNumber"
              placeholder={t.summary.flightNumberPlaceholder}
              value={bookingData.flightNumber ?? ''}
              onChange={(e) => updateBookingData({ flightNumber: e.target.value })}
              className="h-11 border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37] bg-[#fafafa]"
            />
            <p className="text-xs text-slate-500">
              {t.summary.flightNumberHint}
            </p>
          </div>
        </section>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/')} className="border-[#d4af37]/30">
            {t.summary.back}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedVehicleId}
            className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white px-8 disabled:opacity-50"
          >
            {t.summary.continueToCheckout}
          </Button>
        </div>
      </div>
    </div>
  );
}
