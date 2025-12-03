'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
    <path d="M16.75 13.96c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.13-.56.13-.16.26-.64.81-.79.98-.14.16-.29.18-.54.05-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.74-.15-.26-.02-.4.11-.53.12-.12.26-.29.39-.44.13-.14.18-.25.26-.41.08-.16.04-.3-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.55-.42-.14,0-.3,0-.46,0-.16,0-.41.06-.63.29-.22.23-.85.83-1.02,2.02-.17,1.19.06,2.37.76,3.39,1.13,1.61,2.5,2.91,5.22,4.36,2.7,1.45,3.35,1.56,3.84,1.52.49-.04,1.48-.6,1.69-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18.4c-4.64 0-8.4-3.76-8.4-8.4 0-4.64 3.76-8.4 8.4-8.4 4.64 0 8.4 3.76 8.4 8.4 0 4.64-3.76 8.4-8.4 8.4z" />
  </svg>
);

type ContactInfo = {
  phone: string;
};

const defaultContactInfo: ContactInfo = {
  phone: '(021) 1234 5678', // Fallback number
};

export default function WhatsappCTA() {
  const firestore = useFirestore();

  const contactInfoRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'pages', 'contact');
  }, [firestore]);

  const { data: contactInfo } = useDoc<ContactInfo>(contactInfoRef);

  const displayContactInfo = contactInfo || defaultContactInfo;

  const formatWhatsAppUrl = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const whatsappNumber = formatWhatsAppUrl(displayContactInfo.phone);
  const message =
    'Halo Aurora Beauty Clinic, saya ingin bertanya tentang layanan Anda.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-green-500 hover:bg-green-600 text-white"
      aria-label="Chat on WhatsApp"
      style={{
        backgroundColor: '#25D366',
      }}
    >
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
      </Link>
    </Button>
  );
}
