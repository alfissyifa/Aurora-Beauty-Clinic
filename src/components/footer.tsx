import Link from "next/link";
import { Sparkles, Facebook, Instagram, Twitter } from "lucide-react";

const navLinks = [
  { href: "/services", label: "Layanan" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak" },
];

export default function Footer() {
  return (
    <footer className="bg-secondary/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-3xl text-foreground mb-4">
              <Sparkles className="h-7 w-7 text-accent" />
              <span>Aurora Beauty Clinic</span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Klinik kecantikan premium yang didedikasikan untuk membantu Anda mencapai kepercayaan diri melalui kulit yang sehat dan terawat.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Navigasi</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Admin Login
                  </Link>
                </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Hubungi Kami</h3>
            <div className="text-muted-foreground space-y-2">
                <p>Jl. Cantik Raya No. 123, Jakarta</p>
                <p>info@aurorabeauty.com</p>
                <p>(021) 1234 5678</p>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Facebook/></Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Instagram/></Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Twitter/></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Aurora Beauty Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
