
'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
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
import { Textarea } from '@/components/ui/textarea';

const galleryImageSchema = z.object({
  imageUrl: z.string().url('URL gambar tidak valid.'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter.'),
  imageHint: z.string().optional(),
});

type GalleryImage = z.infer<typeof galleryImageSchema> & { id: string, createdAt: any };

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
      description: '',
      imageHint: '',
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Alt Text)</FormLabel>
              <FormControl>
                <Textarea placeholder="Jelaskan gambar ini..." {...field} />
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
                <Input placeholder="cth. clinic interior" {...field} />
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
  const { user } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | undefined>(undefined);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'gallery'));
  }, [firestore, user]);

  const { data: images, isLoading, error } = useCollection<GalleryImage>(galleryQuery);

  const handleFormSubmit = async (values: z.infer<typeof galleryImageSchema>) => {
    if (!firestore) return;

    const id = editingImage ? editingImage.id : uuidv4();
    const docRef = doc(firestore, 'gallery', id);

    try {
      const dataToSave: any = { 
        ...values, 
        id, 
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
        
        {!isLoading && images?.map((image) => (
          <Card key={image.id} className="overflow-hidden shadow-lg group">
            <CardContent className="p-0 aspect-square relative">
              <Image 
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            </CardContent>
            <CardFooter className="p-2 bg-card/80 backdrop-blur-sm flex justify-between items-center transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <p className="text-xs text-muted-foreground truncate flex-1 pr-2">{image.description}</p>
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

        {!isLoading && images?.length === 0 && (
            <div className="col-span-full text-center h-48 flex items-center justify-center text-muted-foreground">
                Belum ada gambar di galeri. Silakan tambahkan gambar baru.
            </div>
        )}
      </div>
    </div>
  );
}
