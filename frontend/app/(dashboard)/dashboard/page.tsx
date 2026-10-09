"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Heart,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard Overview Page — redesigned with brand color stat cards,
 * clean appointment cards, and generous spacing.
 * Role-based logic unchanged.
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <DashboardLoading />;

  const user = session?.user;
  const role = (user as any)?.role || "patient";

  const patientStats = [
    { icon: Calendar, title: "Upcoming", value: "2", color: "teal" },
    { icon: Activity, title: "Health Score", value: "85%", color: "success" },
    { icon: Clock, title: "Reminders", value: "4 Today", color: "warning" },
    { icon: Heart, title: "Blood Group", value: "O+", color: "error" },
  ];
  const doctorStats = [
    { icon: Users, title: "Total Patients", value: "1,240", color: "teal" },
    { icon: Calendar, title: "Today's Apt.", value: "12", color: "info" },
    { icon: TrendingUp, title: "Revenue", value: "₹45,200", color: "success" },
    { icon: Activity, title: "Queue", value: "3 Waiting", color: "warning" },
  ];
  const adminStats = [
    { icon: Users, title: "Total Doctors", value: "48", color: "teal" },
    { icon: Users, title: "Total Patients", value: "5,200", color: "info" },
    { icon: Calendar, title: "Total Bookings", value: "12,400", color: "success" },
    { icon: Activity, title: "System Status", value: "Healthy", color: "success" },
  ];

  const stats =
    role === "doctor" ? doctorStats : role === "admin" ? adminStats : patientStats;

  const firstName = user?.name?.split(" ")[0] || "User";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-[#10232D]">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-body text-[#61727A] mt-1">
            Here&apos;s what&apos;s happening with your health today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] text-small font-semibold text-[#405762]">
          <Calendar className="w-4 h-4 text-[#27A7B5]" strokeWidth={2} />
          {today}
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/patient/appointments">
                <Button variant="ghost" size="sm" className="text-[#176B83]">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#EAF9F9] flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-[#27A7B5]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-card-heading text-[#17313C] font-semibold">No appointments scheduled</p>
                  <p className="text-small text-[#61727A] mt-1">Your upcoming appointments will appear here.</p>
                </div>
                {role === "patient" && (
                  <Link href="/patient/doctors">
                    <Button size="sm" className="mt-2">
                      Find a Doctor <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#27A7B5] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-small font-semibold text-[#17313C]">Activity {i}</p>
                    <p className="text-meta text-[#9BA9AE]">2 hours ago</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {role === "patient" && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Link href="/patient/doctors" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#EAF9F9] text-[#176B83] text-small font-semibold hover:bg-[#CDEFF0] transition-colors duration-200">
                    <Users className="w-4 h-4" strokeWidth={2} />
                    Find a Doctor
                    <ArrowRight className="w-4 h-4 ml-auto" strokeWidth={2} />
                  </button>
                </Link>
                <Link href="/patient/appointments" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#EEF7F8] text-[#405762] text-small font-semibold hover:bg-[#DCE7E9] transition-colors duration-200">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    My Appointments
                    <ArrowRight className="w-4 h-4 ml-auto" strokeWidth={2} />
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const colorMap: Record<string, { icon: string; bg: string }> = {
  teal:    { icon: "text-[#176B83]", bg: "bg-[#EAF9F9]" },
  success: { icon: "text-[#15966A]", bg: "bg-[#EAF8F2]" },
  warning: { icon: "text-[#D99024]", bg: "bg-[#FFF6E6]" },
  error:   { icon: "text-[#D95757]", bg: "bg-[#FDEEEE]" },
  info:    { icon: "text-[#3677C8]", bg: "bg-[#EDF5FF]" },
};

function StatCard({ icon: Icon, title, value, color }: any) {
  const { icon: iconColor, bg } = colorMap[color] || colorMap.teal;
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-small text-[#61727A] font-medium">{title}</p>
              <p className="text-h3 text-[#10232D]">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-5 w-52" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[380px] rounded-3xl" />
        <Skeleton className="h-[380px] rounded-3xl" />
      </div>
    </div>
  );
}
