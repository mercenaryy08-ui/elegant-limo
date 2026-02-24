// Booking Policies - Cancellation, Delays, Payment

/**
 * Cancellation policy calculation
 */
export interface CancellationRefund {
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  reason: string;
}

/**
 * Calculate cancellation refund based on time until pickup
 */
export function calculateCancellationRefund(
  totalAmount: number,
  cancellationTime: Date,
  pickupDateTime: Date
): CancellationRefund {
  const hoursUntilPickup = (pickupDateTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);

  // Free cancellation if ≥48 hours before pickup
  if (hoursUntilPickup >= 48) {
    return {
      refundPercentage: 100,
      refundAmount: totalAmount,
      cancellationFee: 0,
      reason: 'Free cancellation (≥48 hours before pickup)',
    };
  }

  // 50% charge if <24 hours before pickup
  if (hoursUntilPickup < 24) {
    return {
      refundPercentage: 50,
      refundAmount: totalAmount * 0.5,
      cancellationFee: totalAmount * 0.5,
      reason: 'Late cancellation (<24 hours): 50% cancellation fee applies',
    };
  }

  // Between 24-48 hours: free cancellation (grace period)
  return {
    refundPercentage: 100,
    refundAmount: totalAmount,
    cancellationFee: 0,
    reason: 'Free cancellation (24-48 hours before pickup)',
  };
}

/**
 * Flight delay surcharge configuration
 */
export interface FlightDelayConfig {
  enabled: boolean;
  freeWaitingMinutes: number; // Default: 60
  chargeType: 'fixed' | 'per-interval';
  fixedAmount?: number; // CHF, if chargeType is 'fixed'
  perIntervalAmount?: number; // CHF per interval
  intervalMinutes?: number; // Default: 30 minutes
}

// Default delay configuration (admin can override)
export const DEFAULT_DELAY_CONFIG: FlightDelayConfig = {
  enabled: true,
  freeWaitingMinutes: 60,
  chargeType: 'per-interval',
  perIntervalAmount: 50,
  intervalMinutes: 30,
};

/**
 * Calculate flight delay surcharge
 */
export function calculateFlightDelaySurcharge(
  delayMinutes: number,
  config: FlightDelayConfig = DEFAULT_DELAY_CONFIG
): {
  surcharge: number;
  reason: string;
  intervals?: number;
} {
  if (!config.enabled) {
    return { surcharge: 0, reason: 'Delay charges disabled' };
  }

  const excessMinutes = delayMinutes - config.freeWaitingMinutes;

  if (excessMinutes <= 0) {
    return {
      surcharge: 0,
      reason: `Free waiting time (${config.freeWaitingMinutes} minutes)`,
    };
  }

  if (config.chargeType === 'fixed') {
    return {
      surcharge: config.fixedAmount || 0,
      reason: `Fixed delay charge for ${delayMinutes} minutes delay`,
    };
  }

  // Per-interval charging
  const intervals = Math.ceil(excessMinutes / (config.intervalMinutes || 30));
  const surcharge = intervals * (config.perIntervalAmount || 0);

  return {
    surcharge,
    reason: `Delay charge: ${intervals} × ${config.intervalMinutes} min intervals`,
    intervals,
  };
}

/**
 * Payment policy text
 */
export const PAYMENT_POLICY = {
  method: 'Pay on website (Stripe)',
  description: 'Payment by card on our website via Stripe. Receipt sent by email.',
  details: [
    'Pay securely by credit or debit card on the checkout page',
    'Powered by Stripe – all major cards accepted (Visa, Mastercard, American Express)',
    'Email receipt sent after payment',
    'No payment on the vehicle – full payment online',
  ],
  noCash: true,
  noUpfrontPayment: true,
};

/**
 * Cancellation policy text
 */
export const CANCELLATION_POLICY = {
  title: 'Cancellation Policy',
  summary: 'Free cancellation up to 48 hours before pickup',
  details: [
    'Cancel free of charge if you cancel ≥48 hours before your scheduled pickup time',
    'Cancellations between 24-48 hours before pickup: Free cancellation (grace period)',
    'Cancellations <24 hours before pickup: 50% cancellation fee applies',
    'To cancel, contact us by phone or email with your booking reference',
    'Refunds are processed within 5-7 business days',
  ],
};

/**
 * Flight delay policy text
 */
export const FLIGHT_DELAY_POLICY = {
  title: 'Flight Delay Policy',
  summary: 'First 60 minutes of delay are free',
  details: [
    'We track your flight and adjust pickup time automatically',
    'First 60 minutes of delay: No additional charge',
    'After 60 minutes: Delay surcharge applies',
    'Delay charge: CHF 50 per 30-minute interval (or part thereof)',
    'You will be notified of any delay charges before confirming',
  ],
};

/**
 * Terms and conditions summary
 */
export const TERMS_SUMMARY = {
  title: 'Booking Terms',
  points: [
    'Bookings require at least 2 hours advance notice',
    'Payment by card to driver (cash not accepted)',
    'Free cancellation up to 48 hours before pickup',
    '50% cancellation fee if cancelled less than 24 hours before pickup',
    'Flight delays: First 60 minutes free, then CHF 50 per 30 minutes',
    'Passenger count must match vehicle capacity',
    'Additional stops may incur extra charges',
    'Smoking is not permitted in any vehicle',
  ],
};

/**
 * Generate invoice line items
 */
export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  type: 'base' | 'addon' | 'fee' | 'discount' | 'total';
}

export function generateInvoiceLineItems(params: {
  basePrice: number;
  basePriceDescription: string;
  addOns?: { name: string; price: number }[];
  delaySurcharge?: number;
  discountAmount?: number;
  discountReason?: string;
}): InvoiceLineItem[] {
  const { basePrice, basePriceDescription, addOns = [], delaySurcharge, discountAmount, discountReason } =
    params;

  const items: InvoiceLineItem[] = [];

  // Base price
  items.push({
    description: basePriceDescription,
    amount: basePrice,
    type: 'base',
  });

  // Add-ons
  addOns.forEach((addon) => {
    items.push({
      description: addon.name,
      quantity: 1,
      unitPrice: addon.price,
      amount: addon.price,
      type: 'addon',
    });
  });

  // Delay surcharge
  if (delaySurcharge && delaySurcharge > 0) {
    items.push({
      description: 'Flight Delay Surcharge',
      amount: delaySurcharge,
      type: 'fee',
    });
  }

  // Discount
  if (discountAmount && discountAmount > 0) {
    items.push({
      description: discountReason || 'Discount',
      amount: -discountAmount,
      type: 'discount',
    });
  }

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  items.push({
    description: 'Total',
    amount: total,
    type: 'total',
  });

  return items;
}

/**
 * Format invoice as text
 */
export function formatInvoiceText(items: InvoiceLineItem[]): string {
  let text = '=== INVOICE ===\n\n';

  items.forEach((item) => {
    if (item.type === 'total') {
      text += '\n' + '─'.repeat(40) + '\n';
    }

    const amountStr = `${item.amount >= 0 ? '' : '-'}${Math.abs(item.amount).toFixed(2)} CHF`;
    const padding = 40 - item.description.length - amountStr.length;
    text += `${item.description}${' '.repeat(Math.max(padding, 1))}${amountStr}\n`;
  });

  return text;
}
