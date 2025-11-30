"use server";

import * as z from "zod";
import { initializeFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi, minimal 2 karakter." }),
  phone: z.string().min(10, { message: "Nomor WhatsApp harus valid." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  service: z.string({ required_error: "Silakan pilih layanan." }),
  date: z.date({ required_error: "Tanggal konsultasi harus diisi." }),
  note: z.string().optional(),
});

export async function bookAppointment(values: z.infer<typeof formSchema>) {
  const validatedData = formSchema.safeParse(values);

  if (!validatedData.success) {
    const errorMessages = validatedData.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }

  try {
    const { firestore } = initializeFirebase();
    const appointmentsCollection = collection(firestore, "appointments");
    
    await addDoc(appointmentsCollection, {
      ...validatedData.data,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: "Booking successful!" };

  } catch (error) {
    console.error("Booking failed:", error);

    let errorMessage = "Terjadi kesalahan tak terduga di server.";
     if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, message: errorMessage };
  }
}
