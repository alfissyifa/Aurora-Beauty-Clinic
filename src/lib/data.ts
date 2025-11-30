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


export const doctors = [
  {
    name: "Dr. Evelyn Reed, M.D.",
    specialty: "Dermatologist & Aesthetic Specialist",
    bio: "Dr. Evelyn Reed adalah seorang spesialis kulit dan estetika dengan pengalaman lebih dari 10 tahun. Beliau lulusan terbaik dari universitas ternama dan aktif mengikuti perkembangan terbaru di dunia estetika untuk memberikan hasil terbaik bagi pasiennya.",
    image: findImage('doctor-1'),
  },
  {
    name: "Dr. Sofia Chen, M.Sc.",
    specialty: "Anti-Aging & Wellness Expert",
    bio: "Dr. Sofia Chen memfokuskan praktiknya pada perawatan anti-penuaan dan kesehatan kulit secara holistik. Dengan pendekatan personal, beliau merancang program perawatan yang sesuai dengan kebutuhan unik setiap individu untuk mencapai kecantikan yang abadi.",
    image: findImage('doctor-2'),
  },
];
