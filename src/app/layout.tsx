import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import WhatsappCTA from '@/components/whatsapp-cta';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Aurora Beauty Clinic',
  description: 'Cantik itu Percaya Diri',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased bg-background ")}>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsappCTA />
        <Toaster />
      </body>
    </html>
  );
}
