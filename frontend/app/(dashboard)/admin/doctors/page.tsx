"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope, Search, Star, ShieldCheck, ShieldOff,
  ChevronRight, RefreshCw, Users, TrendingUp, Award, Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: "bg-[#FDEEEE] text-[#D95757]",
  Pediatrics: "bg-[#F1EFFF] text-[#8176D9]",
  Orthopedics: "bg-[#EAF8F2] text-[#15966A]",
  Dermatology: "bg-[#FFF6E6] text-[#D99024]",
  Neurology: "bg-[#EDF5FF] text-[#3677C8]",
  "General Medicine": "bg-[#EAF9F9] text-[#176B83]",
  default: "bg-[#EEF7F8] text-[#405762]",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const specialties = ["All", ...Array.from(new Set(doctors.map(d => d.specialty)))];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (specialty !== "All") params.specialty = specialty;
      if (search) params.search = search;
      const res = await api.get("/doctors", { params });
      setDoctors(res.data.data);
      setPagination(p => ({ ...p, total: res.data.pagination.total }));
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(t);
  }, [search, specialty, pagination.page]);

  const toggleVerify = async (doctor: any) => {
    try {
      // PATCH /api/doctors/:id/verify — updates is_verified
      await api.patch(`/doctors/${doctor.id}/verify`, { is_verified: !doctor.is_verified });
      setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, is_verified: !d.is_verified } : d));
    } catch {
      alert("Could not update verification status.");
    }
  };

  const stats = [
    { label: "Total Doctors", value: pagination.total, icon: Users, color: "teal" },
    { label: "Verified", value: doctors.filter(d => d.is_verified).length, icon: ShieldCheck, color: "success" },
    { label: "Specialties", value: new Set(doctors.map(d => d.specialty)).size, icon: Award, color: "info" },
    { label: "Avg. Experience", value: doctors.length ? `${Math.round(doctors.reduce((s, d) => s + d.experience, 0) / doctors.length)}y` : "—", icon: TrendingUp, color: "warning" },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-[#EAF9F9] text-[#176B83]",
    success: "bg-[#EAF8F2] text-[#15966A]",
    info: "bg-[#EDF5FF] text-[#3677C8]",
    warning: "bg-[#FFF6E6] text-[#D99024]",
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-[#10232D]">Manage Doctors</h1>
          <p className="text-body text-[#61727A] mt-1">View, verify, and manage all registered doctors.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDoctors}>
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colorMap[s.color]}`}>
              <s.icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-meta text-[#9BA9AE]">{s.label}</p>
              <p className="text-h3 text-[#10232D]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA9AE]" strokeWidth={2} />
          <input
            placeholder="Search by doctor name..."
            className="w-full h-12 pl-11 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-12 px-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#405762] focus:outline-none focus:border-[#27A7B5] transition-all duration-200 sm:w-52"
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
        >
          {specialties.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-3xl" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#EAF9F9] flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-[#27A7B5]" strokeWidth={1.75} />
          </div>
          <p className="text-card-heading text-[#17313C]">No doctors found</p>
          <p className="text-small text-[#61727A]">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {doctors.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] hover:shadow-[0_12px_35px_rgba(16,50,60,0.10)] hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[18px] bg-[#EAF9F9] border border-[#CDEFF0] flex items-center justify-center text-[#176B83] flex-shrink-0">
                      <Stethoscope className="w-7 h-7" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-card-heading text-[#17313C] truncate">Dr. {doc.name}</h3>
                        {doc.is_verified && <ShieldCheck className="w-4 h-4 text-[#27A7B5] flex-shrink-0" strokeWidth={2} />}
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-meta font-semibold ${SPECIALTY_COLORS[doc.specialty] || SPECIALTY_COLORS.default}`}>
                        {doc.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#D99024] text-[#D99024]" />
                      <span className="text-meta font-bold text-[#D99024]">4.8</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-small">
                    <div className="bg-[#F5F9FA] rounded-xl p-3">
                      <p className="text-meta text-[#9BA9AE]">Experience</p>
                      <p className="font-bold text-[#17313C]">{doc.experience} Years</p>
                    </div>
                    <div className="bg-[#F5F9FA] rounded-xl p-3">
                      <p className="text-meta text-[#9BA9AE]">Fee</p>
                      <p className="font-bold text-[#17313C]">₹{doc.consultation_fee}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-small text-[#61727A]">
                    <Mail className="w-3.5 h-3.5 text-[#9BA9AE]" strokeWidth={1.75} />
                    <span className="truncate">{doc.email}</span>
                  </div>

                  {/* Qualification */}
                  <p className="text-small text-[#61727A] line-clamp-1">{doc.qualification}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[rgba(16,50,60,0.06)]">
                    <button
                      onClick={() => toggleVerify(doc)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-small font-semibold transition-all duration-200 ${
                        doc.is_verified
                          ? "bg-[#EAF8F2] text-[#15966A] hover:bg-[#D0F0E4]"
                          : "bg-[#EEF7F8] text-[#405762] hover:bg-[#EAF9F9] hover:text-[#176B83]"
                      }`}
                    >
                      {doc.is_verified ? <ShieldCheck className="w-4 h-4" strokeWidth={2} /> : <ShieldOff className="w-4 h-4" strokeWidth={1.75} />}
                      {doc.is_verified ? "Verified" : "Mark Verified"}
                    </button>
                    <Badge variant={doc.is_verified ? "success" : "warning"}>
                      {doc.is_verified ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Result Count */}
      {!loading && doctors.length > 0 && (
        <p className="text-small text-[#9BA9AE] text-center">Showing {doctors.length} of {pagination.total} doctors</p>
      )}
    </div>
  );
}
