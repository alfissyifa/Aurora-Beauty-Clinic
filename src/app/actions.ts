"use server";

import * as z from "zod";

const formSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  service: z.string(),
  date: z.date(),
  note: z.string().optional(),
});

export async function bookAppointment(values: z.infer<typeof formSchema>) {
  // Here you would typically save the data to a database like Firestore.
  // For this example, we'll just log it to the console.
  
  try {
    const validatedData = formSchema.parse(values);
    console.log("New booking received:", validatedData);
    
    // TODO: Implement actual database saving (e.g., to Firebase Firestore)
    // TODO: Implement email notification to admin

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: "Booking successful!" };
  } catch (error) {
    console.error("Booking failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validation failed", errors: error.errors };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}
