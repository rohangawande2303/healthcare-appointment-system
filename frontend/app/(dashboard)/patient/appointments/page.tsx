"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  MoreVertical, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoCall } from "@/components/video/VideoCall";
import { QueueStatus } from "@/components/dashboard/QueueStatus";
import { ReviewForm } from "@/components/dashboard/ReviewForm";

/**
 * Patient Appointments Dashboard
 */
export default function PatientAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<any>(null);

  const fetchAppointments = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(`/appointments/patient/${userId}`);
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

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      alert("Failed to cancel appointment.");
    }
  };

  const upcoming = appointments.filter(a => !isPast(parseISO(`${a.appointment_date}T${a.time_slot}`)) && a.status !== "cancelled");
  const past = appointments.filter(a => isPast(parseISO(`${a.appointment_date}T${a.time_slot}`)) || a.status === "cancelled");

  return (
    <div className="space-y-8">
      {activeCall && (
        <VideoCall 
          roomId={`room_${activeCall.id}`} 
          userId={((session?.user as any)?.id || "").toString()}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your upcoming and past consultations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAppointments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Found"
          description="You haven't booked any appointments yet. Find a doctor to get started."
          actionLabel="Find a Doctor"
          onAction={() => window.location.href = "/patient/doctors"}
        />
      ) : (
        <div className="space-y-12">
          {/* Upcoming Appointments */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upcoming Visits</h2>
            </div>

            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {upcoming.map((app) => (
                    <div key={app.id} className="space-y-4">
                      <AppointmentCard 
                        appointment={app} 
                        isUpcoming 
                        onCancel={() => handleCancel(app.id)} 
                        onJoinCall={() => setActiveCall(app)}
                      />
                      {app.status === 'confirmed' && (
                        <QueueStatus doctorId={app.doctor_id} appointmentId={app.id} />
                      )}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-slate-500 bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                No upcoming appointments scheduled.
              </p>
            )}
          </section>

          {/* Past Appointments */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Past & Completed</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {past.map((app) => (
                <div key={app.id} className="space-y-4">
                  <AppointmentCard appointment={app} />
                  {app.status === 'completed' && (
                    <ReviewForm doctorId={app.doctor_id} appointmentId={app.id} />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, isUpcoming, onCancel, onJoinCall }: { appointment: any, isUpcoming?: boolean, onCancel?: () => void, onJoinCall?: () => void }) {
  const statusColors: any = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  // Safely extract YYYY-MM-DD from the date string/object
  const datePart = appointment.appointment_date.split('T')[0];
  const dateObj = parseISO(`${datePart}T${appointment.time_slot}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Card className="border-slate-200 hover:border-blue-200 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {appointment.type === "video" ? <Video className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Dr. {appointment.doctor_name}</h3>
                <p className="text-sm text-slate-500">{appointment.specialty}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[appointment.status]}`}>
              {appointment.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Date</p>
              <p className="text-sm font-bold text-slate-900">{format(parseISO(appointment.appointment_date), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Time Slot</p>
              <p className="text-sm font-bold text-slate-900">{appointment.time_slot}</p>
            </div>
          </div>

          {isUpcoming && appointment.status !== "cancelled" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Clock className="w-4 h-4" />
                  Starts in {formatDistanceToNow(dateObj)}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                </div>
              </div>
              
              {appointment.type === "video" && appointment.status === "confirmed" && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onJoinCall}>
                  <Video className="w-4 h-4 mr-2" />
                  Join Video Consultation
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
