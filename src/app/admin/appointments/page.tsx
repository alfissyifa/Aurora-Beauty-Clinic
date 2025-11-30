'use client';

import AppointmentsTable from '../dashboard/appointments-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppointmentsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle>Data Janji Temu</CardTitle>
            <CardDescription>
                Lihat dan kelola semua janji temu yang telah dijadwalkan oleh pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsTable />
          </CardContent>
      </Card>
    </div>
  );
}
