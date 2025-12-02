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
    <Card className="flex flex-col overflow-hidden border">
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
    return query(collection(firestore, 'services'), orderBy('title', 'asc'), limit(3));
  }, [firestore]);

  const { data: displayedServices, isLoading } = useCollection<Service>(servicesQuery);

  return (
    <section id="services" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Our Featured Services</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our curated selection of top-tier beauty treatments, handled by experts for optimal results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && Array.from({length: 3}).map((_, i) => <ServiceCardSkeleton key={i} />)}

          {!isLoading && displayedServices?.map((service) => (
            <Card key={service.id} className="flex flex-col overflow-hidden border transition-shadow duration-300">
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
                <CardTitle className="font-bold text-xl mb-2">{service.title}</CardTitle>
                <p className="text-muted-foreground line-clamp-3">{service.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                 <Link href="/services" className="text-sm font-medium text-primary hover:underline">
                    Learn more <ArrowRight className="ml-1 h-4 w-4 inline" />
                  </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
                <Link href="/services">View All Services</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
