import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsappCTA from '@/components/whatsapp-cta';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsappCTA />
    </>
  );
}
