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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const aboutSchema = z.object({
  title: z.string().min(10, 'Judul minimal 10 karakter.'),
  subtitle: z.string().min(10, 'Subjudul minimal 10 karakter.'),
  paragraph1: z.string().min(20, 'Paragraf 1 minimal 20 karakter.'),
  paragraph2: z.string().min(20, 'Paragraf 2 minimal 20 karakter.'),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function AboutAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const aboutDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'pages', 'about');
  }, [firestore]);

  const { data: aboutContent, isLoading } = useDoc<AboutFormData>(aboutDocRef);

  const form = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      paragraph1: '',
      paragraph2: '',
    },
  });

  useEffect(() => {
    if (aboutContent) {
      form.reset(aboutContent);
    }
  }, [aboutContent, form]);

  const onSubmit = async (values: AboutFormData) => {
    if (!aboutDocRef) return;
    try {
      await setDoc(aboutDocRef, values, { merge: true });
      toast({
        title: 'Sukses!',
        description: 'Konten halaman "Tentang Kami" berhasil diperbarui.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: e.message || 'Gagal menyimpan konten.',
      });
       if (e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: aboutDocRef.path,
                operation: 'update',
                requestResourceData: values
            }));
       }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Kelola Halaman "Tentang Kami"</CardTitle>
          <CardDescription>
            Ubah teks yang ditampilkan di halaman "Tentang Kami" untuk pengunjung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Utama</FormLabel>
                      <FormControl>
                        <Input placeholder="Judul halaman..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjudul</FormLabel>
                      <FormControl>
                        <Input placeholder="Subjudul atau tagline..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paragraph1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragraf Pertama</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Paragraf pertama tentang klinik..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paragraph2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paragraf Kedua</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Paragraf kedua tentang misi atau visi..." {...field} />
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
