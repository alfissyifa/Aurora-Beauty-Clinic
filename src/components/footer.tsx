'use client';

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const navLinks = [
  { href: "/services", label: "Layanan" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak" },
];

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
};

const defaultContactInfo: ContactInfo = {
    address: "Jl. Cantik Raya No. 123, Jakarta",
    email: "info@aurorabeauty.com",
    phone: "(021) 1234 5678",
};

export default function Footer() {
  const firestore = useFirestore();
  const contactInfoRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'pages', 'contact');
  }, [firestore]);

  const { data: contactInfo } = useDoc<ContactInfo>(contactInfoRef);
  const displayContact = contactInfo || defaultContactInfo;

  return (
    <footer className="bg-black text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-3xl mb-4">
              <span>Aurora</span>
            </Link>
            <p className="text-white/70 max-w-md">
              A premium beauty clinic dedicated to helping you achieve confidence through healthy, well-cared-for skin.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/admin/login" className="text-white/70 hover:text-white transition-colors">
                    Admin Login
                  </Link>
                </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="text-white/70 space-y-2">
                <p>{displayContact.address}</p>
                <p>{displayContact.email}</p>
                <p>{displayContact.phone}</p>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-white/70 hover:text-primary transition-colors"><Facebook/></Link>
              <Link href="#" className="text-white/70 hover:text-primary transition-colors"><Instagram/></Link>
              <Link href="#" className="text-white/70 hover:text-primary transition-colors"><Twitter/></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/50">
          <p>&copy; {new Date().getFullYear()} Aurora Beauty Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
