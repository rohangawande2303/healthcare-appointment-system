"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  LogOut,
  Menu,
  X,
  HeartPulse,
  User,
  Video,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard Layout — redesigned sidebar and mobile drawer.
 * Role-based nav structure preserved exactly.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = (session?.user as any)?.role || "patient";

  const navigation = {
    patient: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Appointments", href: "/patient/appointments", icon: Calendar },
      { name: "Find Doctors", href: "/patient/doctors", icon: Users },
      { name: "Reminders", href: "/patient/reminders", icon: Clock },
      { name: "Video Call", href: "/patient/video-call", icon: Video },
    ],
    doctor: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "My Schedule", href: "/doctor/schedule", icon: Calendar },
      { name: "Appointments", href: "/doctor/appointments", icon: Clock },
      { name: "My Patients", href: "/doctor/patients", icon: Users },
      { name: "Video Consultation", href: "/doctor/video-call", icon: Video },
    ],
    admin: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Manage Doctors", href: "/admin/doctors", icon: Users },
      { name: "Manage Patients", href: "/admin/patients", icon: Users },
      { name: "All Appointments", href: "/admin/appointments", icon: Calendar },
    ],
  };

  const navItems = navigation[role as keyof typeof navigation] || navigation.patient;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";

  const SidebarLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl text-small font-semibold transition-all duration-200 group relative overflow-hidden",
          isActive
            ? "bg-[#EAF9F9] text-[#176B83]"
            : "text-[#61727A] hover:bg-[#F5F9FA] hover:text-[#17313C]"
        )}
      >
        <item.icon
          className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-[#176B83]" : "text-[#9BA9AE] group-hover:text-[#405762]")}
          strokeWidth={isActive ? 2 : 1.75}
        />
        <span className="flex-1">{item.name}</span>
        {isActive && <ChevronRight className="w-4 h-4 text-[#27A7B5]" strokeWidth={2} />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[rgba(16,50,60,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#176B83] flex items-center justify-center shadow-[0_6px_20px_rgba(23,107,131,0.20)]">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[17px] font-bold text-[#10232D]">HealthEase</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink key={item.name} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 pb-6 space-y-3">
        <div className="px-3 py-2 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 text-center font-medium leading-tight">
          Demo Mode • Doctor profiles are sample data for demonstration.
        </div>
        <div className="p-4 bg-[#F5F9FA] rounded-2xl border border-[rgba(16,50,60,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF9F9] border border-[#CDEFF0] flex items-center justify-center text-[#176B83] font-bold text-small">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small font-bold text-[#17313C] truncate">{session?.user?.name}</p>
              <p className="text-meta text-[#61727A] capitalize">{role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-small font-semibold text-[#D95757] hover:bg-[#FDEEEE] transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-[rgba(16,50,60,0.06)] sticky top-0 h-screen shadow-[4px_0_30px_rgba(16,50,60,0.04)]">
        <SidebarContent />
      </aside>

      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-b border-[rgba(255,255,255,0.5)] px-5 flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#176B83] flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-[16px] text-[#10232D]">HealthEase</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl text-[#405762] hover:bg-[#EEF7F8] transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#10232D]/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-2xl z-50 lg:hidden flex flex-col shadow-[8px_0_40px_rgba(16,50,60,0.12)] border-r border-[rgba(255,255,255,0.7)]"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-[rgba(16,50,60,0.06)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#176B83] flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[17px] font-bold text-[#10232D]">HealthEase</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[#61727A] hover:bg-[#EEF7F8] transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => <SidebarLink key={item.name} item={item} />)}
              </nav>
              <div className="px-4 pb-6 space-y-3 border-t border-[rgba(16,50,60,0.06)] pt-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-2xl bg-[#EAF9F9] border border-[#CDEFF0] flex items-center justify-center text-[#176B83] font-bold text-small">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-small font-bold text-[#17313C]">{session?.user?.name}</p>
                    <p className="text-meta text-[#61727A] capitalize">{role}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-small font-semibold text-[#D95757] hover:bg-[#FDEEEE] transition-all duration-200 w-full"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:p-8 pt-20 lg:pt-0 p-4 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
