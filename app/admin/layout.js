"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, Clock, Wrench, 
  ShoppingCart, Truck, Users, Settings, 
  Menu, X, Activity, Search 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }
    const hasToken = document.cookie.includes('admin_token=authenticated');
    if (!hasToken && router) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) return null; // Prevent flash of content

  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: "Catalog",
      items: [
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Future Listings', href: '/admin/future-listings', icon: Clock },
      ]
    },
    {
      title: "Services",
      items: [
        { name: 'Repairs', href: '/admin/repairs', icon: Wrench },
      ]
    },
    {
      title: "Sales & Fulfillment",
      items: [
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Deliveries', href: '/admin/deliveries', icon: Truck },
      ]
    },
    {
      title: "Business",
      items: [
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0F0A0A] text-[#F3EFE0] font-sans antialiased selection:bg-[#D4AF37] selection:text-black">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F0A0A] text-[#F3EFE0] font-sans antialiased selection:bg-[#D4AF37] selection:text-black flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#160F0F] border-r border-[#2C1E1E] fixed h-full z-40">
        <div className="p-6 border-b border-[#2C1E1E]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#FFF] via-[#F3EFE0] to-[#D4AF37] bg-clip-text text-transparent">
              SSV Admin
            </h1>
          </div>
          <p className="text-[10px] text-[#A09393] font-medium tracking-wide mt-1 uppercase">Master Administrative Suite</p>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
          {navigationGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-bold tracking-widest text-[#5A4B4B] uppercase mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                          : 'text-[#A09393] hover:bg-[#1C1212] hover:text-[#F3EFE0] border border-transparent'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#A09393] group-hover:text-[#C5B3B3]'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2C1E1E]">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#221616] border border-[#3D2828] text-[10px] font-mono text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE CONNECTED
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#160F0F]/90 backdrop-blur-md border-b border-[#2C1E1E] z-50 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-[#FFF] via-[#F3EFE0] to-[#D4AF37] bg-clip-text text-transparent">
            SSV
          </h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#A09393] hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pt-16 h-full overflow-y-auto">
          <nav className="p-4 space-y-6 pb-20">
            {navigationGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-4 text-[10px] font-bold tracking-widest text-[#5A4B4B] uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                            : 'text-[#A09393] hover:bg-[#1C1212] hover:text-[#F3EFE0] border border-transparent'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-[#A09393]'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Topbar Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-[#2C1E1E] bg-[#160F0F]/80 backdrop-blur-md sticky top-0 z-30">
          <h2 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2 capitalize min-w-[200px]">
            {pathname === '/admin' ? 'Dashboard Overview' : pathname.split('/').pop().replace('-', ' ')}
          </h2>
          
          <div className="flex items-center flex-1 max-w-lg mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09393] group-focus-within:text-[#D4AF37] transition" />
              <input 
                type="text" 
                placeholder="Global search... (Press '/' to focus)" 
                className="w-full pl-10 pr-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#2C1E1E] border border-[#3D2828] text-[9px] font-mono text-[#A09393]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[#2C1E1E] border border-[#3D2828] text-[9px] font-mono text-[#A09393]">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-[200px] justify-end">
             <div className="w-9 h-9 rounded-full bg-[#1C1212] border border-[#2C1E1E] flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition shadow-sm hover:shadow-[#D4AF37]/20">
                <Activity className="w-4 h-4 text-[#A09393] hover:text-[#D4AF37]" />
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
