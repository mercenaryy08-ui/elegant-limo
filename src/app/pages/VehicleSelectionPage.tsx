import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../contexts/BookingContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { FLEET, getAvailableVehicles, Vehicle } from '../lib/fleet';
import { formatCHF } from '../lib/pricing';
import { getAvailableVehicles as checkAvailability, estimateTripDuration } from '../lib/availability';
import { closedSlotManager } from '../lib/admin-config';

export function VehicleSelectionPage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(bookingData.vehicleId);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedDistance, setEstimatedDistance] = useState(100); // Mock: 100km default

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData.from || !bookingData.to || !bookingData.date || !bookingData.time) {
      toast.error('Please complete the booking form first');
      navigate('/');
      return;
    }

    // Simulate checking availability and calculating distance
    const loadVehicleAvailability = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock distance calculation (in production, use Google Maps Distance Matrix API)
      const mockDistance = Math.floor(Math.random() * 150) + 50; // 50-200 km
      setEstimatedDistance(mockDistance);

      // Get estimated duration
      const estimatedDuration = estimateTripDuration(mockDistance);

      // Get vehicles that can accommodate passenger count
      const suitableVehicles = getAvailableVehicles(bookingData.passengers);

      // Check actual availability (considering existing bookings and closed slots)
      // In production, existingBookings would come from API
      const available = checkAvailability({
        vehicles: suitableVehicles,
        date: bookingData.date,
        time: bookingData.time,
        estimatedDuration,
        passengerCount: bookingData.passengers,
        existingBookings: [], // Would fetch from API
        closedSlots: closedSlotManager.getAll(),
      });

      setAvailableVehicles(available);

      // Store distance and duration in context
      updateBookingData({
        distance: mockDistance,
        estimatedDuration,
      });

      setIsLoading(false);
    };

    loadVehicleAvailability();
  }, [bookingData, navigate, updateBookingData]);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleContinue = () => {
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle');
      return;
    }

    updateBookingData({
      vehicleId: selectedVehicleId,
    });

    navigate('/calculate-price');
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        fullPage
        size="xl"
        message="Finding available vehicles..."
      />
    );
  }

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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-2">
              Select Your Vehicle
            </h2>
            <p className="text-muted-foreground">
              Choose the perfect vehicle for your journey
            </p>
          </div>

          {/* Journey Summary */}
          <Card className="border-[#d4af37]/30 bg-gradient-to-br from-white to-[#fafafa] mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-[#0a0a0a]">Journey Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium text-[#0a0a0a]">{bookingData.from}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium text-[#0a0a0a]">{bookingData.to}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-[#0a0a0a]">
                      {format(new Date(bookingData.date), 'PPP')} at {bookingData.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <p className="font-medium text-[#0a0a0a]">
                      {bookingData.passengers} {bookingData.passengers === 1 ? 'Person' : 'People'}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-4 bg-[#d4af37]/20" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Car className="w-4 h-4" />
                <span>Estimated distance: ~{estimatedDistance} km</span>
              </div>
            </div>
          </Card>

          {/* No Available Vehicles */}
          {availableVehicles.length === 0 && (
            <Card className="border-[#d4af37]/30 p-8 text-center">
              <div className="w-16 h-16 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#0a0a0a]">
                No Vehicles Available
              </h3>
              <p className="text-muted-foreground mb-4">
                Unfortunately, no vehicles are available for the selected date and time with{' '}
                {bookingData.passengers} passengers.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#f4e4b7]/10"
              >
                Change Booking Details
              </Button>
            </Card>
          )}

          {/* Vehicle Cards */}
          {availableVehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {availableVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedVehicleId === vehicle.id
                      ? 'border-2 border-[#d4af37] bg-[#f4e4b7]/10 shadow-lg'
                      : 'border border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:shadow-md'
                  }`}
                  onClick={() => handleVehicleSelect(vehicle.id)}
                >
                  <div className="p-6">
                    {/* Vehicle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#0a0a0a] mb-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{vehicle.className}</p>
                      </div>
                      {selectedVehicleId === vehicle.id && (
                        <CheckCircle2 className="w-6 h-6 text-[#d4af37]" />
                      )}
                    </div>

                    {/* Vehicle Image Placeholder */}
                    <div className="w-full h-32 bg-gradient-to-br from-[#f5f5f5] to-[#fafafa] rounded-lg mb-4 flex items-center justify-center">
                      <Car className="w-16 h-16 text-[#d4af37]" />
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-sm font-medium text-[#0a0a0a]">
                        {vehicle.capacity.min === vehicle.capacity.max
                          ? `${vehicle.capacity.max} passengers`
                          : `${vehicle.capacity.min}-${vehicle.capacity.max} passengers`}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4">{vehicle.description}</p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4 bg-[#d4af37]/20" />

                    {/* Pricing */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Rate</span>
                      <span className="text-lg font-bold text-[#d4af37]">
                        {formatCHF(vehicle.perKmRate)}/km
                      </span>
                    </div>

                    {/* Estimated Price */}
                    <div className="mt-3 p-3 bg-[#fafafa] rounded-lg">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Estimated total</span>
                        <span className="text-base font-semibold text-[#0a0a0a]">
                          ~{formatCHF(estimatedDistance * vehicle.perKmRate)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {estimatedDistance} km
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* All Fleet Info */}
          {availableVehicles.length > 0 && availableVehicles.length < FLEET.length && (
            <Card className="border-[#d4af37]/20 bg-[#fafafa] mb-8">
              <div className="p-6">
                <h4 className="text-sm font-semibold mb-2 text-[#0a0a0a]">
                  Why can't I see all vehicles?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Some vehicles may be unavailable due to:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Passenger capacity restrictions</li>
                  <li>• Already booked for overlapping times</li>
                  <li>• Scheduled maintenance</li>
                </ul>
              </div>
            </Card>
          )}

          {/* Continue Button */}
          {availableVehicles.length > 0 && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-[#d4af37]/30"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedVehicleId}
                className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white px-8"
              >
                Continue to Pricing
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
