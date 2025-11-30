import BookingForm from "./booking-form";

export default function BookingSection() {
  return (
    <section id="booking" className="py-20 md:py-32 bg-secondary/50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-lg">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Jadwalkan Konsultasi Anda</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ambil langkah pertama menuju kulit impian Anda. Isi formulir di samping untuk menjadwalkan sesi konsultasi gratis dengan salah satu ahli estetika kami.
            </p>
            <p className="mt-4 text-muted-foreground">
              Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal.
            </p>
          </div>
          <div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
