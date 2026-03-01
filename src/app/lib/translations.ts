// Multilingual support structure (EN/AL)
// This structure allows easy extension for additional languages

export type Language = 'en' | 'al' | 'de';

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
      update: string;
      book: string;
      pickupPlaceholder: string;
      dropoffPlaceholder: string;
    };
    validation: {
      requiredField: string;
      invalidDate: string;
      pastDate: string;
    };
  };
  summary: {
    pageTitle: string;
    pageSubtitle: string;
    tripDetails: string;
    pickup: string;
    dropoff: string;
    recalculate: string;
    calculating: string;
    date: string;
    time: string;
    passengers: string;
    routeOverview: string;
    distance: string;
    estDuration: string;
    estimatedPrice: string;
    chooseVehicle: string;
    popular: string;
    paymentAndNotes: string;
    payCardVehicle: string;
    payCardVehicleDesc: string;
    notesForChauffeur: string;
    notesPlaceholder: string;
    back: string;
    continueToCheckout: string;
    completeFormFirst: string;
    chooseVehicleToast: string;
    routeUpdated: string;
    recalcError: string;
    enterBothAddresses: string;
    selectAddressesToRecalc: string;
    flightDetails: string;
    flightNumberLabel: string;
    flightNumberPlaceholder: string;
    flightNumberHint: string;
    badgeMax3Pax: string;
    badgeMax7Pax: string;
    featureLeatherInterior: string;
    featureFreeWifi: string;
    feature2Suitcases: string;
    featureExecutiveComfort: string;
    featureExtraLegroom: string;
    feature3Suitcases: string;
    featureFamiliesGroups: string;
    featureConferenceSeating: string;
    feature7Suitcases: string;
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
    payStripe: string;
    payStripeDesc: string;
    payWithStripe: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    termsLabel: string;
    privacyLabel: string;
    cancellationLabel: string;
    confirmBooking: string;
    bookingSummary: string;
    successMessage: string;
    bookingReference: string;
    redirecting: string;
    acceptTermsError: string;
    fillRequiredError: string;
    firstNameRequired: string;
    lastNameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    phoneRequired: string;
    justDetails: string;
    payment: string;
    addOns: string;
    placeholderFirstName: string;
    placeholderLastName: string;
    placeholderEmail: string;
    placeholderPhone: string;
    placeholderSpecialRequests: string;
    specialRequestsOptional: string;
    addOnVipName: string;
    addOnVipDesc: string;
    invoiceTransfer: string;
    invoiceTotal: string;
    vehicleLabel: string;
    fromLabel: string;
    toLabel: string;
    secureStripe: string;
    emailReceipt: string;
    termsAndPrivacy: string;
  };
  success: {
    confirmingPayment: string;
    couldNotConfirm: string;
    returnHome: string;
    paymentComplete: string;
    confirmationSent: string;
    pickupAt: string;
    bookingId: string;
    addToCalendar: string;
    contactWhatsApp: string;
    paidOnline: string;
    receiptSent: string;
  };
  cancelBooking: {
    pageTitle: string;
    pageSubtitle: string;
    bookingReference: string;
    email: string;
    submit: string;
    successTitle: string;
    successMessage: string;
    backHome: string;
    errorSending: string;
    invalidEmail: string;
    refRequired: string;
    needToCancelLink: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    passenger: string;
    passengers: string;
    person: string;
    people: string;
  };
  cancellationPolicy: {
    title: string;
    summary: string;
    detail1: string;
    detail2: string;
    detail3: string;
    detail4: string;
    detail5: string;
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
      update: 'Update',
      book: 'Book',
      pickupPlaceholder: 'Enter pickup address',
      dropoffPlaceholder: 'Enter dropoff address',
    },
    validation: {
      requiredField: 'This field is required',
      invalidDate: 'Invalid date',
      pastDate: 'Date cannot be in the past',
    },
  },
  summary: {
    pageTitle: 'Elegant Limo Switzerland',
    pageSubtitle: 'Review your booking & choose your car',
    tripDetails: 'Trip details',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    recalculate: 'Recalculate route & price',
    calculating: 'Calculating…',
    date: 'Date',
    time: 'Time',
    passengers: 'Passengers',
    routeOverview: 'Route overview',
    distance: 'Distance',
    estDuration: 'Est. duration',
    estimatedPrice: 'Estimated price',
    chooseVehicle: 'Choose your vehicle',
    popular: 'Popular',
    paymentAndNotes: 'Payment & notes',
    payCardVehicle: 'Credit card in vehicle',
    payCardVehicleDesc: 'Payment in the vehicle immediately after the trip.',
    notesForChauffeur: 'Notes for your chauffeur',
    notesPlaceholder: 'Child seats, extra luggage, hotel name, gate, etc.',
    back: 'Back',
    continueToCheckout: 'Continue to checkout',
    completeFormFirst: 'Please complete the booking form first',
    chooseVehicleToast: 'Please choose a vehicle',
    routeUpdated: 'Route and price updated',
    recalcError: 'Could not recalculate route',
    enterBothAddresses: 'Enter both From and To addresses',
    selectAddressesToRecalc: 'Please select addresses from the suggestions to recalculate',
    flightDetails: 'Flight details (optional)',
    flightNumberLabel: 'Flight number (if you arrive by plane)',
    flightNumberPlaceholder: 'e.g. LX123, BA718',
    flightNumberHint: 'This helps your chauffeur track your arrival. Leave empty if you are not flying.',
    badgeMax3Pax: 'Max 3 Pax',
    badgeMax7Pax: 'Max 7 Pax',
    featureLeatherInterior: 'Leather interior',
    featureFreeWifi: 'Free Wi-Fi & water',
    feature2Suitcases: '2 suitcases',
    featureExecutiveComfort: 'Executive comfort',
    featureExtraLegroom: 'Extra legroom',
    feature3Suitcases: '3 suitcases',
    featureFamiliesGroups: 'Ideal for families & groups',
    featureConferenceSeating: 'Conference seating',
    feature7Suitcases: '7 suitcases',
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
    payStripe: 'Pay on website with card (Stripe)',
    payStripeDesc: 'You will be taken to a secure Stripe page to pay by credit or debit card. A receipt will be sent to your email after payment.',
    payWithStripe: 'Pay with Stripe',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    termsLabel: 'I agree to the Terms & Conditions',
    privacyLabel: 'I agree to the Privacy Policy',
    cancellationLabel: 'I have read and accept the cancellation policy',
    confirmBooking: 'Confirm Booking',
    bookingSummary: 'Booking Summary',
    successMessage: 'Your booking has been confirmed!',
    bookingReference: 'Booking Reference',
    redirecting: 'Redirecting to payment...',
    acceptTermsError: 'Please accept the terms and cancellation policy',
    fillRequiredError: 'Please fill in all required fields (name, email, phone) and fix any errors below.',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    phoneRequired: 'Phone number is required',
    justDetails: 'Just a few more details to confirm your booking',
    payment: 'Payment',
    addOns: 'Add-ons',
    placeholderFirstName: 'John',
    placeholderLastName: 'Doe',
    placeholderEmail: 'john.doe@example.com',
    placeholderPhone: '+41 79 123 4567',
    placeholderSpecialRequests: 'Any special requirements or preferences...',
    specialRequestsOptional: '(Optional)',
    addOnVipName: 'VIP Service',
    addOnVipDesc: 'Airport meet-and-greet inside the terminal (chauffeur enters the terminal to pick you up)',
    invoiceTransfer: 'Transfer',
    invoiceTotal: 'Total',
    vehicleLabel: 'Vehicle',
    fromLabel: 'From',
    toLabel: 'To',
    secureStripe: 'Secure payment powered by Stripe',
    emailReceipt: 'Email receipt after payment',
    termsAndPrivacy: 'I agree to the Terms & Conditions and Privacy Policy',
  },
  success: {
    confirmingPayment: 'Confirming your payment...',
    couldNotConfirm: "We couldn't confirm your booking.",
    returnHome: 'Return to home',
    paymentComplete: 'Payment complete – booking confirmed',
    confirmationSent: 'A confirmation and receipt have been sent to your email.',
    pickupAt: 'Pickup',
    bookingId: 'Booking ID',
    addToCalendar: 'Add to Google Calendar',
    contactWhatsApp: 'Contact us on WhatsApp',
    paidOnline: 'Paid online',
    receiptSent: 'CHF {amount} paid by card. Receipt sent to your email.',
  },
  cancelBooking: {
    pageTitle: 'Cancel my booking',
    pageSubtitle: 'Enter your booking reference and email. We will process your cancellation and refund according to our policy.',
    bookingReference: 'Booking reference',
    email: 'Email address',
    submit: 'Request cancellation',
    successTitle: 'Request received',
    successMessage: 'We have received your cancellation request. We will process it and contact you regarding any refund.',
    backHome: 'Back to home',
    errorSending: 'Could not send request. Please try again or contact us by WhatsApp.',
    invalidEmail: 'Please enter a valid email address.',
    refRequired: 'Please enter your booking reference (e.g. EL12345678).',
    needToCancelLink: 'Need to cancel? Request cancellation',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    passenger: 'Passenger',
    passengers: 'Passengers',
    person: 'Person',
    people: 'People',
  },
  cancellationPolicy: {
    title: 'Cancellation Policy',
    summary: 'Free cancellation up to 48 hours before pickup',
    detail1: 'Cancel free of charge if you cancel ≥48 hours before your scheduled pickup time',
    detail2: 'Cancellations between 24-48 hours before pickup: Free cancellation (grace period)',
    detail3: 'Cancellations <24 hours before pickup: 50% cancellation fee applies',
    detail4: 'To cancel, contact us by phone or email with your booking reference',
    detail5: 'Refunds are processed within 5-7 business days',
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
      update: 'Përditëso',
      book: 'Rezervo',
      pickupPlaceholder: 'Vendosni adresën e marrjes',
      dropoffPlaceholder: 'Vendosni adresën e lënies',
    },
    validation: {
      requiredField: 'Kjo fushë është e detyrueshme',
      invalidDate: 'Datë e pavlefshme',
      pastDate: 'Data nuk mund të jetë në të kaluarën',
    },
  },
  summary: {
    pageTitle: 'Elegant Limo Switzerland',
    pageSubtitle: 'Rishikoni rezervimin dhe zgjidhni makinën',
    tripDetails: 'Detajet e udhëtimit',
    pickup: 'Marrja',
    dropoff: 'Lënia',
    recalculate: 'Rillogarit rrugën dhe çmimin',
    calculating: 'Duke llogaritur…',
    date: 'Data',
    time: 'Koha',
    passengers: 'Pasagjerët',
    routeOverview: 'Përmbledhja e rrugës',
    distance: 'Distanca',
    estDuration: 'Kohëzgjatja',
    estimatedPrice: 'Çmimi i vlerësuar',
    chooseVehicle: 'Zgjidhni makinën',
    popular: 'Popullore',
    paymentAndNotes: 'Pagesa dhe shënime',
    payCardVehicle: 'Kartë krediti në makinë',
    payCardVehicleDesc: 'Pagesa në makinë menjëherë pas udhëtimit.',
    notesForChauffeur: 'Shënime për shoferin',
    notesPlaceholder: 'Sedilje fëmijësh, bagazh shtesë, emri i hotelit, etj.',
    back: 'Mbrapa',
    continueToCheckout: 'Vazhdo te pagesa',
    completeFormFirst: 'Ju lutemi plotësoni fillimisht formularin e rezervimit',
    chooseVehicleToast: 'Ju lutemi zgjidhni një makinë',
    routeUpdated: 'Rruga dhe çmimi u përditësuan',
    recalcError: 'Nuk u rillogarit rruga',
    enterBothAddresses: 'Vendosni adresat Nga dhe Deri',
    selectAddressesToRecalc: 'Ju lutemi zgjidhni adresat nga sugjerimet për të rillogaritur',
    flightDetails: 'Detajet e fluturimit (opsionale)',
    flightNumberLabel: 'Numri i fluturimit (nëse arrini me aeroplan)',
    flightNumberPlaceholder: 'p.sh. LX123, BA718',
    flightNumberHint: 'Kjo ndihmon shoferin tuaj të ndjekë mbërritjen tuaj. Lini bosh nëse nuk fluturoni.',
    badgeMax3Pax: 'Maks 3 pax',
    badgeMax7Pax: 'Maks 7 pax',
    featureLeatherInterior: 'Brendshmëri lëkure',
    featureFreeWifi: 'Wi-Fi dhe ujë falas',
    feature2Suitcases: '2 valixhe',
    featureExecutiveComfort: 'Komoditet ekzekutiv',
    featureExtraLegroom: 'Hapësirë shtesë për këmbë',
    feature3Suitcases: '3 valixhe',
    featureFamiliesGroups: 'Ideale për familje dhe grupe',
    featureConferenceSeating: 'Ulje konference',
    feature7Suitcases: '7 valixhe',
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
    payStripe: 'Paguani në faqe me kartë (Stripe)',
    payStripeDesc: 'Do të çoheni në një faqe të sigurt Stripe për të paguar me kartë krediti ose debit.',
    payWithStripe: 'Paguani me Stripe',
    cardNumber: 'Numri i Kartës',
    expiryDate: 'Data e Skadimit',
    cvv: 'CVV',
    termsLabel: 'Pajtohem me Termat & Kushtet',
    privacyLabel: 'Pajtohem me Politikën e Privatësisë',
    cancellationLabel: 'Kam lexuar dhe pranoj politikën e anulimit',
    confirmBooking: 'Konfirmo Rezervimin',
    bookingSummary: 'Përmbledhja e Rezervimit',
    successMessage: 'Rezervimi juaj është konfirmuar!',
    bookingReference: 'Referenca e Rezervimit',
    redirecting: 'Duke ridrejtuar te pagesa...',
    acceptTermsError: 'Ju lutemi pranoni termat dhe politikën e anulimit',
    fillRequiredError: 'Ju lutemi plotësoni të gjitha fushat e kërkuara.',
    firstNameRequired: 'Emri është i detyrueshëm',
    lastNameRequired: 'Mbiemri është i detyrueshëm',
    emailRequired: 'Email është i detyrueshëm',
    emailInvalid: 'Adresa e emailit është e pavlefshme',
    phoneRequired: 'Numri i telefonit është i detyrueshëm',
    justDetails: 'Vetëm disa detaje të tjera për të konfirmuar rezervimin',
    payment: 'Pagesa',
    addOns: 'Shtesa',
    placeholderFirstName: 'Emri',
    placeholderLastName: 'Mbiemri',
    placeholderEmail: 'emri.mbiemri@shembull.com',
    placeholderPhone: '+41 79 123 4567',
    placeholderSpecialRequests: 'Kërkesa ose preferenca të veçanta...',
    specialRequestsOptional: '(Opsionale)',
    addOnVipName: 'Shërbim VIP',
    addOnVipDesc: 'Pritje në aeroport brenda terminalit (shoferi hyn në terminal për t\'ju marrë)',
    invoiceTransfer: 'Transfer',
    invoiceTotal: 'Totali',
    vehicleLabel: 'Mjeti',
    fromLabel: 'Nga',
    toLabel: 'Deri',
    secureStripe: 'Pagesë e sigurt me Stripe',
    emailReceipt: 'Faturë me email pas pagesës',
    termsAndPrivacy: 'Pajtohem me Termat & Kushtet dhe Politikën e Privatësisë',
  },
  success: {
    confirmingPayment: 'Duke konfirmuar pagesën tuaj...',
    couldNotConfirm: 'Nuk mundëm të konfirmojmë rezervimin tuaj.',
    returnHome: 'Kthehu në faqen kryesore',
    paymentComplete: 'Pagesa u konfirmua – rezervimi u konfirmua',
    confirmationSent: 'Një konfirmim dhe faturë u dërguan në email-in tuaj.',
    pickupAt: 'Marrja',
    bookingId: 'ID e rezervimit',
    addToCalendar: 'Shto në Google Calendar',
    contactWhatsApp: 'Na kontaktoni në WhatsApp',
    paidOnline: 'Paguar online',
    receiptSent: 'CHF {amount} e paguar me kartë. Fatura u dërgua në email.',
  },
  cancelBooking: {
    pageTitle: 'Anulo rezervimin tim',
    pageSubtitle: 'Vendosni referencën e rezervimit dhe email-in. Do të përpunojmë anulimin dhe rimbursimin sipas politikës sonë.',
    bookingReference: 'Referenca e rezervimit',
    email: 'Adresa e emailit',
    submit: 'Kërko anulim',
    successTitle: 'Kërkesa u pranua',
    successMessage: 'Kërkesa juaj për anulim u pranua. Do ta përpunojmë dhe do ju kontaktojmë për çdo rimbursim.',
    backHome: 'Kthehu në faqen kryesore',
    errorSending: 'Nuk u dërgua kërkesa. Ju lutemi provoni përsëri ose na kontaktoni me WhatsApp.',
    invalidEmail: 'Ju lutemi vendosni një adresë email të vlefshme.',
    refRequired: 'Ju lutemi vendosni referencën e rezervimit (p.sh. EL12345678).',
    needToCancelLink: 'Duhet të anuloni? Kërko anulim',
  },
  common: {
    loading: 'Duke u ngarkuar...',
    error: 'Ndodhi një gabim',
    success: 'Sukses!',
    passenger: 'Pasagjer',
    passengers: 'Pasagjerë',
    person: 'Person',
    people: 'Njerëz',
  },
  cancellationPolicy: {
    title: 'Politika e Anulimit',
    summary: 'Anulim falas deri 48 orë para marrjes',
    detail1: 'Anuloni falas nëse anuloni ≥48 orë para kohës së planifikuar të marrjes',
    detail2: 'Anulimet 24-48 orë para marrjes: Anulim falas (periudhë e mirë)',
    detail3: 'Anulimet <24 orë para marrjes: aplikohet tarifa 50% e anulimit',
    detail4: 'Për të anuluar, na kontaktoni me telefon ose email me referencën e rezervimit',
    detail5: 'Rimbursimet përpunohen brenda 5-7 ditëve pune',
  },
};

const de: Translations = {
  nav: {
    home: 'Start',
    about: 'Über uns',
    contact: 'Kontakt',
  },
  home: {
    hero: {
      title: 'Elegant Limo',
      subtitle: 'Premium Limousinenservice für anspruchsvolle Reisende',
    },
    form: {
      from: 'Abholort',
      to: 'Zielort',
      date: 'Datum',
      time: 'Uhrzeit',
      passengers: 'Passagiere',
      continue: 'Weiter',
      update: 'Aktualisieren',
      book: 'Buchen',
      pickupPlaceholder: 'Abholadresse eingeben',
      dropoffPlaceholder: 'Zieladresse eingeben',
    },
    validation: {
      requiredField: 'Dieses Feld ist erforderlich',
      invalidDate: 'Ungültiges Datum',
      pastDate: 'Datum darf nicht in der Vergangenheit liegen',
    },
  },
  summary: {
    pageTitle: 'Elegant Limo Schweiz',
    pageSubtitle: 'Buchung prüfen & Fahrzeug wählen',
    tripDetails: 'Fahrtdetails',
    pickup: 'Abholort',
    dropoff: 'Zielort',
    recalculate: 'Strecke & Preis neu berechnen',
    calculating: 'Berechne…',
    date: 'Datum',
    time: 'Uhrzeit',
    passengers: 'Passagiere',
    routeOverview: 'Streckenübersicht',
    distance: 'Distanz',
    estDuration: 'Geschätzte Dauer',
    estimatedPrice: 'Geschätzter Preis',
    chooseVehicle: 'Wählen Sie Ihr Fahrzeug',
    popular: 'Beliebt',
    paymentAndNotes: 'Zahlung & Notizen',
    payCardVehicle: 'Kreditkarte im Fahrzeug',
    payCardVehicleDesc: 'Zahlung im Fahrzeug direkt nach der Fahrt.',
    notesForChauffeur: 'Notizen für Ihren Chauffeur',
    notesPlaceholder: 'Kindersitze, Extra-Gepäck, Hotelname, etc.',
    back: 'Zurück',
    continueToCheckout: 'Zur Kasse',
    completeFormFirst: 'Bitte füllen Sie zuerst das Buchungsformular aus',
    chooseVehicleToast: 'Bitte wählen Sie ein Fahrzeug',
    routeUpdated: 'Strecke und Preis aktualisiert',
    recalcError: 'Strecke konnte nicht neu berechnet werden',
    enterBothAddresses: 'Bitte Abhol- und Zielort eingeben',
    selectAddressesToRecalc: 'Bitte wählen Sie Adressen aus den Vorschlägen, um die Strecke neu zu berechnen.',
    flightDetails: 'Flugdetails (optional)',
    flightNumberLabel: 'Flugnummer (falls Sie mit dem Flugzeug anreisen)',
    flightNumberPlaceholder: 'z.B. LX123, BA718',
    flightNumberHint: 'Dies hilft Ihrem Chauffeur, Ihre Ankunft zu verfolgen. Leer lassen, wenn Sie nicht fliegen.',
    badgeMax3Pax: 'Max 3 Pax',
    badgeMax7Pax: 'Max 7 Pax',
    featureLeatherInterior: 'Lederausstattung',
    featureFreeWifi: 'Kostenloses WLAN & Wasser',
    feature2Suitcases: '2 Koffer',
    featureExecutiveComfort: 'Business-Komfort',
    featureExtraLegroom: 'Extra Beinfreiheit',
    feature3Suitcases: '3 Koffer',
    featureFamiliesGroups: 'Ideal für Familien & Gruppen',
    featureConferenceSeating: 'Konferenzsitzanordnung',
    feature7Suitcases: '7 Koffer',
  },
  pricing: {
    title: 'Ihre Fahrtdetails',
    routeSummary: 'Streckenübersicht',
    basePrice: 'Grundpreis',
    addOns: 'Premium Extras',
    total: 'Gesamt',
    bookNow: 'Jetzt buchen',
    addOn: {
      champagne: 'Champagner-Service',
      champagneDesc: 'Dom Pérignon Champagner-Service',
      airportMeet: 'Flughafen Meet & Greet',
      airportMeetDesc: 'Persönliche Begrüssung am Flughafen',
      childSeat: 'Kindersitz',
      childSeatDesc: 'Premium Kindersitz',
      redCarpet: 'Roter Teppich',
      redCarpetDesc: 'Service mit rotem Teppich',
    },
  },
  checkout: {
    title: 'Reservation abschliessen',
    customerDetails: 'Kundendaten',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    phone: 'Telefonnummer',
    specialRequests: 'Besondere Wünsche',
    paymentMethod: 'Zahlungsart',
    payStripe: 'Online mit Karte bezahlen (Stripe)',
    payStripeDesc: 'Sie werden zur sicheren Stripe-Seite weitergeleitet. Nach der Zahlung erhalten Sie eine Quittung per E-Mail.',
    payWithStripe: 'Mit Stripe bezahlen',
    cardNumber: 'Kartennummer',
    expiryDate: 'Ablaufdatum',
    cvv: 'CVV',
    termsLabel: 'Ich akzeptiere die AGB',
    privacyLabel: 'Ich akzeptiere die Datenschutzrichtlinie',
    cancellationLabel: 'Ich habe die Stornierungsbedingungen gelesen und akzeptiert',
    confirmBooking: 'Reservation bestätigen',
    bookingSummary: 'Buchungsübersicht',
    successMessage: 'Ihre Buchung wurde bestätigt!',
    bookingReference: 'Buchungsnummer',
    redirecting: 'Weiterleitung zur Zahlung...',
    acceptTermsError: 'Bitte akzeptieren Sie die AGB und Stornierungsbedingungen',
    fillRequiredError: 'Bitte füllen Sie alle Pflichtfelder aus (Name, E-Mail, Telefon).',
    firstNameRequired: 'Vorname ist erforderlich',
    lastNameRequired: 'Nachname ist erforderlich',
    emailRequired: 'E-Mail ist erforderlich',
    emailInvalid: 'Ungültige E-Mail-Adresse',
    phoneRequired: 'Telefonnummer ist erforderlich',
    justDetails: 'Noch ein paar Angaben zur Bestätigung Ihrer Buchung',
    payment: 'Zahlung',
    addOns: 'Extras',
    placeholderFirstName: 'Max',
    placeholderLastName: 'Muster',
    placeholderEmail: 'max.muster@beispiel.ch',
    placeholderPhone: '+41 79 123 4567',
    placeholderSpecialRequests: 'Besondere Wünsche oder Präferenzen...',
    specialRequestsOptional: '(Optional)',
    addOnVipName: 'VIP-Service',
    addOnVipDesc: 'Flughafen-Begrüssung im Terminal (Chauffeur holt Sie im Terminal ab)',
    invoiceTransfer: 'Transfer',
    invoiceTotal: 'Gesamt',
    vehicleLabel: 'Fahrzeug',
    fromLabel: 'Von',
    toLabel: 'Nach',
    secureStripe: 'Sichere Zahlung mit Stripe',
    emailReceipt: 'E-Mail-Belehrung nach der Zahlung',
    termsAndPrivacy: 'Ich akzeptiere die AGB und die Datenschutzrichtlinie',
  },
  success: {
    confirmingPayment: 'Zahlung wird bestätigt...',
    couldNotConfirm: 'Wir konnten Ihre Buchung nicht bestätigen.',
    returnHome: 'Zurück zur Startseite',
    paymentComplete: 'Zahlung abgeschlossen – Buchung bestätigt',
    confirmationSent: 'Bestätigung und Beleg wurden an Ihre E-Mail gesendet.',
    pickupAt: 'Abholung',
    bookingId: 'Buchungsnummer',
    addToCalendar: 'Zu Google Kalender hinzufügen',
    contactWhatsApp: 'Kontakt per WhatsApp',
    paidOnline: 'Online bezahlt',
    receiptSent: 'CHF {amount} mit Karte bezahlt. Beleg wurde per E-Mail gesendet.',
  },
  cancelBooking: {
    pageTitle: 'Buchung stornieren',
    pageSubtitle: 'Geben Sie Ihre Buchungsnummer und E-Mail ein. Wir bearbeiten Ihre Stornierung und Erstattung gemäss unserer Richtlinie.',
    bookingReference: 'Buchungsnummer',
    email: 'E-Mail-Adresse',
    submit: 'Stornierung anfragen',
    successTitle: 'Anfrage eingegangen',
    successMessage: 'Wir haben Ihre Stornierungsanfrage erhalten. Wir bearbeiten sie und melden uns bezüglich einer Erstattung.',
    backHome: 'Zurück zur Startseite',
    errorSending: 'Anfrage konnte nicht gesendet werden. Bitte erneut versuchen oder uns per WhatsApp kontaktieren.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    refRequired: 'Bitte geben Sie Ihre Buchungsnummer ein (z. B. EL12345678).',
    needToCancelLink: 'Stornierung nötig? Stornierung anfragen',
  },
  common: {
    loading: 'Wird geladen...',
    error: 'Ein Fehler ist aufgetreten',
    success: 'Erfolg!',
    passenger: 'Passagier',
    passengers: 'Passagiere',
    person: 'Person',
    people: 'Personen',
  },
  cancellationPolicy: {
    title: 'Stornierungsbedingungen',
    summary: 'Kostenlose Stornierung bis 48 Stunden vor Abholung',
    detail1: 'Kostenlose Stornierung, wenn Sie ≥48 Stunden vor der geplanten Abholzeit stornieren',
    detail2: 'Stornierungen 24–48 Stunden vor Abholung: Kostenlose Stornierung (Karenzzeit)',
    detail3: 'Stornierungen <24 Stunden vor Abholung: 50% Stornierungsgebühr',
    detail4: 'Zum Stornieren kontaktieren Sie uns per Telefon oder E-Mail mit Ihrer Buchungsnummer',
    detail5: 'Erstattungen werden innerhalb von 5–7 Werktagen bearbeitet',
  },
};

export const translations: Record<Language, Translations> = {
  en,
  al,
  de,
};

export function useTranslations(lang: Language = 'en'): Translations {
  return translations[lang];
}
