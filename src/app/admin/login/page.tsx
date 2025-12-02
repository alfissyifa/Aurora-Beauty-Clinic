'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, errorEmitter } from '@/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

function RegisterForm({ onRegisterSuccess }: { onRegisterSuccess: () => void }) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !auth) {
      toast({
        variant: "destructive",
        title: 'Koneksi Gagal',
        description: "Koneksi ke layanan otentikasi atau database gagal.",
      });
      return;
    }

    try {
      // 1. Daftar user dulu ke AUTH
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // 2. Baru simpan ke Firestore
      const adminDocRef = doc(firestore, "admins", user.uid);
      const adminData = {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(adminDocRef, adminData);
      
      // Jika sampai di sini, berarti semuanya sukses
      toast({
        title: 'Registrasi Berhasil!',
        description: 'Akun admin telah dibuat. Silakan login.',
      });
      onRegisterSuccess();

    } catch (error: any) {
      // Blok catch ini hanya akan dijalankan jika ada error sesungguhnya
      let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah digunakan. Silakan gunakan email lain atau login.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Izin ditolak oleh aturan keamanan Firestore. Pastikan aturan Anda benar.';
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `admins/${values.email}`, // Path generik karena UID belum tentu ada
          operation: 'create',
          requestResourceData: { email: values.email },
        }));
      } else {
        console.error("Registration/Firestore Error:", error);
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Registrasi gagal.',
        description: errorMessage,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Admin Baru</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Admin Baru</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Mendaftarkan...' : 'Buat Akun Admin'}
        </Button>
      </form>
    </Form>
  )
}


export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!auth) return;
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login Berhasil!',
        description: 'Anda akan diarahkan ke halaman dasbor.',
      });
      router.push('/admin/dashboard');
    } catch (error: any) {
      let errorMessage = 'Gagal melakukan login. Silakan periksa kembali email dan password Anda.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
         errorMessage = 'Email atau password yang Anda masukkan salah.';
      }

      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: errorMessage,
      });
      console.error('Login failed:', error);
    }
  }

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Login</CardTitle>
          <CardDescription className='pt-2'>Login untuk mengelola konten website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="link">Belum punya akun? Buat Akun Admin</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Admin</DialogTitle>
                  <DialogDescription>
                    Gunakan formulir ini untuk membuat akun admin baru.
                  </DialogDescription>
                </DialogHeader>
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
