
'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash, Image as ImageIcon } from 'lucide-react';
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
import { Timestamp } from 'firebase/firestore';

const galleryImageSchema = z.object({
  imageUrl: z.string().url('URL gambar tidak valid.'),
});

type GalleryImage = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: Timestamp;
};

const GalleryImageForm = ({
  image,
  onFormSubmit,
}: {
  image?: GalleryImage;
  onFormSubmit: (values: z.infer<typeof galleryImageSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof galleryImageSchema>>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: image || {
      imageUrl: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof galleryImageSchema>) => {
    onFormSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="imageUrl"
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit">{image ? 'Simpan Perubahan' : 'Tambah Gambar'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};


export default function GalleryManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | undefined>(undefined);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'));
  }, [firestore]);

  const { data: images, isLoading, error } = useCollection<GalleryImage>(galleryQuery);

  const sortedImages = useMemo(() => {
    if (!images) return [];
    return [...images].sort((a, b) => {
      const dateA = a.createdAt?.toDate() ?? new Date(0);
      const dateB = b.createdAt?.toDate() ?? new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [images]);

  const handleFormSubmit = async (values: z.infer<typeof galleryImageSchema>) => {
    if (!firestore) return;

    const id = editingImage ? editingImage.id : uuidv4();
    const docRef = doc(firestore, 'gallery', id);

    try {
      const dataToSave: Omit<GalleryImage, 'id' | 'createdAt'> & { id: string; createdAt?: any, description: string, imageHint: string } = {
        ...values,
        id,
        description: 'Deskripsi gambar',
        imageHint: 'gallery image'
      };

      if (!editingImage) {
        dataToSave.createdAt = serverTimestamp();
      }
      
      await setDoc(docRef, dataToSave, { merge: true });

      toast({
        title: 'Sukses!',
        description: `Gambar berhasil ${editingImage ? 'diperbarui' : 'ditambahkan'}.`,
      });
      setIsFormOpen(false);
      setEditingImage(undefined);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: e.message || 'Gagal menyimpan gambar.',
      });
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: editingImage ? 'update' : 'create',
          requestResourceData: values,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'gallery', image.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Gambar Dihapus',
        description: `Gambar telah dihapus.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Gagal menghapus.',
        description: e.message || 'Gagal menghapus gambar.',
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
          <h1 className="text-3xl font-bold">Kelola Galeri</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus gambar di galeri situs Anda.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingImage(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Gambar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingImage ? 'Edit Gambar' : 'Tambah Gambar Baru'}</DialogTitle>
              <DialogDescription>
                Masukkan URL gambar di bawah ini. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <GalleryImageForm image={editingImage} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <div className='flex items-center gap-4'>
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && sortedImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell className="font-medium">
                      <div className='flex items-center gap-4'>
                         <Avatar className="rounded-md">
                            <AvatarImage src={image.imageUrl} alt={image.description} />
                            <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                         </Avatar>
                         <span className="truncate max-w-xs">{image.imageUrl}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingImage(image); setIsFormOpen(true); }}>
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
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus gambar
                            secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(image)}>
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && sortedImages.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                        Belum ada gambar yang ditambahkan.
                    </TableCell>
                </TableRow>
            )}
            {error && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24 text-destructive">
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
