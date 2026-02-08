import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Car, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BookingMap } from '../components/BookingMap';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { FLEET, getAvailableVehicles, getVehicleById, Vehicle } from '../lib/fleet';
import { calculatePrice, formatCHF } from '../lib/pricing';
import { getAvailableVehicles as checkAvailability, estimateTripDuration } from '../lib/availability';
import { closedSlotManager } from '../lib/admin-config';
import { fetchRouteDirections } from '../lib/route-utils';

export function BookingSummaryPage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [from, setFrom] = useState(bookingData.from);
  const [to, setTo] = useState(bookingData.to);
  const [fromLatLon, setFromLatLon] = useState(bookingData.fromLatLon);
  const [toLatLon, setToLatLon] = useState(bookingData.toLatLon);
  const [distance, setDistance] = useState<number>(bookingData.distance ?? 0);
  const [duration, setDuration] = useState<number>(bookingData.estimatedDuration ?? 0);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(bookingData.vehicleId);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const recalc = useCallback(async () => {
    if (!from.trim() || !to.trim()) {
      toast.error('Please enter both From and To addresses.');
      return;
    }
    if (fromLatLon && toLatLon) {
      setIsRecalculating(true);
      try {
        const route = await fetchRouteDirections(fromLatLon, toLatLon);
        setDistance(route.distanceKm);
        setDuration(route.durationMinutes);
        updateBookingData({
          from,
          to,
          fromLatLon,
          toLatLon,
          distance: route.distanceKm,
          estimatedDuration: route.durationMinutes,
        });
        const suitable = getAvailableVehicles(bookingData.passengers);
        const available = checkAvailability({
          vehicles: suitable,
          date: bookingData.date,
          time: bookingData.time,
          estimatedDuration: route.durationMinutes,
          passengerCount: bookingData.passengers,
          existingBookings: [],
          closedSlots: closedSlotManager.getAll(),
        });
        setAvailableVehicles(available);
        if (selectedVehicleId && !available.some((v) => v.id === selectedVehicleId)) {
          setSelectedVehicleId(undefined);
        }
        const vehicle = selectedVehicleId ? getVehicleById(selectedVehicleId) : available[0];
        if (vehicle) {
          const calc = calculatePrice({
            from,
            to,
            vehicle,
            distance: route.distanceKm,
            selectedAddOns: bookingData.selectedAddOns ?? [],
          });
          setTotalPrice(calc.subtotal);
          updateBookingData({ priceCalculation: calc });
        }
      } finally {
        setIsRecalculating(false);
      }
    } else {
      const mockKm = 80;
      const estDuration = estimateTripDuration(mockKm);
      setDistance(mockKm);
      setDuration(estDuration);
      updateBookingData({
        from,
        to,
        distance: mockKm,
        estimatedDuration: estDuration,
      });
      const suitable = getAvailableVehicles(bookingData.passengers);
      const available = checkAvailability({
        vehicles: suitable,
        date: bookingData.date,
        time: bookingData.time,
        estimatedDuration: estDuration,
        passengerCount: bookingData.passengers,
        existingBookings: [],
        closedSlots: closedSlotManager.getAll(),
      });
      setAvailableVehicles(available);
      const vehicle = selectedVehicleId ? getVehicleById(selectedVehicleId) : available[0];
      if (vehicle) {
        const calc = calculatePrice({
          from,
          to,
          vehicle,
          distance: mockKm,
          selectedAddOns: bookingData.selectedAddOns ?? [],
        });
        setTotalPrice(calc.subtotal);
        updateBookingData({ priceCalculation: calc });
      }
    }
  }, [
    from,
    to,
    fromLatLon,
    toLatLon,
    bookingData.passengers,
    bookingData.date,
    bookingData.time,
    bookingData.selectedAddOns,
    selectedVehicleId,
    updateBookingData,
  ]);

  useEffect(() => {
    if (!bookingData.from || !bookingData.to || !bookingData.date || !bookingData.time) {
      toast.error('Please complete the booking form first.');
      navigate('/');
      return;
    }
    setFrom(bookingData.from);
    setTo(bookingData.to);
    setFromLatLon(bookingData.fromLatLon ?? undefined);
    setToLatLon(bookingData.toLatLon ?? undefined);
    setSelectedVehicleId(bookingData.vehicleId);
    setDistance(bookingData.distance ?? 0);
    setDuration(bookingData.estimatedDuration ?? 0);
    if (bookingData.priceCalculation) setTotalPrice(bookingData.priceCalculation.subtotal);
    const suitable = getAvailableVehicles(bookingData.passengers);
    const available = checkAvailability({
      vehicles: suitable,
      date: bookingData.date,
      time: bookingData.time,
      estimatedDuration: bookingData.estimatedDuration ?? 60,
      passengerCount: bookingData.passengers,
      existingBookings: [],
      closedSlots: closedSlotManager.getAll(),
    });
    setAvailableVehicles(available);
    if (bookingData.fromLatLon && bookingData.toLatLon) {
      fetchRouteDirections(bookingData.fromLatLon, bookingData.toLatLon).then((route) => {
        setDistance(route.distanceKm);
        setDuration(route.durationMinutes);
        updateBookingData({ distance: route.distanceKm, estimatedDuration: route.durationMinutes });
        const vehicle = bookingData.vehicleId ? getVehicleById(bookingData.vehicleId) : available[0];
        if (vehicle) {
          const calc = calculatePrice({
            from: bookingData.from,
            to: bookingData.to,
            vehicle,
            distance: route.distanceKm,
            selectedAddOns: bookingData.selectedAddOns ?? [],
          });
          setTotalPrice(calc.subtotal);
          updateBookingData({ priceCalculation: calc });
        }
      });
    } else if (bookingData.distance && bookingData.vehicleId) {
      const vehicle = getVehicleById(bookingData.vehicleId);
      if (vehicle) {
        const calc = calculatePrice({
          from: bookingData.from,
          to: bookingData.to,
          vehicle,
          distance: bookingData.distance,
          selectedAddOns: bookingData.selectedAddOns ?? [],
        });
        setTotalPrice(calc.subtotal);
        updateBookingData({ priceCalculation: calc });
      }
    }
  }, [navigate, bookingData.from, bookingData.to, bookingData.date, bookingData.time, bookingData.fromLatLon, bookingData.toLatLon, bookingData.vehicleId, bookingData.passengers, bookingData.distance, bookingData.estimatedDuration, bookingData.priceCalculation, bookingData.selectedAddOns, updateBookingData]);

  useEffect(() => {
    if (selectedVehicleId && (distance > 0 || bookingData.priceCalculation)) {
      const vehicle = getVehicleById(selectedVehicleId);
      if (vehicle) {
        const calc = calculatePrice({
          from,
          to,
          vehicle,
          distance,
          selectedAddOns: bookingData.selectedAddOns ?? [],
        });
        setTotalPrice(calc.subtotal);
        updateBookingData({ priceCalculation: calc, vehicleId: selectedVehicleId });
      }
    }
  }, [selectedVehicleId, distance, from, to, bookingData.selectedAddOns]);

  const handleFromSelect = (address: string, lat: number, lng: number) => {
    setFrom(address);
    setFromLatLon({ lat, lng });
    updateBookingData({ from: address, fromLatLon: { lat, lng } });
  };

  const handleToSelect = (address: string, lat: number, lng: number) => {
    setTo(address);
    setToLatLon({ lat, lng });
    updateBookingData({ to: address, toLatLon: { lat, lng } });
  };

  const handleContinue = () => {
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle.');
      return;
    }
    updateBookingData({
      from,
      to,
      fromLatLon,
      toLatLon,
      distance,
      estimatedDuration: duration,
      vehicleId: selectedVehicleId,
      totalPrice,
    });
    navigate('/checkout');
  };

  const vehiclesToShow = FLEET;
  const vehicleDisabled = (v: Vehicle) =>
    v.capacity.max < bookingData.passengers || v.capacity.min > bookingData.passengers || !availableVehicles.some((av) => av.id === v.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[#d4af37]/20 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a] cursor-pointer" onClick={() => navigate('/')}>
              Elegant Limo
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0a0a0a]">
            Review your journey
          </h2>

          {/* Map with route */}
          <Card className="border-[#d4af37]/30 overflow-hidden">
            <BookingMap
              from={fromLatLon ?? undefined}
              to={toLatLon ?? undefined}
              className="w-full h-[320px]"
            />
          </Card>

          {/* Editable From / To + Recalculate */}
          <Card className="border-[#d4af37]/30 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>From</Label>
                <AddressAutocomplete
                  value={from}
                  onChange={setFrom}
                  onSelect={handleFromSelect}
                  placeholder="Pickup address (Switzerland)"
                  className="h-12 border-[#d4af37]/30 bg-[#fafafa]"
                />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <AddressAutocomplete
                  value={to}
                  onChange={setTo}
                  onSelect={handleToSelect}
                  placeholder="Dropoff address (Switzerland)"
                  className="h-12 border-[#d4af37]/30 bg-[#fafafa]"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={recalc}
              disabled={isRecalculating}
              className="border-[#d4af37] text-[#d4af37] hover:bg-[#f4e4b7]/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isRecalculating ? 'Recalculating...' : 'Recalculate'}
            </Button>
          </Card>

          {/* Distance, time, price */}
          <Card className="border-[#d4af37]/30 p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#0a0a0a]">Trip details</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>{distance > 0 ? `~${distance.toFixed(1)} km` : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span>{duration > 0 ? `~${duration} min` : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <span>{bookingData.passengers} passengers</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#d4af37]">
                {totalPrice > 0 ? formatCHF(totalPrice) : '—'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(bookingData.date), 'PPP')} at {bookingData.time}
            </p>
          </Card>

          {/* Choose one of 3 cars */}
          <Card className="border-[#d4af37]/30 p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#0a0a0a]">
              Choose your vehicle (required)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehiclesToShow.map((vehicle) => {
                const disabled = vehicleDisabled(vehicle);
                const selected = selectedVehicleId === vehicle.id;
                return (
                  <Card
                    key={vehicle.id}
                    className={`p-4 cursor-pointer transition-all ${
                      disabled ? 'opacity-60 cursor-not-allowed' : ''
                    } ${selected ? 'border-2 border-[#d4af37] bg-[#f4e4b7]/10' : 'border-[#d4af37]/30'}`}
                    onClick={() => !disabled && setSelectedVehicleId(vehicle.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#0a0a0a]">{vehicle.name}</span>
                      {selected && <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{vehicle.className}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vehicle.capacity.min}-{vehicle.capacity.max} passengers
                    </p>
                    {disabled && (
                      <p className="text-xs text-destructive mt-2">
                        {v.capacity.max < bookingData.passengers || v.capacity.min > bookingData.passengers
                          ? `Capacity: ${v.capacity.min}-${v.capacity.max} passengers`
                          : 'Not available for this time'}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')} className="border-[#d4af37]/30">
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedVehicleId}
              className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white"
            >
              Continue to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
