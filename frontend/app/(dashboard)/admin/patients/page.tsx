"use client";

import React, { useState, useEffect } from "react";
import {
  Users, Search, Mail, UserCheck, UserX,
  RefreshCw, Phone, Calendar, Activity, TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function AdminPatientsPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Get all appointments grouped by patient — gives us patient data
      const res = await api.get("/appointments", { params: { limit: 500 } });
      const appointments = res.data.data || [];
      // Deduplicate patients from appointments
      const patientMap: Record<string, any> = {};
      appointments.forEach((a: any) => {
        if (!patientMap[a.patient_id]) {
          patientMap[a.patient_id] = {
            id: a.patient_id,
            name: a.patient_name,
            blood_group: a.blood_group,
            appointments: 0,
          };
        }
        patientMap[a.patient_id].appointments += 1;
      });
      const list = Object.values(patientMap);
      if (search) {
        setPatients(list.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase())));
      } else {
        setPatients(list);
      }
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchPatients, 300);
    return () => clearTimeout(t);
  }, [search]);

  const stats = [
    { label: "Total Patients", value: patients.length, icon: Users, color: "bg-[#EAF9F9] text-[#176B83]" },
    { label: "Appointments Made", value: patients.reduce((s: number, p: any) => s + (p.appointments || 0), 0), icon: Calendar, color: "bg-[#EDF5FF] text-[#3677C8]" },
    { label: "Active Today", value: "—", icon: Activity, color: "bg-[#EAF8F2] text-[#15966A]" },
    { label: "New This Month", value: "—", icon: TrendingUp, color: "bg-[#FFF6E6] text-[#D99024]" },
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-[#10232D]">Manage Patients</h1>
          <p className="text-body text-[#61727A] mt-1">View all registered patients and their activity.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPatients}>
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
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
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#EEF7F8] flex items-center justify-center">
            <Users className="w-8 h-8 text-[#9BA9AE]" strokeWidth={1.75} />
          </div>
          <p className="text-card-heading text-[#17313C]">No patients found</p>
          <p className="text-small text-[#61727A]">
            Patients appear here once they book their first appointment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] overflow-hidden">
          <div className="p-5 border-b border-[rgba(16,50,60,0.06)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#27A7B5]" strokeWidth={1.75} />
            <span className="text-small font-bold text-[#17313C]">All Patients ({patients.length})</span>
          </div>
          <div className="divide-y divide-[rgba(16,50,60,0.05)]">
            {patients.map((patient: any, i: number) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F9FA] transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#EAF9F9] border border-[#CDEFF0] flex items-center justify-center text-[#176B83] font-bold text-small flex-shrink-0">
                  {patient.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-[#17313C] truncate">{patient.name}</p>
                  <p className="text-meta text-[#9BA9AE]">{patient.blood_group ? `Blood: ${patient.blood_group}` : "No profile data"}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-meta text-[#9BA9AE]">Appointments</p>
                    <p className="text-small font-bold text-[#17313C]">{patient.appointments}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
