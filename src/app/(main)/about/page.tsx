import Image from "next/image";
import { doctors } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(img => img.id === 'about-clinic');

    return (
    <div className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">Tentang Aurora Beauty Clinic</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Lebih dari sekadar klinik, kami adalah partner perjalanan kecantikan Anda.
          </p>
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
            <p>
            Didirikan atas dasar hasrat untuk kecantikan dan ilmu pengetahuan, Aurora Beauty Clinic hadir untuk memberikan pengalaman perawatan estetika yang tak tertandingi. Kami percaya bahwa setiap individu memiliki kecantikan unik yang layak untuk dirayakan dan dirawat.
            </p>
            <p>
            Dengan menggabungkan teknologi terkini, produk berkualitas tinggi, dan sentuhan ahli dari para profesional kami, kami berkomitmen untuk memberikan hasil yang tidak hanya terlihat indah tetapi juga terasa sehat. Misi kami adalah memberdayakan Anda dengan kepercayaan diri yang bersinar dari dalam.
            </p>
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
