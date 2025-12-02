import { PlaceHolderImages } from "./placeholder-images";

const findImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    // Return a default or throw an error
    const defaultImage = PlaceHolderImages[0];
    return defaultImage || { imageUrl: 'https://picsum.photos/seed/error/200/300', imageHint: 'error' };
  }
  return image;
};

// This data is now managed in Firestore. Keeping the file for other static data.
export const services = [];

export const testimonials = [
  {
    name: "Rina S.",
    rating: 5,
    comment: "Pelayanannya luar biasa! Kulit saya jadi jauh lebih cerah dan sehat setelah perawatan di Aurora. Pasti akan kembali lagi!",
    image: findImage('testimonial-1'),
  },
  {
    name: "Dewi K.",
    rating: 5,
    comment: "Dokter dan stafnya sangat profesional dan ramah. Hasil treatment laser-nya sangat memuaskan. Terima kasih Aurora Beauty Clinic!",
    image: findImage('testimonial-2'),
  },
  {
    name: "Lina M.",
    rating: 5,
    comment: "Tempatnya nyaman dan mewah. Saya merasa sangat rileks selama perawatan. Recommended banget untuk yang mau me-time!",
    image: findImage('testimonial-3'),
  },
];

export const galleryImages = [
  findImage('gallery-1'),
  findImage('gallery-2'),
  findImage('gallery-3'),
  findImage('gallery-4'),
  findImage('gallery-5'),
  findImage('gallery-6'),
  findImage('gallery-7'),
  findImage('gallery-8'),
  findImage('gallery-9'),
];


// This data is now managed in Firestore.
export const doctors = [];
