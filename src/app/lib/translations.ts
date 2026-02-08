// Multilingual support structure (EN/AL)
// This structure allows easy extension for additional languages

export type Language = 'en' | 'al';

export interface Translations {
  nav: {
    home: string;
    about: string;
    contact: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
    };
    form: {
      from: string;
      to: string;
      date: string;
      time: string;
      passengers: string;
      continue: string;
      pickupPlaceholder: string;
      dropoffPlaceholder: string;
    };
    validation: {
      requiredField: string;
      invalidDate: string;
      pastDate: string;
    };
  };
  pricing: {
    title: string;
    routeSummary: string;
    basePrice: string;
    addOns: string;
    total: string;
    bookNow: string;
    addOn: {
      champagne: string;
      champagneDesc: string;
      airportMeet: string;
      airportMeetDesc: string;
      childSeat: string;
      childSeatDesc: string;
      redCarpet: string;
      redCarpetDesc: string;
    };
  };
  checkout: {
    title: string;
    customerDetails: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    termsLabel: string;
    privacyLabel: string;
    confirmBooking: string;
    bookingSummary: string;
    successMessage: string;
    bookingReference: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
}

const en: Translations = {
  nav: {
    home: 'Home',
    about: 'About',
    contact: 'Contact',
  },
  home: {
    hero: {
      title: 'Elegant Limo',
      subtitle: 'Premium Limousine Service for Discerning Travelers',
    },
    form: {
      from: 'Pickup Location',
      to: 'Dropoff Location',
      date: 'Date',
      time: 'Time',
      passengers: 'Passengers',
      continue: 'Continue',
      pickupPlaceholder: 'Enter pickup address',
      dropoffPlaceholder: 'Enter dropoff address',
    },
    validation: {
      requiredField: 'This field is required',
      invalidDate: 'Invalid date',
      pastDate: 'Date cannot be in the past',
    },
  },
  pricing: {
    title: 'Your Journey Details',
    routeSummary: 'Route Summary',
    basePrice: 'Base Price',
    addOns: 'Premium Add-ons',
    total: 'Total',
    bookNow: 'Book Now',
    addOn: {
      champagne: 'Champagne Service',
      champagneDesc: 'Dom Pérignon champagne service',
      airportMeet: 'Airport Meet & Greet',
      airportMeetDesc: 'Personal meet and greet at airport',
      childSeat: 'Child Safety Seat',
      childSeatDesc: 'Premium child safety seat',
      redCarpet: 'Red Carpet Service',
      redCarpetDesc: 'Red carpet roll-out service',
    },
  },
  checkout: {
    title: 'Complete Your Reservation',
    customerDetails: 'Customer Details',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    specialRequests: 'Special Requests',
    paymentMethod: 'Payment Method',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    termsLabel: 'I agree to the Terms & Conditions',
    privacyLabel: 'I agree to the Privacy Policy',
    confirmBooking: 'Confirm Booking',
    bookingSummary: 'Booking Summary',
    successMessage: 'Your booking has been confirmed!',
    bookingReference: 'Booking Reference',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
  },
};

const al: Translations = {
  nav: {
    home: 'Ballina',
    about: 'Rreth Nesh',
    contact: 'Kontakt',
  },
  home: {
    hero: {
      title: 'Elegant Limo',
      subtitle: 'Shërbim Premium Limuzine për Udhëtarë të Zgjedhur',
    },
    form: {
      from: 'Vendi i Marrjes',
      to: 'Vendi i Lënies',
      date: 'Data',
      time: 'Koha',
      passengers: 'Pasagjerë',
      continue: 'Vazhdo',
      pickupPlaceholder: 'Vendosni adresën e marrjes',
      dropoffPlaceholder: 'Vendosni adresën e lënies',
    },
    validation: {
      requiredField: 'Kjo fushë është e detyrueshme',
      invalidDate: 'Datë e pavlefshme',
      pastDate: 'Data nuk mund të jetë në të kaluarën',
    },
  },
  pricing: {
    title: 'Detajet e Udhëtimit Tuaj',
    routeSummary: 'Përmbledhja e Rrugës',
    basePrice: 'Çmimi Bazë',
    addOns: 'Shtesa Premium',
    total: 'Totali',
    bookNow: 'Rezervo Tani',
    addOn: {
      champagne: 'Shërbimi i Shampanjës',
      champagneDesc: 'Shërbim shampanje Dom Pérignon',
      airportMeet: 'Pritje në Aeroport',
      airportMeetDesc: 'Pritje personale në aeroport',
      childSeat: 'Sedilja për Fëmijë',
      childSeatDesc: 'Sedilja premium sigurie për fëmijë',
      redCarpet: 'Shërbimi i Tapetin të Kuq',
      redCarpetDesc: 'Shërbim me tapete të kuq',
    },
  },
  checkout: {
    title: 'Plotësoni Rezervimin Tuaj',
    customerDetails: 'Detajet e Klientit',
    firstName: 'Emri',
    lastName: 'Mbiemri',
    email: 'Email',
    phone: 'Numri i Telefonit',
    specialRequests: 'Kërkesa të Veçanta',
    paymentMethod: 'Metoda e Pagesës',
    cardNumber: 'Numri i Kartës',
    expiryDate: 'Data e Skadimit',
    cvv: 'CVV',
    termsLabel: 'Pajtohem me Termat & Kushtet',
    privacyLabel: 'Pajtohem me Politikën e Privatësisë',
    confirmBooking: 'Konfirmo Rezervimin',
    bookingSummary: 'Përmbledhja e Rezervimit',
    successMessage: 'Rezervimi juaj është konfirmuar!',
    bookingReference: 'Referenca e Rezervimit',
  },
  common: {
    loading: 'Duke u ngarkuar...',
    error: 'Ndodhi një gabim',
    success: 'Sukses!',
  },
};

export const translations: Record<Language, Translations> = {
  en,
  al,
};

// Hook for using translations (can be extended with language switching)
export function useTranslations(lang: Language = 'en'): Translations {
  return translations[lang];
}
