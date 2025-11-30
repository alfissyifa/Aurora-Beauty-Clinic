"use server";

import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi, minimal 2 karakter." }),
  phone: z.string().min(10, { message: "Nomor WhatsApp harus valid." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  service: z.string({ required_error: "Silakan pilih layanan." }),
  date: z.date({ required_error: "Tanggal konsultasi harus diisi." }),
  note: z.string().optional(),
});

// This is a placeholder function. The actual logic is moved to the client component.
export async function bookAppointment(values: z.infer<typeof formSchema>) {
  const validatedData = formSchema.safeParse(values);

  if (!validatedData.success) {
    const errorMessages = validatedData.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: `Validasi gagal: ${errorMessages}` };
  }
  
  // The actual Firestore logic will be handled on the client-side
  // to avoid server/client boundary issues.
  // This server action now only serves for validation if needed, but we will
  // perform the write operation directly from the client component.
  return { success: true, message: "Data divalidasi. Mengirim ke Firestore..." };
}
