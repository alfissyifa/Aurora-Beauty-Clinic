'use client';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type AboutContent = {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
}

type Doctor = {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    image: string;
    imageHint?: string;
}

const defaultAboutContent = {
    title: 'Tentang Kami',
    subtitle: 'Ketahui lebih lanjut tentang cerita, misi, dan tim kami.',
    paragraph1: 'Didirikan atas dasar hasrat untuk kecantikan dan kepercayaan diri, Aurora Beauty Clinic hadir sebagai destinasi premium untuk perawatan kulit Anda. Kami percaya bahwa setiap individu berhak merasa nyaman dan percaya diri dengan kulit yang sehat dan terawat.',
    paragraph2: 'Dengan menggabungkan teknologi estetika terdepan dan keahlian dari tim profesional kami, kami berkomitmen untuk memberikan hasil yang tidak hanya terlihat, tetapi juga terasa. Kami menawarkan rangkaian perawatan yang dirancang khusus untuk memenuhi setiap kebutuhan unik kulit Anda, mulai dari peremajaan hingga solusi masalah kulit yang kompleks.',
};

const DoctorSkeleton = () => (
    <Card className="border-none bg-transparent shadow-none text-center">
        <CardContent className="p-0">
            <Skeleton className="aspect-square w-full max-w-xs mx-auto rounded-full mb-6" />
            <Skeleton className="h-9 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6 mx-auto" />
        </CardContent>
    </Card>
);

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about-clinic');
    const firestore = useFirestore();
    
    const aboutContentRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'pages', 'about');
    }, [firestore]);

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'doctors'), orderBy('name', 'asc'));
    }, [firestore]);

    const { data: content, isLoading: isContentLoading } = useDoc<AboutContent>(aboutContentRef);
    const { data: doctors, isLoading: areDoctorsLoading } = useCollection<Doctor>(doctorsQuery);

    const displayContent = content || defaultAboutContent;

    return (
    <div className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
            {isContentLoading ? (
                <>
                    <Skeleton className="h-14 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-7 w-1/2 mx-auto" />
                </>
            ) : (
                <>
                    <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">{displayContent.title}</h1>
                    <p className="mt-4 text-xl text-muted-foreground">{displayContent.subtitle}</p>
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
            {isContentLoading ? (
                <>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6 mx-auto" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-6 w-4/5 mx-auto" />
                </>
            ) : (
                <>
                    <p>{displayContent.paragraph1}</p>
                    <p>{displayContent.paragraph2}</p>
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
            {areDoctorsLoading && (
                <>
                    <DoctorSkeleton />
                    <DoctorSkeleton />
                </>
            )}
            {!areDoctorsLoading && doctors?.map((doctor) => (
              <Card key={doctor.id} className="border-none bg-transparent shadow-none text-center">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full max-w-xs mx-auto rounded-full overflow-hidden mb-6 shadow-lg">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                      data-ai-hint={doctor.imageHint}
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
