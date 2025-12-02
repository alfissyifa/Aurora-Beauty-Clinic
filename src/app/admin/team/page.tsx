
'use client';

import React, { useState } from 'react';
import {
  collection,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle, Edit, Trash, User } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const doctorSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  specialty: z.string().min(5, 'Spesialisasi minimal 5 karakter.'),
  bio: z.string().min(20, 'Bio minimal 20 karakter.'),
  image: z.string().url('URL gambar tidak valid.'),
  imageHint: z.string().optional(),
});

type Doctor = z.infer<typeof doctorSchema> & { id: string };

const DoctorForm = ({
  doctor,
  onFormSubmit,
}: {
  doctor?: Doctor;
  onFormSubmit: (values: z.infer<typeof doctorSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof doctorSchema>>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor || {
      name: '',
      specialty: '',
      bio: '',
      image: '',
      imageHint: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof doctorSchema>) => {
    onFormSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap & Gelar</FormLabel>
              <FormControl>
                <Input placeholder="cth. Dr. Evelyn Reed, M.D." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spesialisasi</FormLabel>
              <FormControl>
                <Input placeholder="cth. Dermatologist & Aesthetic Specialist" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio Singkat</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Jelaskan tentang profil ahli..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Foto</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Petunjuk Gambar (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="cth. female doctor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit">{doctor ? 'Simpan Perubahan' : 'Tambah Tim'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};


export default function TeamManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>(undefined);

  const doctorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'doctors'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: doctors, isLoading, error } = useCollection<Doctor>(doctorsQuery);

  const handleFormSubmit = async (values: z.infer<typeof doctorSchema>) => {
    if (!firestore) return;

    const id = editingDoctor ? editingDoctor.id : uuidv4();
    const docRef = doc(firestore, 'doctors', id);

    try {
      await setDoc(docRef, { ...values, id }, { merge: true });
      toast({
        title: 'Sukses!',
        description: `Tim ahli "${values.name}" berhasil ${editingDoctor ? 'diperbarui' : 'ditambahkan'}.`,
      });
      setIsFormOpen(false);
      setEditingDoctor(undefined);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: e.message || 'Gagal menyimpan data tim ahli.',
      });
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: editingDoctor ? 'update' : 'create',
          requestResourceData: values,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'doctors', doctor.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Tim Ahli Dihapus',
        description: `Data "${doctor.name}" telah dihapus.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Gagal menghapus.',
        description: e.message || 'Gagal menghapus data.',
      });
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };


  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Tim Ahli</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus profil tim ahli Anda.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDoctor(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Tim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? 'Edit Profil Tim' : 'Tambah Tim Ahli Baru'}</DialogTitle>
              <DialogDescription>
                Isi detail profil di bawah ini. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <DoctorForm doctor={editingDoctor} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <div className='flex items-center gap-4'>
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && doctors?.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                      <div className='flex items-center gap-4'>
                         <Avatar>
                            <AvatarImage src={doctor.image} alt={doctor.name} />
                            <AvatarFallback><User /></AvatarFallback>
                         </Avatar>
                         {doctor.name}
                      </div>
                  </TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingDoctor(doctor); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus profil
                            "{doctor.name}" secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doctor)}>
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && doctors?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        Belum ada tim ahli yang ditambahkan.
                    </TableCell>
                </TableRow>
            )}
            {error && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-destructive">
                        Gagal memuat data: {error.message}
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
