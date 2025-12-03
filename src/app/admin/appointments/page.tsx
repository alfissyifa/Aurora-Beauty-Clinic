'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  note: string;
  status: 'pending' | 'processed';
  createdAt: Timestamp;
}

const AppointmentRowSkeleton = () => (
  <div className="space-y-2 p-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

function AppointmentsTable({ status }: { status: 'pending' | 'processed' }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filterText, setFilterText] = React.useState('');

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) {
      return null;
    }
    // Menghapus 'where' dan 'orderBy' untuk menghindari error akibat indeks yang hilang.
    // Pemfilteran akan dilakukan di sisi klien.
    return query(collection(firestore, 'appointments'));
      
  }, [firestore]);

  const { data: rawData, isLoading, error } = useCollection<Appointment>(appointmentsQuery);
  
  // Filter data di sisi klien berdasarkan status dan teks pencarian
  const data = React.useMemo(() => {
    if (!rawData) return [];
    
    let filteredData = rawData.filter(appt => appt.status === status);

    if (filterText) {
      filteredData = filteredData.filter(appt => 
        appt.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    return filteredData;
  }, [rawData, status, filterText]);


  const handleStatusChange = (id: string, newStatus: 'processed') => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    updateDoc(docRef, { status: newStatus })
      .then(() => {
          toast({
            title: "Status Diperbarui",
            description: `Janji temu telah dipindahkan ke "Sudah Dibaca".`
          });
      })
      .catch((e: any) => {
        toast({
            variant: "destructive",
            title: "Gagal Memperbarui",
            description: e.message || "Tidak dapat memperbarui status janji temu."
        });
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus }
        }));
      });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    deleteDoc(docRef)
      .then(() => {
          toast({
            title: "Janji Temu Dihapus",
            description: `Janji temu telah berhasil dihapus.`
          });
      })
      .catch((e: any) => {
          toast({
            variant: "destructive",
            title: "Gagal Menghapus",
            description: e.message || "Tidak dapat menghapus janji temu."
          });
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete'
          }));
      });
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
          if (dateValue && typeof dateValue.toDate === 'function') {
            return format(dateValue.toDate(), "eeee, dd MMMM yyyy", { locale: id });
          }
          return format(new Date(dateValue), "eeee, dd MMMM yyyy", { locale: id });
        } catch {
          return 'Invalid Date';
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tgl Booking",
      cell: ({ row }: any) => {
        const timestamp = row.getValue("createdAt") as unknown;
        if (timestamp instanceof Timestamp && typeof timestamp.seconds === 'number') {
          return format(timestamp.toDate(), "dd MMM yyyy, HH:mm");
        }
        return 'N/A';
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
                  <Button variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" /> Proses
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Proses Janji Temu</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin memproses janji temu untuk <strong>{appointment.name}</strong>?
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
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus janji temu ini?
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
    return <div className='text-center text-destructive p-4'>Error: {error.message}</div>;
  }
  
  return (
    <DataTable
      columns={columns}
      data={data || []}
      isLoading={isLoading}
      onFilterChange={setFilterText}
      onSortChange={() => {}}
      onPageSizeChange={() => {}}
      onNextPage={() => {}}
      onPrevPage={() => {}}
      canNextPage={false}
      canPrevPage={false}
      pageIndex={0}
    />
  );
}


export default function AppointmentsPage() {
  const { isUserLoading } = useUser();
  
  if (isUserLoading) {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-48 mb-4" />
                    <AppointmentRowSkeleton />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
     <div className="p-4 md:p-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Kelola Janji Temu</CardTitle>
              <CardDescription>Lihat, proses, dan hapus janji temu dari pelanggan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Belum Dibaca</TabsTrigger>
                    <TabsTrigger value="processed">Sudah Dibaca</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <AppointmentsTable status="pending" />
                </TabsContent>
                <TabsContent value="processed">
                    <AppointmentsTable status="processed" />
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
    </div>
  )
}
