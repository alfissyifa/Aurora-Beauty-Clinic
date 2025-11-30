import Image from "next/image";
import { galleryImages } from "@/lib/data";

export default function GallerySection() {
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
          {galleryImages.map((image, index) => (
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
        </div>
      </div>
    </section>
  );
}
