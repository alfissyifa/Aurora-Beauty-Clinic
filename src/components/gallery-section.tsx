
'use client';
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type GalleryImage = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint?: string;
}

const GalleryImageSkeleton = () => (
    <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
        <Skeleton className="w-full h-full" />
    </div>
);

export default function GallerySection() {
  const firestore = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'));
  }, [firestore]);

  const { data: galleryImages, isLoading } = useCollection<GalleryImage>(galleryQuery);

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Galeri Aurora</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lihat lebih dekat suasana klinik kami dan hasil menakjubkan dari perawatan kami.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading && Array.from({length: 9}).map((_, index) => <GalleryImageSkeleton key={index} />)}
          {!isLoading && galleryImages?.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-lg group"
            >
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
                data-ai-hint={image.imageHint}
              />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
            </div>
          ))}
          {!isLoading && galleryImages?.length === 0 && (
             <div className="col-span-full text-center py-12 text-muted-foreground">
                Galeri masih kosong.
             </div>
          )}
        </div>
      </div>
    </section>
  );
}

    