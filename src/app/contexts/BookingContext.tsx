import { createContext, useContext, useState, ReactNode } from 'react';
import { PriceCalculation } from '../lib/pricing';

export interface LatLon {
  lat: number;
  lng: number;
}

export interface BookingData {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  fromLatLon?: LatLon;
  toLatLon?: LatLon;
  vehicleId?: string;
  distance?: number; // kilometers
  estimatedDuration?: number; // minutes
  priceCalculation?: PriceCalculation;
  selectedAddOns?: string[];
  totalPrice?: number;
  customerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentMethod?: string; // e.g. "Credit card in vehicle"
  paymentDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
}

interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookingData: BookingData = {
  from: '',
  to: '',
  date: '',
  time: '',
  passengers: 1,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setBookingData(initialBookingData);
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}