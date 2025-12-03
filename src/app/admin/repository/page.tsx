
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
import { PlusCircle, Edit, Trash, ImageIcon } from 'lucide-react';
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

const repositoryItemSchema = z.object({
  title: z.string().min(1, 'Judul tidak boleh kosong.'),
  image: z.string().url('URL gambar tidak valid.'),
});

type RepositoryItem = {
  id: string;
  title: string;
  image: string;
  createdAt?: Timestamp;
};

const RepositoryItemForm = ({
  item,
  onFormSubmit,
}: {
  item?: RepositoryItem;
  onFormSubmit: (values: z.infer<typeof repositoryItemSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof repositoryItemSchema>>({
    resolver: zodResolver(repositoryItemSchema),
    defaultValues: item || {
      title: '',
      image: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof repositoryItemSchema>) => {
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
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul..." {...field} />
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit">{item ? 'Simpan Perubahan' : 'Tambah Item'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};


export default function RepositoryManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RepositoryItem | undefined>(undefined);

  const repositoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'repositories'));
  }, [firestore]);

  const { data: rawItems, isLoading, error } = useCollection<RepositoryItem>(repositoryQuery);

  const items = useMemo(() => {
    if (!rawItems) return [];
    return [...rawItems].sort((a, b) => {
      const dateA = a.createdAt?.toDate() ?? 0;
      const dateB = b.createdAt?.toDate() ?? 0;
      if (dateA && dateB) {
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  }, [rawItems]);

  const handleFormSubmit = async (values: z.infer<typeof repositoryItemSchema>) => {
    if (!firestore) return;

    const id = editingItem ? editingItem.id : uuidv4();
    const docRef = doc(firestore, 'repositories', id);

    const dataToSave: Omit<RepositoryItem, 'id' | 'createdAt'> & { createdAt?: any } = {
        title: values.title,
        image: values.image,
    };

    if (!editingItem) {
        dataToSave.createdAt = serverTimestamp();
    }

    try {
      await setDoc(docRef, dataToSave, { merge: true });

      toast({
        title: 'Sukses!',
        description: `Item repositori berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}.`,
      });
      setIsFormOpen(false);
      setEditingItem(undefined);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Terjadi kesalahan.',
        description: e.message || 'Gagal menyimpan item.',
      });
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: editingItem ? 'update' : 'create',
          requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDelete = async (item: RepositoryItem) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'repositories', item.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Item Dihapus',
        description: `Item "${item.title}" telah dihapus.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Oh tidak! Gagal menghapus.',
        description: e.message || 'Gagal menghapus item.',
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
          <h1 className="text-3xl font-bold">Kelola Repository</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus item di repository Anda.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Tambah Item Baru'}</DialogTitle>
              <DialogDescription>
                Isi detail item di bawah ini. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <RepositoryItemForm item={editingItem} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                     <Avatar className="rounded-md">
                        <AvatarImage src={item.image} alt={item.title} />
                        <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                     </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                      {item.title}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}>
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
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus item
                            "{item.title}" secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item)}>
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        Belum ada item yang ditambahkan.
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
