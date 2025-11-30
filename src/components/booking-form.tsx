
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { addDoc, collection, serverTimestamp, query, orderBy } from "firebase/firestore";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

type Service = {
    id: string;
    title: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi, minimal 2 karakter." }),
  phone: z.string().min(10, { message: "Nomor WhatsApp harus valid." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  service: z.string({ required_error: "Silakan pilih layanan." }),
  date: z.date({ required_error: "Tanggal konsultasi harus diisi." }),
  note: z.string().optional(),
});

export default function BookingForm() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('title', 'asc'));
  }, [firestore]);

  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesQuery);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      note: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Oh tidak! Terjadi kesalahan.",
            description: "Koneksi ke database gagal. Silakan coba lagi.",
        });
        return;
    }

    try {
      const appointmentsCollection = collection(firestore, "appointments");
      await addDoc(appointmentsCollection, {
        ...values,
        date: values.date.toISOString(),
        createdAt: serverTimestamp(),
        status: 'pending', // Default status for new appointments
      });

      toast({
        title: "Booking Berhasil!",
        description: `Terima kasih, ${values.name}. Kami akan segera menghubungi Anda untuk konfirmasi.`,
      });
      form.reset();
    } catch (error) {
       let errorMessage = "Gagal mengirimkan formulir, silahkan coba lagi.";
       if (error instanceof Error) {
           errorMessage = error.message;
       }

       toast({
         variant: "destructive",
         title: "Oh tidak! Terjadi kesalahan.",
         description: errorMessage,
       });

       if (error instanceof FirestorePermissionError) {
         errorEmitter.emit('permission-error', error);
       } else {
         console.error("Booking failed:", error);
       }
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Rina Dewi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. 081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. rina@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layanan yang Diinginkan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingServices}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingServices ? "Memuat layanan..." : "Pilih salah satu layanan"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.title}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Konsultasi</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contoh: Saya memiliki kulit sensitif." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Mengirim..." : "Kirim Permintaan Booking"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
