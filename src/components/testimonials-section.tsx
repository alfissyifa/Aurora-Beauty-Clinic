"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/data";
import { Star } from "lucide-react";

const Rating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
      />
    ))}
  </div>
);

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Apa Kata Pelanggan Kami</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Kepercayaan dan kepuasan Anda adalah prioritas utama kami.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full flex flex-col justify-between shadow-lg">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                        <Image
                          src={testimonial.image.imageUrl}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                           data-ai-hint={testimonial.image.imageHint}
                        />
                      </div>
                      <h3 className="font-bold text-xl mb-1">{testimonial.name}</h3>
                      <Rating rating={testimonial.rating} />
                      <p className="text-muted-foreground mt-4 italic">
                        &ldquo;{testimonial.comment}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
