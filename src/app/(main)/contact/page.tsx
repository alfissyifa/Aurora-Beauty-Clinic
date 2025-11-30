import Image from "next/image";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import BookingForm from "@/components/booking-form";

export default function ContactPage() {
    const mapImage = PlaceHolderImages.find(img => img.id === 'contact-map');

  const contactDetails = [
    {
      icon: MapPin,
      title: "Alamat Kami",
      value: "Jl. Cantik Raya No. 123, Jakarta Selatan, 12345, Indonesia",
    },
    {
      icon: Phone,
      title: "Telepon",
      value: "(021) 1234 5678",
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@aurorabeauty.com",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      value: "Senin - Sabtu: 09:00 - 20:00",
    },
  ];
  
  return (
    <div className="bg-background">
        <div className="container py-20 md:py-28">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">Hubungi Kami</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Kami siap membantu Anda. Jangan ragu untuk menghubungi kami untuk pertanyaan atau penjadwalan.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-1 space-y-8">
                    {contactDetails.map(detail => (
                        <Card key={detail.title} className="bg-card shadow-lg">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <detail.icon className="h-6 w-6 text-accent" />
                                <CardTitle className="font-headline text-xl">{detail.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{detail.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Lokasi Kami</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mapImage && (
                                <div className="relative aspect-video w-full rounded-md overflow-hidden">
                                <Image
                                    src={mapImage.imageUrl}
                                    alt="Peta lokasi klinik"
                                    fill
                                    className="object-cover"
                                    data-ai-hint={mapImage.imageHint}
                                />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div id="booking">
              <BookingForm />
            </div>

        </div>
    </div>
  );
}
