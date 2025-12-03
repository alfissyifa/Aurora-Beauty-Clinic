'use client';
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import BookingForm from "@/components/booking-form";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type ContactInfo = {
    address: string;
    phone: string;
    email: string;
    hours: string;
}

const defaultContactInfo: ContactInfo = {
    address: "Jl. Cantik Raya No. 123, Jakarta Selatan, 12345, Indonesia",
    phone: "(021) 1234 5678",
    email: "info@aurorabeauty.com",
    hours: "Senin - Sabtu: 09:00 - 20:00",
};

export default function ContactPage() {
    const mapImage = PlaceHolderImages.find(img => img.id === 'contact-map');
    const firestore = useFirestore();

    const contactInfoRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'pages', 'contact');
    }, [firestore]);

    const { data: contactInfo, isLoading } = useDoc<ContactInfo>(contactInfoRef);
    
    const displayContactInfo = contactInfo || defaultContactInfo;

    const formatWhatsAppUrl = (phone: string) => {
        // Remove non-numeric characters
        let cleaned = phone.replace(/\D/g, '');
        // Replace leading 0 with 62 if it exists
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        }
        // If it doesn't start with 62, prepend it (handles cases like 812... directly)
        else if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned;
        }
        return `https://wa.me/${cleaned}`;
    };

    const contactDetails = [
        { icon: MapPin, title: "Alamat Kami", value: displayContactInfo.address },
        { icon: Phone, title: "Telepon / WA", value: displayContactInfo.phone, isPhone: true },
        { icon: Mail, title: "Email", value: displayContactInfo.email },
        { icon: Clock, title: "Jam Operasional", value: displayContactInfo.hours },
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
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="bg-card shadow-lg">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-5 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        contactDetails.map(detail => (
                            <Card key={detail.title} className="bg-card shadow-lg">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                    <detail.icon className="h-6 w-6 text-accent" />
                                    <CardTitle className="font-headline text-xl">{detail.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     {detail.isPhone ? (
                                        <Link href={formatWhatsAppUrl(detail.value)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {detail.value}
                                        </Link>
                                    ) : (
                                        <p className="text-muted-foreground">{detail.value}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
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
