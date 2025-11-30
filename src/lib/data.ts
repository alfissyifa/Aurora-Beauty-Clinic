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

export const services = [
  {
    title: "Facial Glow",
    description: "A comprehensive facial treatment to cleanse, exfoliate, and nourish the skin, promoting a clear, well-hydrated complexion and can help your skin look younger.",
    price: 500000,
    image: findImage('service-facial'),
  },
  {
    title: "Laser Treatment",
    description: "Advanced laser technology to address various skin concerns such as pigmentation, scars, and signs of aging, revealing smoother and more even-toned skin.",
    price: 1500000,
    image: findImage('service-laser'),
  },
  {
    title: "Botox",
    description: "Expertly administered Botox injections to reduce the appearance of fine lines and wrinkles, resulting in a smoother, more youthful look.",
    price: 2000000,
    image: findImage('service-botox'),
  },
  {
    title: "Whitening Infusion",
    description: "A specialized infusion treatment designed to brighten and even out skin tone, giving you a radiant and luminous glow from within.",
    price: 1200000,
    image: findImage('service-whitening'),
  },
  {
    title: "Acne Treatment",
    description: "A targeted treatment program to combat acne, reduce inflammation, and prevent future breakouts, leading to clearer and healthier skin.",
    price: 750000,
    image: findImage('service-acne'),
  },
];

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
