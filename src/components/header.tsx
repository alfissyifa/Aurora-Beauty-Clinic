"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Layanan" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-black text-white">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <span>Aurora</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-white/80",
                pathname === link.href ? "text-white" : "text-white/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
           <Button asChild>
            <Link href="/#booking">Book Konsultasi</Link>
          </Button>
        </div>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-black">
          <nav className="container flex flex-col items-center gap-6 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-lg transition-colors hover:text-white/80",
                  pathname === link.href ? "text-white font-semibold" : "text-white/70"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
             <Button asChild>
              <Link href="/#booking" onClick={() => setIsMenuOpen(false)}>Book Konsultasi</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
