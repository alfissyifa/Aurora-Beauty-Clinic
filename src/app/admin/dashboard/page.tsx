'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (isUserLoading || !user) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dasbor Admin</h1>
          <p className="text-muted-foreground">Selamat datang, {user.email}</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      <div className="border rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Daftar Janji Temu</h2>
        <p className="text-muted-foreground">
          Fitur untuk melihat janji temu akan segera hadir di sini.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return <AdminDashboard />;
}
