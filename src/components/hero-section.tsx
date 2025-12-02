import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold drop-shadow-lg mb-4 animate-fade-in-down">
          Your Beauty Destination
        </h1>
        <p className="max-w-2xl text-lg md:text-xl mb-8 drop-shadow-md animate-fade-in-up">
          Discover the best version of yourself with our premium treatments.
        </p>
        <Button asChild size="lg" className="animate-fade-in-up animation-delay-300">
          <Link href="#booking">Book a Free Consultation</Link>
        </Button>
      </div>
    </section>
  );
}
