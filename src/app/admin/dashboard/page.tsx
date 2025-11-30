'use client';

import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentsTable from './appointments-table';

function AdminDashboard() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading || !user) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dasbor Janji Temu</h1>
        <p className="text-muted-foreground">Lihat dan kelola semua janji temu yang masuk.</p>
      </div>
      
      <AppointmentsTable />
    </div>
  );
}

export default function DashboardPage() {
    return <AdminDashboard />;
}
