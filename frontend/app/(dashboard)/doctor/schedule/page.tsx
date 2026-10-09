"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Video, MapPin, RefreshCw,
} from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#FFF6E6] text-[#D99024] border border-[#FFE5AA]",
  confirmed: "bg-[#EAF8F2] text-[#15966A] border border-[#B8ECCA]",
  completed: "bg-[#EDF5FF] text-[#3677C8] border border-[#C2DEFF]",
  cancelled: "bg-[#FDEEEE] text-[#D95757] border border-[#F5BBBB]",
};

export default function DoctorSchedulePage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfToday());

  const doctorId = (session?.user as any)?.id;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchAppointments = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await api.get(`/appointments/doctor/${doctorId}`);
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Failed to load schedule", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [doctorId]);

  const todayAppts = appointments.filter(a => {
    const d = a.appointment_date?.split("T")[0];
    return d === format(selectedDate, "yyyy-MM-dd");
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch { alert("Failed to update status."); }
  };

  const stats = {
    today: appointments.filter(a => a.appointment_date?.split("T")[0] === format(startOfToday(), "yyyy-MM-dd")).length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-[#10232D]">My Schedule</h1>
          <p className="text-body text-[#61727A] mt-1">View and manage your upcoming appointments.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchAppointments}>
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} /> Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: stats.today, icon: Calendar, color: "bg-[#EAF9F9] text-[#176B83]" },
          { label: "Pending", value: stats.pending, icon: AlertCircle, color: "bg-[#FFF6E6] text-[#D99024]" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "bg-[#EAF8F2] text-[#15966A]" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "bg-[#EDF5FF] text-[#3677C8]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-meta text-[#9BA9AE]">{s.label}</p>
              <p className="text-h3 text-[#10232D]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week Calendar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Week View</CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeekStart(d => addDays(d, -7))}
                    className="p-1.5 rounded-xl text-[#61727A] hover:bg-[#EEF7F8] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setWeekStart(d => addDays(d, 7))}
                    className="p-1.5 rounded-xl text-[#61727A] hover:bg-[#EEF7F8] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {days.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const count = appointments.filter(a => a.appointment_date?.split("T")[0] === dayStr).length;
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, startOfToday());
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-small font-semibold transition-all duration-200 ${
                      isSelected
                        ? "bg-[#176B83] text-white shadow-[0_4px_12px_rgba(23,107,131,0.25)]"
                        : "hover:bg-[#F5F9FA] text-[#405762]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-meta ${isSelected ? "text-white/70" : "text-[#9BA9AE]"}`}>
                        {format(day, "EEE")}
                      </span>
                      <span>{format(day, "MMM d")}</span>
                      {isToday && !isSelected && <span className="text-meta text-[#27A7B5] font-bold">Today</span>}
                    </div>
                    {count > 0 && (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-meta font-bold ${isSelected ? "bg-white/20 text-white" : "bg-[#EAF9F9] text-[#176B83]"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Day Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-card-heading text-[#17313C]">
              {isSameDay(selectedDate, startOfToday()) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
              <span className="text-small font-normal text-[#9BA9AE] ml-2">({todayAppts.length} appointments)</span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
          ) : todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-[#EEF7F8] flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#9BA9AE]" strokeWidth={1.75} />
              </div>
              <p className="text-card-heading text-[#17313C]">No appointments</p>
              <p className="text-small text-[#61727A]">No consultations scheduled for this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {todayAppts.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Time Block */}
                      <div className="min-w-[72px] flex flex-col items-center p-3 bg-[#EAF9F9] rounded-2xl border border-[#CDEFF0]">
                        <Clock className="w-4 h-4 text-[#176B83] mb-1" strokeWidth={2} />
                        <span className="text-small font-bold text-[#176B83]">{app.time_slot}</span>
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-card-heading text-[#17313C]">{app.patient_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {app.type === "video" ? (
                                <span className="flex items-center gap-1 text-meta text-[#3677C8]"><Video className="w-3 h-3" strokeWidth={2} /> Video</span>
                              ) : (
                                <span className="flex items-center gap-1 text-meta text-[#61727A]"><MapPin className="w-3 h-3" strokeWidth={1.75} /> In-Person</span>
                              )}
                              {app.blood_group && <span className="text-meta text-[#9BA9AE]">• Blood: {app.blood_group}</span>}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-meta font-bold uppercase tracking-wider flex-shrink-0 ${STATUS_STYLES[app.status]}`}>
                            {app.status}
                          </span>
                        </div>

                        {app.notes && (
                          <p className="text-small text-[#61727A] bg-[#F5F9FA] rounded-xl px-3 py-2 italic mb-3">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {app.status === "pending" && (
                            <button
                              onClick={() => updateStatus(app.id, "confirmed")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF8F2] text-[#15966A] text-small font-semibold hover:bg-[#D0F0E4] transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Confirm
                            </button>
                          )}
                          {app.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(app.id, "completed")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF5FF] text-[#3677C8] text-small font-semibold hover:bg-[#D0E8FF] transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Mark Done
                            </button>
                          )}
                          {app.status !== "cancelled" && app.status !== "completed" && (
                            <button
                              onClick={() => updateStatus(app.id, "cancelled")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDEEEE] text-[#D95757] text-small font-semibold hover:bg-[#FAD8D8] transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
