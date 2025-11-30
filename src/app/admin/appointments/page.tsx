'use client';

import AppointmentsTable from '../dashboard/appointments-table';

export default function AppointmentsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Semua Janji Temu</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola semua janji temu yang telah dijadwalkan.
          </p>
        </div>
      </div>

      <AppointmentsTable />
    </div>
  );
}
