import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Clock, Users, CheckCircle2, Car } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { getVehicleById } from '../lib/fleet';
import { calculatePrice, formatCHF, ADD_ONS, PriceCalculation } from '../lib/pricing';

export function CalculatePricePage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Redirect if no booking data or vehicle
    if (!bookingData.from || !bookingData.to || !bookingData.vehicleId || !bookingData.distance) {
      toast.error('Please complete the vehicle selection first');
      navigate('/');
      return;
    }

    // Calculate price
    const loadPrice = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const vehicle = getVehicleById(bookingData.vehicleId!);
      if (!vehicle) {
        toast.error('Vehicle not found');
        navigate('/');
        return;
      }

      const calculation = calculatePrice({
        from: bookingData.from,
        to: bookingData.to,
        vehicle,
        distance: bookingData.distance,
        selectedAddOns: [],
      });

      setPriceCalculation(calculation);
      setIsLoading(false);
    };

    loadPrice();

    // Check mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [bookingData, navigate]);

  const toggleAddOn = (addOnId: string) => {
    const newAddOns = selectedAddOns.includes(addOnId)
      ? selectedAddOns.filter((id) => id !== addOnId)
      : [...selectedAddOns, addOnId];

    setSelectedAddOns(newAddOns);

    // Recalculate price with new add-ons
    if (priceCalculation) {
      const vehicle = getVehicleById(bookingData.vehicleId!);
      if (vehicle) {
        const newCalculation = calculatePrice({
          from: bookingData.from,
          to: bookingData.to,
          vehicle,
          distance: bookingData.distance,
          selectedAddOns: newAddOns,
        });
        setPriceCalculation(newCalculation);
      }
    }
  };

  const handleBookNow = () => {
    if (!priceCalculation) return;

    updateBookingData({
      selectedAddOns,
      priceCalculation,
      totalPrice: priceCalculation.subtotal,
    });

    navigate('/checkout');
  };

  if (isLoading || !priceCalculation) {
    return <LoadingSpinner fullPage size="xl" message="Calculating price..." />;
  }

  const vehicle = getVehicleById(bookingData.vehicleId!);
  if (!vehicle) {
    navigate('/');
    return null;
  }

  const BookingSummaryCard = () => (
    <Card className="border-[#d4af37]/30 bg-gradient-to-br from-white to-[#fafafa] shadow-lg sticky top-24">
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-xl font-semibold text-[#0a0a0a]">Booking Summary</h3>
          </div>

          <div className="space-y-4">
            {/* Vehicle */}
            <div className="flex items-start gap-3">
              <Car className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium text-[#0a0a0a]">{vehicle.name} ({vehicle.className})</p>
              </div>
            </div>

            <Separator className="bg-[#d4af37]/20" />

            {/* From */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium text-[#0a0a0a]">{bookingData.from}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-[#d4af37]" />
            </div>

            {/* To */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium text-[#0a0a0a]">{bookingData.to}</p>
              </div>
            </div>

            <Separator className="bg-[#d4af37]/20" />

            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0a0a0a]">
                  {bookingData.date && format(new Date(bookingData.date), 'PPPP')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0a0a0a]">{bookingData.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0a0a0a]">
                  {bookingData.passengers} {bookingData.passengers === 1 ? 'Passenger' : 'Passengers'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-[#d4af37]/20" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          {priceCalculation.breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium text-[#0a0a0a]">{formatCHF(item.amount)}</span>
            </div>
          ))}

          <Separator className="bg-[#d4af37]/20" />

          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-[#0a0a0a]">Total</span>
            <span className="text-2xl font-bold text-[#d4af37]">
              {formatCHF(priceCalculation.subtotal)}
            </span>
          </div>

          {/* Pricing method badge */}
          <div className="pt-2">
            <Badge variant="outline" className="border-[#d4af37]/30 text-[#0a0a0a] text-xs">
              {priceCalculation.pricingMethod === 'fixed-route' ? '✓ Fixed-route pricing' : `${bookingData.distance?.toFixed(1)} km journey`}
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleBookNow}
          className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white shadow-lg transition-all duration-300"
        >
          Continue to Checkout
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
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
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-2">Price Details</h2>
              <p className="text-muted-foreground">Review your booking and add optional services</p>
            </div>

            {/* Pricing Information */}
            <Card className="border-[#d4af37]/30">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-[#0a0a0a]">Price Breakdown</h3>

                {priceCalculation.pricingMethod === 'fixed-route' && priceCalculation.fixedRoute && (
                  <div className="bg-[#f4e4b7]/20 border border-[#d4af37]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                      <span className="font-semibold text-[#0a0a0a]">Fixed-Route Pricing</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is a fixed-price route: <strong>{priceCalculation.fixedRoute.description}</strong>
                    </p>
                  </div>
                )}

                {priceCalculation.pricingMethod === 'per-km' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">{bookingData.distance?.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">{formatCHF(vehicle.perKmRate)}/km</span>
                    </div>
                    <Separator className="bg-[#d4af37]/20" />
                    <div className="flex justify-between">
                      <span className="font-semibold">Base Price</span>
                      <span className="font-bold text-[#d4af37]">
                        {formatCHF(priceCalculation.basePrice)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Add-ons Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-[#0a0a0a]">Optional Services</h3>

              <div className="grid grid-cols-1 gap-4">
                {ADD_ONS.map((addon) => (
                  <Card
                    key={addon.id}
                    className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                      selectedAddOns.includes(addon.id)
                        ? 'border-[#d4af37] bg-[#f4e4b7]/10'
                        : 'border-[#d4af37]/20 hover:border-[#d4af37]/40'
                    }`}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-3xl">{addon.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0a0a0a] mb-1">{addon.name}</h4>
                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedAddOns.includes(addon.id)}
                          onCheckedChange={() => toggleAddOn(addon.id)}
                          className="border-[#d4af37] data-[state=checked]:bg-[#d4af37]"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <Badge variant="outline" className="border-[#d4af37] text-[#d4af37] font-semibold">
                          + {formatCHF(addon.price)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mobile Summary - Shows at bottom on mobile */}
            {isMobile && (
              <div className="lg:hidden">
                <BookingSummaryCard />
              </div>
            )}
          </div>

          {/* Desktop Sticky Summary - Hidden on mobile */}
          <div className="hidden lg:block">
            <BookingSummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
