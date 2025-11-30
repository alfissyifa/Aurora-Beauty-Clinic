'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // If auth state is not loading and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if(!auth) return;
    await signOut(auth);
    router.push('/admin/login');
  };

  // While loading auth state, show a simplified layout or a loading spinner
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Memuat...</div>
        </div>
    );
  }

  // If there's no user, children will likely not be rendered due to redirect,
  // but we can return null to be safe.
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2 font-bold text-2xl text-sidebar-primary-foreground px-2">
                <span>Admin</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/dashboard" isActive={true} tooltip="Dashboard">
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        Logout
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className='flex items-center gap-2 border-b p-2 h-14'>
            <SidebarTrigger />
            <h2 className='font-semibold'>Aurora Beauty Clinic</h2>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
