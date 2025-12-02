'use client';
import Image from "next/image";
import { doctors } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type AboutContent = {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
}

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about-clinic');
    const firestore = useFirestore();
    const aboutContentRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'pages', 'about');
    }, [firestore]);

    const { data: content, isLoading } = useDoc<AboutContent>(aboutContentRef);

    return (
    <div className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
            {isLoading ? (
                <>
                    <Skeleton className="h-14 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-7 w-1/2 mx-auto" />
                </>
            ) : (
                <>
                    <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">{content?.title || 'Tentang Kami'}</h1>
                    <p className="mt-4 text-xl text-muted-foreground">{content?.subtitle || 'Ketahui lebih lanjut tentang cerita, misi, dan tim kami.'}</p>
                </>
            )}
        </div>

        {aboutImage && (
            <div className="my-16 relative aspect-video max-h-[500px] w-full mx-auto rounded-lg overflow-hidden shadow-lg">
                <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                fill
                className="object-cover"
                data-ai-hint={aboutImage.imageHint}
                />
            </div>
        )}

        <div className="max-w-4xl mx-auto text-center text-lg text-muted-foreground space-y-6">
            {isLoading ? (
                <>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6 mx-auto" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-6 w-4/5 mx-auto" />
                </>
            ) : (
                <>
                    <p>{content?.paragraph1}</p>
                    <p>{content?.paragraph2}</p>
                </>
            )}
        </div>

        <div className="mt-20 md:mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Tim Ahli Kami</h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Kenali para profesional di balik kesuksesan perawatan kami.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {doctors.map((doctor) => (
              <Card key={doctor.name} className="border-none bg-transparent shadow-none text-center">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full max-w-xs mx-auto rounded-full overflow-hidden mb-6 shadow-lg">
                    <Image
                      src={doctor.image.imageUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                      data-ai-hint={doctor.image.imageHint}
                    />
                  </div>
                  <h3 className="font-headline text-3xl font-bold">{doctor.name}</h3>
                  <p className="text-accent font-semibold text-lg mt-1">{doctor.specialty}</p>
                  <p className="text-muted-foreground mt-4">{doctor.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
