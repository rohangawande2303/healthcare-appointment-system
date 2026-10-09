"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Users, Search, Calendar, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { format, parseISO } from "date-fns";

interface PatientRecord {
  id: number;
  name: string;
  blood_group: string;
  lastVisit: string;
  totalVisits: number;
  status: string;
}

export default function DoctorPatientsPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const doctorId = (session?.user as any)?.id;

  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorId) return;
      setLoading(true);
      try {
        const res = await api.get(`/appointments/doctor/${doctorId}`);
        const appointments: any[] = res.data.data || [];

        // Group by patient
        const map: Record<number, PatientRecord> = {};
        appointments.forEach(a => {
          if (!map[a.patient_id]) {
            map[a.patient_id] = {
              id: a.patient_id,
              name: a.patient_name,
              blood_group: a.blood_group || "—",
              lastVisit: a.appointment_date,
              totalVisits: 0,
              status: a.status,
            };
          }
          map[a.patient_id].totalVisits += 1;
          if (new Date(a.appointment_date) > new Date(map[a.patient_id].lastVisit)) {
            map[a.patient_id].lastVisit = a.appointment_date;
            map[a.patient_id].status = a.status;
          }
        });
        setPatients(Object.values(map));
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [doctorId]);

  const filtered = search
    ? patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : patients;

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-[#10232D]">My Patients</h1>
        <p className="text-body text-[#61727A] mt-1">All patients who have consulted with you.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Patients", value: patients.length, icon: Users, color: "bg-[#EAF9F9] text-[#176B83]" },
          { label: "Total Appointments", value: patients.reduce((s, p) => s + p.totalVisits, 0), icon: Calendar, color: "bg-[#EDF5FF] text-[#3677C8]" },
          { label: "Completed Cases", value: patients.filter(p => p.status === "completed").length, icon: Activity, color: "bg-[#EAF8F2] text-[#15966A]" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA9AE]" strokeWidth={2} />
        <input
          placeholder="Search patients..."
          className="w-full h-12 pl-11 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-[#EEF7F8] flex items-center justify-center">
            <Users className="w-7 h-7 text-[#9BA9AE]" strokeWidth={1.75} />
          </div>
          <p className="text-card-heading text-[#17313C]">No patients yet</p>
          <p className="text-small text-[#61727A]">Your patients will appear here after their first appointment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(16,50,60,0.06)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#27A7B5]" strokeWidth={1.75} />
            <span className="text-small font-bold text-[#17313C]">All Patients ({filtered.length})</span>
          </div>
          <div className="divide-y divide-[rgba(16,50,60,0.05)]">
            {filtered.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F9FA] transition-colors"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#EAF9F9] border border-[#CDEFF0] flex items-center justify-center text-[#176B83] font-bold text-small flex-shrink-0">
                  {patient.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-[#17313C]">{patient.name}</p>
                  <p className="text-meta text-[#9BA9AE]">Blood Group: {patient.blood_group}</p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-meta text-[#9BA9AE]">Last Visit</p>
                    <p className="text-small font-semibold text-[#17313C]">
                      {patient.lastVisit ? format(parseISO(patient.lastVisit.split("T")[0]), "MMM d, yyyy") : "—"}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-meta text-[#9BA9AE]">Visits</p>
                    <p className="text-small font-bold text-[#17313C]">{patient.totalVisits}</p>
                  </div>
                  <Badge variant={patient.status === "completed" ? "success" : patient.status === "cancelled" ? "error" : "info"}>
                    {patient.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
