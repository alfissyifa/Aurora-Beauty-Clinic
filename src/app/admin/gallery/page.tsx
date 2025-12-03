
'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const galleryImageSchema = z.object({
  imageUrl: z.string().url('URL gambar tidak valid.'),
});

type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
type GalleryImage = GalleryImageFormData & { 
  id: string; 
  description?: string; 
  imageHint?: string; 
  createdAt: Timestamp 
};

const GalleryImageForm = ({
  image,
  onFormSubmit,
}: {
  image?: GalleryImage;
  onFormSubmit: (values: GalleryImageFormData) => void;
}) => {
  const form = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: image || {
      imageUrl: '',
    },
  });

  const handleSubmit = (values: GalleryImageFormData) => {
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

const ImageCardSkeleton = () => (
    <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-square" />
        <CardContent className="p-4">
            <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
        </CardFooter>
    </Card>
)

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

  const handleFormSubmit = async (values: GalleryImageFormData) => {
    if (!firestore) return;

    const id = editingImage ? editingImage.id : uuidv4();
    const docRef = doc(firestore, 'gallery', id);

    try {
      const dataToSave: Omit<GalleryImage, 'createdAt'> & { createdAt?: any } = { 
        ...values, 
        id,
        description: editingImage?.description || 'Deskripsi gambar',
        imageHint: editingImage?.imageHint || 'gallery image',
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
        description: 'Gambar telah dihapus dari galeri.',
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
          <p className="text-muted-foreground">Tambah, ubah, atau hapus gambar di galeri frontend.</p>
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
                Isi detail gambar di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <GalleryImageForm image={editingImage} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-center p-4 text-destructive bg-destructive/10 rounded-md">
            Gagal memuat data: {error.message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <ImageCardSkeleton key={i} />)}
        
        {!isLoading && sortedImages.map((image) => (
          <Card key={image.id} className="overflow-hidden shadow-lg group">
            <CardContent className="p-0 aspect-square relative">
              <Image 
                src={image.imageUrl}
                alt={image.description || 'Gambar galeri'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            </CardContent>
            <CardFooter className="p-2 bg-card/80 backdrop-blur-sm flex justify-end items-center transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <div className='flex'>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingImage(image); setIsFormOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan dan akan menghapus gambar ini secara permanen.
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
              </div>
            </CardFooter>
          </Card>
        ))}

        {!isLoading && sortedImages.length === 0 && (
            <div className="col-span-full text-center h-48 flex items-center justify-center text-muted-foreground">
                Belum ada gambar di galeri. Silakan tambahkan gambar baru.
            </div>
        )}
      </div>
    </div>
  );
}
