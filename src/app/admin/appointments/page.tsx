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
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

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
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export default function AppointmentsTable({ status }: { status: 'pending' | 'processed' }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // ✅ BLOCK QUERY TOTAL JIKA BELUM SIAP
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || isUserLoading) return null;

    return query(
      collection(firestore, 'appointments'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, isUserLoading, status]);

  const { data, isLoading, error } = useCollection<Appointment>(appointmentsQuery);

  // ✅ TAMPILKAN LOADING SAJA, BUKAN HIT API
  if (isUserLoading || !user || !firestore) {
    return <AppointmentRowSkeleton />;
  }

  if (isLoading) {
    return <AppointmentRowSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Gagal memuat data janji temu.
      </div>
    );
  }

  return (
    <DataTable
      columns={[
        { accessorKey: "name", header: "Nama" },
        { accessorKey: "service", header: "Layanan" },
        { accessorKey: "status", header: "Status" },
      ]}
      data={data || []}
      isLoading={isLoading}
      onFilterChange={() => {}}
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
