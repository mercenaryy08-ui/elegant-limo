import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER || '38348263151';
const DEFAULT_MESSAGE = 'Hi, I\'d like to book a transfer with Elegant Limo.';

export function FloatingWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
