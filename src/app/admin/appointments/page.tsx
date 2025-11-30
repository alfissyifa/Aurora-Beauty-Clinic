'use client';

import AppointmentsTable from '../dashboard/appointments-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Belum Dibaca</TabsTrigger>
                <TabsTrigger value="processed">Sudah Dibaca</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <AppointmentsTable status="pending" />
              </TabsContent>
              <TabsContent value="processed" className="mt-4">
                <AppointmentsTable status="processed" />
              </TabsContent>
            </Tabs>
          </CardContent>
      </Card>
    </div>
  );
}
