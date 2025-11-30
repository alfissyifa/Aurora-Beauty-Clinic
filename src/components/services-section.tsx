'use client';
import Image from "next/image";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Service = {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    imageHint: string;
}

const ServiceCardSkeleton = () => (
    <Card className="flex flex-col overflow-hidden shadow-lg">
        <CardHeader className="p-0">
            <Skeleton className="h-60 w-full" />
        </CardHeader>
        <CardContent className="flex-grow p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-6 pt-0">
            <Skeleton className="h-5 w-28" />
        </CardFooter>
    </Card>
);


export default function ServicesSection() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query for the first 3 services, ordered by title
    return query(collection(firestore, 'services'), orderBy('title', 'asc'), limit(3));
  }, [firestore]);

  const { data: displayedServices, isLoading } = useCollection<Service>(servicesQuery);

  return (
    <section id="services" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Layanan Unggulan Kami</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Kami menyediakan berbagai perawatan kecantikan terbaik yang ditangani oleh para ahli untuk hasil yang optimal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && Array.from({length: 3}).map((_, i) => <ServiceCardSkeleton key={i} />)}

          {!isLoading && displayedServices?.map((service) => (
            <Card key={service.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative h-60 w-full">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={service.imageHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <CardTitle className="font-headline text-2xl mb-2">{service.title}</CardTitle>
                <p className="text-muted-foreground line-clamp-3">{service.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button variant="link" asChild className="p-0 h-auto text-accent">
                  <Link href="/services">
                    Pelajari lebih lanjut <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
            <Button asChild size="lg">
                <Link href="/services">Lihat Semua Layanan</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
