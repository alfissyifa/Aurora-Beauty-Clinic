'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc } from 'firebase/firestore';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const contactSchema = z.object({
  address: z.string().min(10, 'Alamat minimal 10 karakter.'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  hours: z.string().min(10, 'Jam operasional minimal 10 karakter.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const defaultContactInfo = {
    address: "Jl. Cantik Raya No. 123, Jakarta Selatan, 12345, Indonesia",
    phone: "(021) 1234 5678",
    email: "info@aurorabeauty.com",
    hours: "Senin - Sabtu: 09:00 - 20:00",
};


export default function ContactAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const contactDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'pages', 'contact');
  }, [firestore]);

  const { data: contactInfo, isLoading } = useDoc<ContactFormData>(contactDocRef);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contactInfo || defaultContactInfo,
  });

  useEffect(() => {
    if (contactInfo) {
      form.reset(contactInfo);
    } else if (!isLoading) {
      form.reset(defaultContactInfo);
    }
  }, [contactInfo, isLoading, form]);

  const onSubmit = (values: ContactFormData) => {
    if (!contactDocRef) return;
    setDoc(contactDocRef, values, { merge: true })
      .then(() => {
        toast({
          title: 'Sukses!',
          description: 'Informasi kontak berhasil diperbarui.',
        });
      })
      .catch((e: any) => {
        toast({
          variant: 'destructive',
          title: 'Oh tidak! Terjadi kesalahan.',
          description: e.message || 'Gagal menyimpan data.',
        });
        if (e.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: contactDocRef.path,
              operation: 'update',
              requestResourceData: values
          }));
        }
      });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Kelola Informasi Kontak</CardTitle>
          <CardDescription>
            Ubah detail kontak yang ditampilkan di halaman "Kontak Kami".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat lengkap klinik..." {...field} />
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
                      <FormLabel>Telepon / WA</FormLabel>
                      <FormControl>
                        <Input placeholder="Nomor telepon..." {...field} />
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
                        <Input type="email" placeholder="Alamat email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Senin - Jumat: 09:00 - 18:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
