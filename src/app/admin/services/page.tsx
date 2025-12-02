
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
import { PlusCircle, Edit, Trash } from 'lucide-react';
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

// Schema for the Service object in Firestore
const serviceSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Harga harus angka positif.')
  ),
  image: z.string().url('URL gambar tidak valid.'),
  imageHint: z.string().optional(),
});

type Service = z.infer<typeof serviceSchema> & { id: string };

const ServiceForm = ({
  service,
  onFormSubmit,
}: {
  service?: Service;
  onFormSubmit: (values: z.infer<typeof serviceSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      title: '',
      description: '',
      price: 0,
      image: '',
      imageHint: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof serviceSchema>) => {
    onFormSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Layanan</FormLabel>
              <FormControl>
                <Input placeholder="cth. Facial Glow" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Jelaskan tentang layanan ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input type="number" placeholder="500000" {...field} />
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
              <FormLabel>URL Gambar</FormLabel>
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
                <Input placeholder="cth. facial treatment" {...field} />
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
          <Button type="submit">{service ? 'Simpan Perubahan' : 'Tambah Layanan'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};


const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

export default function ServicesManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Removing orderBy to prevent index errors and ensure data is fetched.
    return query(collection(firestore, 'services'));
  }, [firestore]);

  const { data: services, isLoading, error } = useCollection<Service>(servicesQuery);

  const handleFormSubmit = async (values: z.infer<typeof serviceSchema>) => {
    if (!firestore) return;

    const id = editingService ? editingService.id : uuidv4();
    const docRef = doc(firestore, 'services', id);

    try {
      await setDoc(docRef, values, { merge: true });
      toast({
        title: 'Sukses!',
        description: `Layanan "${values.title}" berhasil ${editingService ? 'diperbarui' : 'ditambahkan'}.`,
      });
      setIsFormOpen(false);
      setEditingService(undefined);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: e.message || 'Gagal menyimpan layanan.',
      });
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: editingService ? 'update' : 'create',
          requestResourceData: values,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', service.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Layanan Dihapus',
        description: `Layanan "${service.title}" telah dihapus.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Gagal menghapus.',
        description: e.message || 'Gagal menghapus layanan.',
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
          <h1 className="text-3xl font-bold">Kelola Layanan</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus layanan yang ditawarkan.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
              <DialogDescription>
                Isi detail layanan di bawah ini. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm service={editingService} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Layanan</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell className="max-w-md truncate">{service.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingService(service); setIsFormOpen(true); }}>
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
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus layanan
                            "{service.title}" secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(service)}>
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && services?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        Belum ada layanan yang ditambahkan. Silakan klik tombol "Tambah Layanan".
                    </TableCell>
                </TableRow>
            )}
            {error && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-destructive">
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
