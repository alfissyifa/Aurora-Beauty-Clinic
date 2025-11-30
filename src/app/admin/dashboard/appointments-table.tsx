'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string; // ISO string
  note: string;
  status: 'pending' | 'processed';
  createdAt: Timestamp;
}

const AppointmentRowSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
);

export default function AppointmentsTable({ status }: { status: 'pending' | 'processed' }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'appointments'), where('status', '==', status));
  }, [firestore, status]);

  const { data, isLoading, error, refetch } = useCollection<Appointment>(appointmentsQuery);

  const handleStatusChange = async (id: string, newStatus: 'processed') => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    try {
      await updateDoc(docRef, { status: newStatus });
      toast({
        title: "Status Diperbarui",
        description: `Janji temu telah dipindahkan ke "Sudah Dibaca".`
      });
      // The useCollection hook should update automatically, but a manual refetch can be an option if needed
    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: e.message || "Tidak dapat memperbarui status janji temu."
       });
       if (e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: { status: newStatus }
            }));
       }
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Janji Temu Dihapus",
        description: `Janji temu telah berhasil dihapus.`
      });
    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: e.message || "Tidak dapat menghapus janji temu."
       });
       if (e.code === 'permission-denied') {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete'
            }));
       }
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nama Pelanggan",
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "contact",
      header: "Kontak",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.phone}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: "Layanan",
      cell: ({ row }: any) => <Badge variant="secondary">{row.getValue("service")}</Badge>,
    },
    {
      accessorKey: "date",
      header: "Tgl Konsultasi",
      cell: ({ row }: any) => {
          try {
              const dateValue = row.getValue("date");
              if (!dateValue) return 'N/A';
              // Check if it's a Firebase Timestamp
              if (dateValue.seconds) {
                  return format(new Date(dateValue.seconds * 1000), "eeee, dd MMMM yyyy", { locale: id });
              }
              // Assume it's an ISO string or other valid date string
              return format(new Date(dateValue), "eeee, dd MMMM yyyy", { locale: id });
          } catch (e) {
              console.error("Invalid date format for 'date':", row.getValue("date"));
              return 'Invalid Date';
          }
      },
    },
      {
      accessorKey: "createdAt",
      header: "Tgl Booking",
      cell: ({ row }: any) => {
          const timestamp = row.getValue("createdAt") as Timestamp;
          if (!timestamp?.seconds) return 'N/A';
          try {
            return format(new Date(timestamp.seconds * 1000), "dd MMM yyyy, HH:mm");
          } catch(e) {
            console.error("Invalid date format for 'createdAt':", timestamp);
            return 'Invalid Date';
          }
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment;
        return (
          <div className='flex gap-2 justify-center'>
            {appointment.status === 'pending' && (
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm"><Check className="h-4 w-4 mr-2" /> Proses</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Proses Janji Temu</AlertDialogTitle>
                      <AlertDialogDescription>
                        Anda yakin ingin memproses janji temu untuk <strong>{appointment.name}</strong>? Tindakan ini akan memindahkan janji temu ke tab "Sudah Dibaca".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange(appointment.id, 'processed')}>
                        Ya, Proses
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus janji temu ini secara permanen? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(appointment.id)}>
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      }
    },
  ];

  if (isLoading) {
      return <AppointmentRowSkeleton />;
  }

  if (error) {
    return <div className='text-center text-destructive p-4'>Error: {error.message}</div>
  }

  return (
    <DataTable
        columns={columns}
        data={data ?? []} // Use the data from useCollection hook
        isLoading={isLoading}
        // Simplified props, pagination and filtering are disabled for now
        onFilterChange={() => {}}
        onSortChange={() => {}}
        onPageSizeChange={() => {}}
        pageSize={data?.length || 10}
        onNextPage={() => {}}
        onPrevPage={() => {}}
        canNextPage={false}
        canPrevPage={false}
        pageIndex={0}
    />
  );
}
