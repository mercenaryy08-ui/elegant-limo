import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Car, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BookingMap } from '../components/BookingMap';
import { getAvailableVehicles, getVehicleById } from '../lib/fleet';
import { calculatePrice, formatCHF } from '../lib/pricing';
import { fetchOsrmRoute } from '../lib/route-utils';
import { toast } from 'sonner';

const VEHICLE_CARDS = [
  {
    id: 'vehicle-standard-eclass',
    badge: 'Max 3 Pax',
    popular: false,
    imageUrl: 'https://assets.zyrosite.com/0B1b2Hs9k1Tamhoi/4-jnTJVTKo6gT3jOnt.jpg',
    title: 'Mercedes E-Class',
    subtitle: 'Business Class',
    features: ['Leather interior', 'Free Wi-Fi & water', '2 suitcases'],
  },
  {
    id: 'vehicle-premium-sclass',
    badge: null,
    popular: true,
    imageUrl: 'https://assets.zyrosite.com/0B1b2Hs9k1Tamhoi/8-F4xzG4Z3SmAudVea.jpg',
    title: 'Mercedes S-Class',
    subtitle: 'First Class',
    features: ['Executive comfort', 'Extra legroom', '3 suitcases'],
  },
  {
    id: 'vehicle-van-vclass',
    badge: 'Max 7 Pax',
    popular: false,
    imageUrl: 'https://assets.zyrosite.com/0B1b2Hs9k1Tamhoi/7-2rOvtUBp1KVR8X7H.jpg',
    title: 'Mercedes V-Class',
    subtitle: 'Business Van',
    features: ['Ideal for families & groups', 'Conference seating', '7 suitcases'],
  },
];

export function BookingSummaryPage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(bookingData.vehicleId);

  const hasTrip = bookingData.from && bookingData.to && bookingData.date && bookingData.time;

  useEffect(() => {
    if (!hasTrip) {
      toast.error('Please complete the booking form first');
      navigate('/');
      return;
    }
  }, [hasTrip, navigate]);

  const fromLatLon = bookingData.fromLatLon;
  const toLatLon = bookingData.toLatLon;
  const distance = bookingData.distance ?? 0;
  const duration = bookingData.estimatedDuration ?? 0;

  useEffect(() => {
    if (!fromLatLon || !toLatLon) return;
    let cancelled = false;
    fetchOsrmRoute(fromLatLon, toLatLon).then((info) => {
      if (cancelled) return;
      if (info.routePoints?.length) setRoutePoints(info.routePoints);
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
      toast.error('Enter both From and To addresses');
      return;
    }
    if (!bookingData.fromLatLon || !bookingData.toLatLon) {
      toast.error('Please select addresses from the suggestions to recalculate');
      return;
    }
    setRecalculating(true);
    try {
      const info = await fetchOsrmRoute(bookingData.fromLatLon, bookingData.toLatLon);
      setRoutePoints(info.routePoints ?? []);
      updateBookingData({
        distance: info.distanceKm,
        estimatedDuration: info.durationMinutes,
      });
      toast.success('Route and price updated');
    } catch {
      toast.error('Could not recalculate route');
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
      toast.error('Please choose a vehicle');
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
          <h1 className="text-2xl font-serif text-[#0f172a]">Elegant Limo Switzerland</h1>
          <p className="text-sm text-slate-500">Review your booking & choose your car</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 1. Trip details (editable From/To) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-serif font-bold mb-4 border-b pb-2">1. Trip details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">Pickup</Label>
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
              <Label className="text-xs font-bold uppercase text-gray-500">Dropoff</Label>
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
                {recalculating ? 'Calculating…' : 'Recalculate route & price'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span><strong>Date:</strong> {bookingData.date && format(new Date(bookingData.date), 'PPP')}</span>
            <span><strong>Time:</strong> {bookingData.time}</span>
            <span><strong>Passengers:</strong> {bookingData.passengers}</span>
          </div>
        </section>

        {/* Map + Route overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <BookingMap
              from={bookingData.fromLatLon ?? undefined}
              to={bookingData.toLatLon ?? undefined}
              routePoints={routePoints.length >= 2 ? routePoints : undefined}
              className="w-full h-[320px] rounded-lg"
            />
          </div>
          <div className="bg-[#0f172a] text-white p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-[#D4AF37] font-serif text-xl mb-4">Route overview</h3>
            <div className="space-y-4 border-b border-gray-700 pb-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm uppercase">Distance</span>
                <span className="text-xl font-bold">{distance ? `${distance} km` : '––– km'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm uppercase">Est. duration</span>
                <span className="text-xl font-bold">
                  {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '––– min'}
                </span>
              </div>
            </div>
            {selectedVehicleId && vehiclePrices[selectedVehicleId] != null && (
              <div className="pt-4">
                <span className="text-gray-400 text-sm uppercase block mb-1">Estimated price</span>
                <span className="text-4xl font-serif text-[#D4AF37]">
                  CHF {Math.round(vehiclePrices[selectedVehicleId])}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Contact: name, surname, email, phone */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-serif font-bold mb-4 border-b pb-2">Contact details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">First name</Label>
              <Input
                className="mt-1 border-[#d4af37]/30"
                placeholder="First name"
                value={bookingData.customerDetails?.firstName ?? ''}
                onChange={(e) =>
                  updateBookingData({
                    customerDetails: {
                      ...(bookingData.customerDetails ?? {}),
                      firstName: e.target.value,
                      lastName: bookingData.customerDetails?.lastName ?? '',
                      email: bookingData.customerDetails?.email ?? '',
                      phone: bookingData.customerDetails?.phone ?? '',
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">Last name</Label>
              <Input
                className="mt-1 border-[#d4af37]/30"
                placeholder="Last name"
                value={bookingData.customerDetails?.lastName ?? ''}
                onChange={(e) =>
                  updateBookingData({
                    customerDetails: {
                      ...(bookingData.customerDetails ?? {}),
                      firstName: bookingData.customerDetails?.firstName ?? '',
                      lastName: e.target.value,
                      email: bookingData.customerDetails?.email ?? '',
                      phone: bookingData.customerDetails?.phone ?? '',
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">Email</Label>
              <Input
                type="email"
                className="mt-1 border-[#d4af37]/30"
                placeholder="Email"
                value={bookingData.customerDetails?.email ?? ''}
                onChange={(e) =>
                  updateBookingData({
                    customerDetails: {
                      ...(bookingData.customerDetails ?? {}),
                      firstName: bookingData.customerDetails?.firstName ?? '',
                      lastName: bookingData.customerDetails?.lastName ?? '',
                      email: e.target.value,
                      phone: bookingData.customerDetails?.phone ?? '',
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500">Phone</Label>
              <Input
                type="tel"
                className="mt-1 border-[#d4af37]/30"
                placeholder="Phone"
                value={bookingData.customerDetails?.phone ?? ''}
                onChange={(e) =>
                  updateBookingData({
                    customerDetails: {
                      ...(bookingData.customerDetails ?? {}),
                      firstName: bookingData.customerDetails?.firstName ?? '',
                      lastName: bookingData.customerDetails?.lastName ?? '',
                      email: bookingData.customerDetails?.email ?? '',
                      phone: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* 2. Choose vehicle */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-bold mb-4">2. Choose your vehicle</h2>
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
                      Popular
                    </div>
                  )}
                  {card.badge && !card.popular && (
                    <div className="absolute top-4 right-4 bg-gray-100 text-xs font-bold px-2 py-1 rounded">
                      {card.badge}
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
                    {card.features.map((f, i) => (
                      <li key={i}>• {f}</li>
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

        {/* Payment + Notes */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-serif font-bold mb-4 border-b pb-2">Payment & notes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="pay-card-vehicle"
                name="payment"
                checked={(bookingData.paymentMethod ?? 'Credit card in vehicle') === 'Credit card in vehicle'}
                onChange={() => updateBookingData({ paymentMethod: 'Credit card in vehicle' })}
                className="mt-1"
              />
              <Label htmlFor="pay-card-vehicle" className="cursor-pointer flex-1">
                <span className="font-semibold">Credit card in vehicle</span>
                <p className="text-sm text-gray-500 mt-1">
                  Payment in the vehicle immediately after the trip.
                </p>
              </Label>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" /> Notes for your chauffeur
              </Label>
              <Textarea
                placeholder="Child seats, extra luggage, hotel name, gate, etc."
                rows={3}
                className="border-[#d4af37]/30"
                value={bookingData.customerDetails?.specialRequests ?? ''}
                onChange={(e) =>
                  updateBookingData({
                    customerDetails: {
                      ...(bookingData.customerDetails ?? {}),
                      firstName: bookingData.customerDetails?.firstName ?? '',
                      lastName: bookingData.customerDetails?.lastName ?? '',
                      email: bookingData.customerDetails?.email ?? '',
                      phone: bookingData.customerDetails?.phone ?? '',
                      specialRequests: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/')} className="border-[#d4af37]/30">
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedVehicleId}
            className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white px-8"
          >
            Continue to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
