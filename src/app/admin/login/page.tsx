'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    try {
      if (!firestore) throw new Error("Firestore is not initialized.");
      
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const adminCollection = collection(firestore, "admins");
      
      await addDoc(adminCollection, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Registrasi Berhasil!',
        description: 'Akun admin pertama telah dibuat. Silakan login.',
      });
      onRegisterSuccess();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Oh tidak! Registrasi gagal.',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
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
  const firestore = useFirestore();
  const router = useRouter();

  const adminsQuery = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'admins') : null;
  }, [firestore]);

  const { data: admins, isLoading: isAdminLoading } = useCollection(adminsQuery);
  
  const noAdminsExist = !isAdminLoading && admins && admins.length === 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)] bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center font-headline text-3xl">Admin Login</CardTitle>
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

          {noAdminsExist && (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4">Register Admin Pertama</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Registrasi Admin Pertama</AlertDialogTitle>
                  <AlertDialogDescription>
                    Karena belum ada admin yang terdaftar, Anda dapat membuat akun admin pertama untuk sistem ini.
                    Setelah akun ini dibuat, opsi pendaftaran akan dinonaktifkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <RegisterForm onRegisterSuccess={() => {
                   const cancelButton = document.querySelector('[data-alert-dialog-cancel]');
                   if (cancelButton instanceof HTMLElement) {
                      cancelButton.click();
                   }
                }} />
                <AlertDialogFooter>
                   <AlertDialogCancel data-alert-dialog-cancel>Batal</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
