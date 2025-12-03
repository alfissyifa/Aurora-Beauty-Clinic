'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Search, Bell, MessageSquare, User as UserIcon, Settings, Mail, Sparkles, BriefcaseBusiness, Info, Phone, ShoppingCart, CalendarClock, Users, GalleryHorizontal } from 'lucide-react';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  const isLoginPage = pathname === '/admin/login';

  const navItems = [
    { href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Janji Temu', icon: CalendarClock },
    { href: '/admin/services', label: 'Layanan', icon: ShoppingCart },
    { href: '/admin/team', label: 'Tim Ahli', icon: Users },
    { href: '/admin/gallery', label: 'Galeri', icon: GalleryHorizontal },
    { href: '/admin/about', label: 'Tentang Kami', icon: Info },
    { href: '/admin/contact', label: 'Kelola Kontak', icon: Phone },
  ];

  useEffect(() => {
    // If auth state is not loading and there's no user, and we are NOT on the login page, redirect to login
    if (!isUserLoading && !user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router, isLoginPage]);

  const handleLogout = async () => {
    if(!auth) return;
    await signOut(auth);
    router.push('/admin/login');
  };
  
  if (isLoginPage) {
    return (
        <div className="bg-background min-h-screen">
            {children}
        </div>
    );
  }

  // While loading auth state, show a simplified layout or a loading spinner
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-white">
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
        <SidebarHeader className="h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="flex items-center gap-2 text-2xl font-bold text-sidebar-primary-foreground">
                <Sparkles className="h-6 w-6" />
                <span>Aurora</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href + item.label}>
                    <SidebarMenuButton href={item.href} isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                        <item.icon />
                        {item.label}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
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
      <SidebarInset className="bg-white">
        <header className='flex items-center justify-between gap-4 p-3 h-20 shadow-md'>
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari Dasbor" className="pl-9 w-64" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifikasi</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">Pesan</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                             <Avatar className='h-8 w-8'>
                                <AvatarImage src={user.photoURL ?? ''} alt="User avatar" />
                                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Kotak Masuk</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Pengaturan</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
