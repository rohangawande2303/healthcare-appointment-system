"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { VideoCall } from "@/components/video/VideoCall";

/**
 * Doctor Appointments Dashboard
 */
export default function DoctorAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeCall, setActiveCall] = useState<any>(null);

  const fetchAppointments = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(`/appointments/doctor/${userId}`);
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [session]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const filtered = appointments.filter(a => {
    const datePart = a.appointment_date.split('T')[0];
    return datePart === filterDate;
  });

  return (
    <div className="space-y-8">
      {activeCall && (
        <VideoCall 
          roomId={`room_${activeCall.id}`} 
          userId={((session?.user as any)?.id || "").toString()}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Schedule</h1>
          <p className="text-slate-500 mt-1">Manage your patients and consultations for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-48 bg-white border-slate-200"
          />
          <Button variant="outline" size="sm" onClick={fetchAppointments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="appointments"
          title="No Appointments Scheduled"
          description={`You have no appointments scheduled for ${format(parseISO(filterDate), "MMMM d, yyyy")}.`}
        />
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filtered.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Time Slot Sidebar */}
                    <div className="md:w-32 bg-slate-50 p-6 flex flex-col items-center justify-center border-r border-slate-100">
                      <Clock className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="font-bold text-slate-900">{app.time_slot}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Slot</p>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{app.patient_name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="capitalize">{app.type} Consultation</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{app.blood_group} Blood Group</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      {app.notes && (
                        <div className="mb-6 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                          "{app.notes}"
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {app.status === "pending" && (
                          <Button size="sm" onClick={() => updateStatus(app.id, "confirmed")}>
                            Confirm
                          </Button>
                        )}
                        {app.status === "confirmed" && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(app.id, "completed")}>
                            Mark Completed
                          </Button>
                        )}
                        {app.status !== "cancelled" && app.status !== "completed" && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => updateStatus(app.id, "cancelled")}>
                            Cancel
                          </Button>
                        )}
                        {app.type === "video" && app.status === "confirmed" && (
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setActiveCall(app)}>
                            <Video className="w-4 h-4 mr-2" />
                            Start Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
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
    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status]}`}>
      {status}
    </div>
  );
}
