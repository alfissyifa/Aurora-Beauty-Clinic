
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, serverTimestamp, setDoc, doc, getDocs, query, limit } from 'firebase/firestore';
import { useState, useEffect } from 'react';

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
import { useAuth, useFirestore } from '@/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
        description: "Koneksi ke database atau layanan otentikasi gagal.",
      });
      return;
    }

    try {
      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Create admin document in Firestore
      const adminDocRef = doc(firestore, "admins", user.uid);
      await setDoc(adminDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Registrasi Berhasil!',
        description: 'Akun admin pertama telah dibuat. Silakan login.',
      });
      onRegisterSuccess();

    } catch (error: any) {
        let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email ini sudah digunakan. Silakan gunakan email lain atau login.';
        } else if (error.code === 'permission-denied') {
          errorMessage = 'Pendaftaran gagal. Kemungkinan sudah ada admin yang terdaftar. Aturan keamanan menolak pembuatan admin baru.';
        } else {
            console.error("Registration Error:", error);
        }
        
       toast({
        variant: 'destructive',
        title: 'Oh tidak! Registrasi gagal.',
        description: errorMessage,
      });

      // Clean up failed user creation in Auth
      if (auth.currentUser && auth.currentUser.email === values.email) {
          await auth.currentUser.delete().catch(e => console.warn("Gagal membersihkan user auth yang gagal dibuat: ", e));
      }
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
  const firestore = useFirestore();
  const router = useRouter();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    async function checkAdmins() {
      if (!firestore) {
        setIsLoadingCheck(false);
        return;
      };
      
      try {
        const adminsCollection = collection(firestore, 'admins');
        const q = query(adminsCollection, limit(1));
        const querySnapshot = await getDocs(q);
        setShowRegister(querySnapshot.empty);
      } catch (error) {
        // If we get a permission error trying to list, it's safer to assume we should show the register button.
        // This handles the very first run scenario where rules are tight.
        setShowRegister(true);
      } finally {
        setIsLoadingCheck(false);
      }
    }
    checkAdmins();
  }, [firestore]);


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
    setShowRegister(false);
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
            {showRegister && !isLoadingCheck && (
              <div className="mt-6 text-center">
                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link">Belum punya akun? Buat Akun Admin Pertama</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Admin Pertama</DialogTitle>
                      <DialogDescription>
                        Akun ini akan memiliki hak akses penuh untuk mengelola situs. Pastikan untuk menggunakan kredensial yang kuat. Hanya satu admin yang bisa dibuat melalui halaman ini.
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {isLoadingCheck && (
                <div className='text-center mt-6 text-sm text-muted-foreground'>
                    Memeriksa status admin...
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    