
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, serverTimestamp, setDoc, doc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
        title: 'Oh tidak! Terjadi kesalahan.',
        description: "Koneksi ke database gagal. Silakan coba lagi.",
      });
      return;
    }
    
    let createdUserUid: string | null = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      createdUserUid = userCredential.user.uid;
      const adminDocRef = doc(firestore, "admins", createdUserUid);
      
      await setDoc(adminDocRef, {
        uid: createdUserUid,
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Registrasi Berhasil!',
        description: 'Akun admin pertama telah dibuat. Silakan login.',
      });
      onRegisterSuccess();

    } catch (error: any) {
        let errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui.';
        if (error.code === 'permission-denied') {
            errorMessage = "Pendaftaran gagal. Kemungkinan sudah ada admin yang terdaftar.";
            const permissionError = new FirestorePermissionError({
                path: `admins/${createdUserUid || 'new-user'}`,
                operation: 'create',
                requestResourceData: { uid: createdUserUid, email: values.email },
            });
            errorEmitter.emit('permission-error', permissionError);
            
            // Clean up the created auth user if the firestore write failed
            if (auth.currentUser && auth.currentUser.uid === createdUserUid) {
                await auth.currentUser.delete().catch(() => console.warn("Failed to clean up orphaned auth user."));
            }
        } else if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email ini sudah digunakan. Silakan gunakan email lain atau login.';
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
  const firestore = useFirestore();
  const router = useRouter();

  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [noAdminsExist, setNoAdminsExist] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const checkAdmins = async () => {
    if (!firestore) return;
    setIsAdminLoading(true);
    try {
        const adminsCollection = collection(firestore, 'admins');
        const snapshot = await getDocs(adminsCollection);
        setNoAdminsExist(snapshot.empty);
    } catch (error) {
        console.warn("Could not check for admins. Hiding registration button as a precaution.", error);
        setNoAdminsExist(false); // Default to false on error to be safe
    } finally {
        setIsAdminLoading(false);
    }
  };

  useEffect(() => {
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
    setIsRegisterOpen(false); // Close the dialog
    checkAdmins(); // Re-check admins, which should now hide the button
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Login</CardTitle>
          {noAdminsExist && (
            <CardDescription className='pt-2'>Belum ada admin terdaftar. Buat akun admin pertama.</CardDescription>
          )}
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

           {!isAdminLoading && noAdminsExist && (
              <div className="mt-6 text-center">
                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link">Buat Akun Admin Pertama</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Admin Pertama</DialogTitle>
                      <DialogDescription>
                        Akun ini akan memiliki hak akses penuh untuk mengelola situs. Pastikan untuk menggunakan kredensial yang kuat.
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    