'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, endBefore, limitToLast, getDocs, where, Query, DocumentData, Timestamp, QueryDocumentSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trash, X } from 'lucide-react';
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

export default function AppointmentsTable({ limit: initialLimit, status }: { limit?: number, status?: 'pending' | 'processed' }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [data, setData] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState(initialLimit || 10);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ id: 'createdAt', desc: true });
  
  // For pagination cursor
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [page, setPage] = useState(0); // 0-indexed page

  const fetchData = async (
    { pageIndex, pageSize: newPageSize, newFilter, newSort, direction }: 
    { pageIndex: number, pageSize: number, newFilter: string, newSort: {id: string, desc: boolean}, direction?: 'next' | 'prev' | 'none' }
  ) => {
    if (!firestore) return;

    setIsLoading(true);
    setError(null);

    try {
        let q: Query<DocumentData> = collection(firestore, 'appointments');

        if (status) {
            // CRITICAL FIX: Only filter by status. DO NOT add orderBy for another field
            // as this requires a composite index which we cannot create automatically.
            // This prevents the Firestore index error.
            q = query(q, where('status', '==', status));
        } else {
             // Sorting is only applied when not filtering by status to avoid index errors.
             q = query(q, orderBy(newSort.id, newSort.desc ? 'desc' : 'asc'));
        }

        if (direction === 'next' && lastVisible) {
            q = query(q, startAfter(lastVisible));
        } else if (direction === 'prev' && firstVisible) {
             q = query(q, endBefore(firstVisible), limitToLast(newPageSize));
        }
        
        q = query(q, limit(newPageSize));
        
        // Note: Filtering by name requires an additional index if combined with other orderBy clauses
        // For simplicity, this example might require a name_lowercase field and index in a real app.
        if (newFilter) {
            q = query(q, where('name', '>=', newFilter), where('name', '<=', newFilter + '\uf8ff'));
        }

      const docSnap = await getDocs(q);
      const appointments: Appointment[] = docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

      setData(appointments);
      setFirstVisible(docSnap.docs[0] || null);
      setLastVisible(docSnap.docs[docSnap.docs.length - 1] || null);

      if (direction === 'prev') {
          setPage(pageIndex > 0 ? pageIndex - 1 : 0);
      } else if (direction === 'next') {
          setPage(pageIndex + 1);
      } else {
          setPage(0);
      }


    } catch (e: any) {
      console.error("Error fetching appointments:", e);
      setError(e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'processed') => {
    if (!firestore) return;
    const docRef = doc(firestore, 'appointments', id);
    try {
      await updateDoc(docRef, { status: newStatus });
      toast({
        title: "Status Diperbarui",
        description: `Janji temu telah dipindahkan ke "Sudah Dibaca".`
      });
      // Refetch data for the current view
      fetchData({ pageIndex: page, pageSize, newFilter: filter, newSort: sort, direction: 'none' });
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
      fetchData({ pageIndex: page, pageSize, newFilter: filter, newSort: sort, direction: 'none' });
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

  React.useEffect(() => {
    fetchData({ pageIndex: 0, pageSize, newFilter: filter, newSort: sort, direction: 'none' });
  }, [firestore, pageSize, filter, sort, status]); // Refetch on changes, including status
  
  const handleNextPage = () => {
    fetchData({ pageIndex: page, pageSize, newFilter: filter, newSort: sort, direction: 'next' });
  };

  const handlePrevPage = () => {
     fetchData({ pageIndex: page, pageSize, newFilter: filter, newSort: sort, direction: 'prev' });
  };
  
  if (isLoading && data.length === 0) {
      return <AppointmentRowSkeleton />;
  }

  return (
    <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onFilterChange={setFilter}
        onSortChange={(id, desc) => setSort({id, desc})}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        canNextPage={data.length === pageSize}
        canPrevPage={page > 0}
        pageIndex={page}
    />
  );
}

    
    