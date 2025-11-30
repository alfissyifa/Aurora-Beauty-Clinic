'use client';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type Service = {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    imageHint: string;
}

const ServiceCardSkeleton = ({ index }: { index: number }) => (
    <Card className="overflow-hidden shadow-lg border-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className={`relative aspect-video lg:aspect-[4/3] ${index % 2 !== 0 ? 'lg:order-last' : ''}`}>
                <Skeleton className="w-full h-full" />
            </div>
            <div className="p-8">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-1/2 mb-6" />
                <Skeleton className="h-12 w-32" />
            </div>
        </div>
    </Card>
);


export default function ServicesPage() {
  const firestore = useFirestore();
  
  const servicesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'services'), orderBy('title', 'asc'));
  }, [firestore]);

  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">Layanan Kami</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Jelajahi rangkaian perawatan premium kami yang dirancang untuk kecantikan dan kesehatan kulit Anda.
          </p>
        </div>

        <div className="space-y-16">
          {isLoading && Array.from({ length: 3 }).map((_, index) => <ServiceCardSkeleton key={index} index={index} />)}
          
          {!isLoading && services?.map((service, index) => (
            <Card key={service.id} className="overflow-hidden shadow-lg border-none">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`}>
                <div className={`relative aspect-video lg:aspect-[4/3] ${index % 2 !== 0 ? 'lg:order-last' : ''}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    data-ai-hint={service.imageHint}
                  />
                </div>
                <div className="p-8">
                  <h2 className="font-headline text-4xl font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground text-lg mb-4">{service.description}</p>
                  <p className="text-2xl font-bold text-accent mb-6">{formatPrice(service.price)}</p>
                  <Button asChild size="lg">
                    <Link href="/#booking">Book Now</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
