'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string; // ISO string
  note: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const AppointmentRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
);

export default function AppointmentsTable() {
  const firestore = useFirestore();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Order by creation date, newest first
    return query(collection(firestore, 'appointments'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: appointments, isLoading, error } = useCollection<Appointment>(appointmentsQuery);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    try {
      return format(new Date(dateString), "eeee, dd MMMM yyyy", { locale: id });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatTimestamp = (timestamp: { seconds: number }) => {
    if (!timestamp?.seconds) return 'N/A';
    return format(new Date(timestamp.seconds * 1000), "dd MMM yyyy, HH:mm");
  };

  return (
    <Table>
      <TableCaption>Daftar janji temu yang telah dibuat oleh pelanggan.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Pelanggan</TableHead>
          <TableHead>Kontak</TableHead>
          <TableHead>Layanan</TableHead>
          <TableHead>Tgl Konsultasi</TableHead>
          <TableHead>Tgl Booking</TableHead>
          <TableHead>Catatan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && Array.from({ length: 5 }).map((_, i) => <AppointmentRowSkeleton key={i} />)}
        
        {!isLoading && appointments?.map((apt) => (
          <TableRow key={apt.id}>
            <TableCell className="font-medium">{apt.name}</TableCell>
            <TableCell>
                <div>{apt.phone}</div>
                <div className="text-xs text-muted-foreground">{apt.email}</div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{apt.service}</Badge>
            </TableCell>
            <TableCell>{formatDate(apt.date)}</TableCell>
            <TableCell>{formatTimestamp(apt.createdAt)}</TableCell>
            <TableCell className='max-w-xs truncate'>{apt.note || '-'}</TableCell>
          </TableRow>
        ))}

        {!isLoading && appointments?.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                    Belum ada janji temu yang dibuat.
                </TableCell>
            </TableRow>
        )}
        
        {error && (
             <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-destructive">
                    Gagal memuat data: {error.message}
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
