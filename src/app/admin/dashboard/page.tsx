'use client';

import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentsTable from './appointments-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ShoppingCart, Users, Wallet, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const chartData = [
  { month: "Januari", appointments: 186 },
  { month: "Februari", appointments: 305 },
  { month: "Maret", appointments: 237 },
  { month: "April", appointments: 273 },
  { month: "Mei", appointments: 209 },
  { month: "Juni", appointments: 214 },
];

const chartConfig = {
  appointments: {
    label: "Janji Temu",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function AdminDashboard() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading || !user) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dasbor</h1>
        <p className="text-muted-foreground">Selamat datang kembali, {user.email}!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Janji Temu</CardTitle>
            <ShoppingCart className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-white/80">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potensi Pendapatan</CardTitle>
            <Wallet className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 45.23M</div>
            <p className="text-xs text-white/80">+180.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Baru</CardTitle>
            <Users className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-white/80">+30% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepuasan Pelanggan</CardTitle>
            <Heart className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-white/80">+2% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
       <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle>Ringkasan Janji Temu</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="appointments"
                  type="natural"
                  fill="var(--color-appointments)"
                  fillOpacity={0.4}
                  stroke="var(--color-appointments)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      
      {/* Appointments Table */}
      <Card className='shadow-lg'>
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Janji Temu Terbaru</CardTitle>
                <CardDescription>Daftar janji temu yang perlu diproses.</CardDescription>
              </div>
                <Button asChild variant="link">
                    <Link href="/admin/appointments">
                        Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
           <AppointmentsTable status="pending" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
    return <AdminDashboard />;
}
