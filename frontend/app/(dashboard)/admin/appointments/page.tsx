"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Stethoscope, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Activity,
  Download
} from "lucide-react";
import { format, parseISO } from "date-fns";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Admin Appointments Page
 * 
 * Features:
 * - Global list of all appointments
 * - Filter by status
 * - Search by doctor or patient name
 * - Statistical summary cards
 */
export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await api.get("/appointments");
        setAppointments(response.data.data);
      } catch (error) {
        console.error("Failed to fetch all appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = appointments.filter(app => {
    const matchesSearch = 
      app.doctor_name.toLowerCase().includes(search.toLowerCase()) || 
      app.patient_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === "completed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Appointments</h1>
          <p className="text-slate-500 mt-1">Monitor and manage all consultations across the platform.</p>
        </div>
        <Button className="bg-blue-600">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title="Total Bookings" value={stats.total} color="blue" icon={Activity} />
        <StatItem title="Completed" value={stats.completed} color="emerald" icon={CheckCircle2} />
        <StatItem title="Pending" value={stats.pending} color="amber" icon={Activity} />
        <StatItem title="Cancelled" value={stats.cancelled} color="red" icon={XCircle} />
      </div>

      {/* Filters & Table */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search doctor or patient..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{app.patient_name}</td>
                    <td className="px-6 py-4 text-slate-600">Dr. {app.doctor_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{app.specialty}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">
                        {format(parseISO(app.appointment_date.split('T')[0]), "MMMM d, yyyy")}
                      </div>
                      <div className="text-xs text-slate-400">{app.time_slot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm capitalize">
                        {app.type}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatItem({ title, value, color, icon: Icon }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${colors[status]}`}>
      {status}
    </div>
  );
}
