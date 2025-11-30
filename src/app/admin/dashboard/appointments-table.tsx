'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, endBefore, limitToLast, getDocs, where, Query, DocumentData, Timestamp, QueryDocumentSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string; // ISO string
  note: string;
  createdAt: Timestamp;
}

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
            return format(new Date(row.getValue("date")), "eeee, dd MMMM yyyy", { locale: id });
        } catch (e) {
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
        return format(new Date(timestamp.seconds * 1000), "dd MMM yyyy, HH:mm");
    },
  },
];


const AppointmentRowSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
);

export default function AppointmentsTable({ limit: initialLimit }: { limit?: number }) {
  const firestore = useFirestore();
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
        const appointmentsCollection = collection(firestore, 'appointments');
        let q: Query<DocumentData>;

        const order = orderBy(newSort.id, newSort.desc ? 'desc' : 'asc');
        
        let pagination;
        if (direction === 'next' && lastVisible) {
            pagination = startAfter(lastVisible);
        } else if (direction === 'prev' && firstVisible) {
             q = query(appointmentsCollection, order, endBefore(firstVisible), limitToLast(newPageSize));
             // For 'prev', we don't need another cursor
        } else {
            q = query(appointmentsCollection, order, limit(newPageSize));
        }

        if (pagination) {
            q = query(appointmentsCollection, order, pagination, limit(newPageSize));
        } else if (!q) {
            q = query(appointmentsCollection, order, limit(newPageSize));
        }
        
        // Basic filter by name - case-insensitive would require more complex setup
        // For simplicity, we filter where name is >= search text.
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

  React.useEffect(() => {
    fetchData({ pageIndex: 0, pageSize, newFilter: filter, newSort: sort });
  }, [firestore, pageSize, filter, sort]); // Refetch on changes
  
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
