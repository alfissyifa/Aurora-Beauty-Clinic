import HeroSection from '@/components/hero-section';
import ServicesSection from '@/components/services-section';
import TestimonialsSection from '@/components/testimonials-section';
import GallerySection from '@/components/gallery-section';
import BookingSection from '@/components/booking-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <GallerySection />
      <BookingSection />
    </>
  );
}
