"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Video,
  X,
  ArrowRight,
  Navigation,
  Globe,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
];

const SPECIALTIES = [
  "All",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Neurology",
  "General Medicine",
  "Gynecology",
  "Psychiatry",
  "ENT",
  "Ophthalmology",
  "Gastroenterology",
  "Oncology",
];

/**
 * Doctor Listing Page — Location-aware specialist discovery.
 * Supports Search by City, Near Me (GPS distance calculation),
 * Specialty filters, pagination, and sample demo data disclosure.
 */
export default function DoctorListingPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [specialty, setSpecialty] = useState("All");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 9, totalPages: 1 });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        specialty: specialty === "All" ? undefined : specialty,
        search: search || undefined,
        city: selectedCity === "All Cities" ? undefined : selectedCity,
      };

      if (userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }

      const response = await api.get("/doctors", { params });
      setDoctors(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, specialty, search, selectedCity, userCoords]);

  useEffect(() => {
    const timer = setTimeout(fetchDoctors, 250);
    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  // Handle "Near Me" GPS location trigger
  const handleNearMe = () => {
    if (userCoords) {
      setUserCoords(null); // Toggle off
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
      (err) => {
        console.warn("Geolocation denied or error:", err.message);
        // Default to Mumbai coordinates as a fallback demo location
        setUserCoords({ lat: 19.0760, lng: 72.8777 });
        setLocating(false);
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-8 py-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-[#10232D]">Find Your Specialist</h1>
          <p className="text-body text-[#61727A] mt-1">
            Over 120+ verified specialists across 10 major cities with live appointment booking.
          </p>
        </div>
        <button
          onClick={handleNearMe}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-small font-semibold transition-all duration-200 border ${
            userCoords
              ? "bg-[#176B83] text-white border-[#176B83] shadow-[0_6px_20px_rgba(23,107,131,0.25)]"
              : "bg-white text-[#405762] border-[#DCE7E9] hover:border-[#27A7B5]"
          }`}
        >
          <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} strokeWidth={2} />
          {locating ? "Locating..." : userCoords ? "Near Me Active (GPS)" : "Near Me"}
        </button>
      </div>

      {/* Search and City Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA9AE]" strokeWidth={2} />
          <input
            placeholder="Search by doctor name, qualification, or condition..."
            className="w-full h-12 pl-11 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </div>

        {/* City Filter Dropdown */}
        <div className="relative sm:w-56">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#176B83]" strokeWidth={2} />
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full h-12 pl-11 pr-8 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] font-medium text-[#10232D] focus:outline-none focus:border-[#27A7B5] transition-all duration-200 appearance-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="flex items-center gap-2 h-12 px-5 rounded-[14px] border border-[#DCE7E9] bg-white text-small font-semibold text-[#405762] hover:border-[#9DE1E1] hover:text-[#176B83] transition-all duration-200 sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
          Filters
        </button>
      </div>

      {/* Specialty Chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            onClick={() => {
              setSpecialty(spec);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-5 py-2 rounded-full text-small font-semibold whitespace-nowrap transition-all duration-200 ${
              specialty === spec
                ? "bg-[#176B83] text-white shadow-[0_6px_20px_rgba(23,107,131,0.20)]"
                : "bg-white text-[#61727A] border border-[#DCE7E9] hover:border-[#9DE1E1] hover:text-[#176B83]"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Result Count and Active Filters */}
      <div className="flex items-center justify-between text-small text-[#61727A]">
        {!loading && (
          <p>
            Showing {doctors.length} of {pagination.total} doctors
            {selectedCity !== "All Cities" && ` in ${selectedCity}`}
            {specialty !== "All" && ` • ${specialty}`}
            {userCoords && ` • Sorted by nearest`}
          </p>
        )}
        {(selectedCity !== "All Cities" || specialty !== "All" || userCoords || search) && (
          <button
            onClick={() => {
              setSelectedCity("All Cities");
              setSpecialty("All");
              setSearch("");
              setUserCoords(null);
            }}
            className="text-[#176B83] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          variant="doctors"
          description={`No specialists found in ${selectedCity} for "${search || specialty}".`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setSelectedCity("All Cities");
            setSpecialty("All");
            setUserCoords(null);
          }}
        />
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center pt-6 gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            className="p-2.5 rounded-2xl border border-[#DCE7E9] bg-white text-[#405762] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#176B83]"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {Array.from({ length: Math.min(6, pagination.totalPages) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                className={`w-10 h-10 rounded-2xl text-small font-bold transition-all duration-200 ${
                  pagination.page === pageNum
                    ? "bg-[#176B83] text-white shadow-[0_6px_20px_rgba(23,107,131,0.20)]"
                    : "bg-white text-[#61727A] border border-[#DCE7E9] hover:border-[#9DE1E1]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {pagination.totalPages > 6 && (
            <span className="text-[#9BA9AE] font-bold px-1">...</span>
          )}

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="p-2.5 rounded-2xl border border-[#DCE7E9] bg-white text-[#405762] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#176B83]"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Demo Data Disclaimer Footer Banner */}
      <div className="p-4 bg-[#F5F9FA] rounded-2xl border border-[rgba(16,50,60,0.06)] flex items-center justify-center gap-2 text-center text-meta text-[#61727A]">
        <Info className="w-4 h-4 text-[#176B83] flex-shrink-0" />
        <span>
          Doctor profiles, consultation fees, and schedules are sample data generated for demonstration purposes. Real clinic locations sourced via OpenStreetMap.
        </span>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 bg-[#10232D]/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl rounded-t-[32px] p-6 shadow-[0_-20px_60px_rgba(16,50,60,0.12)] border-t border-[rgba(255,255,255,0.7)] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-card-heading text-[#17313C]">Filter Specialists</h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-2 rounded-xl text-[#61727A] hover:bg-[#EEF7F8] transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-small font-semibold text-[#17313C] mb-2 block">City</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCity(c)}
                        className={`px-4 py-2 rounded-full text-small font-semibold transition-all duration-200 ${
                          selectedCity === c
                            ? "bg-[#176B83] text-white"
                            : "bg-[#EEF7F8] text-[#61727A] hover:bg-[#EAF9F9]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-small font-semibold text-[#17313C] mb-2 block">Specialty</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSpecialty(spec)}
                        className={`px-4 py-2 rounded-full text-small font-semibold transition-all duration-200 ${
                          specialty === spec
                            ? "bg-[#176B83] text-white"
                            : "bg-[#EEF7F8] text-[#61727A] hover:bg-[#EAF9F9]"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 h-12"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Apply Filters
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: any }) {
  const displayRating = doctor.rating ? Number(doctor.rating).toFixed(1) : "4.8";
  const distanceVal = doctor.distance_km ?? doctor.distance;
  const displayDistance = distanceVal !== undefined && distanceVal !== null ? `${distanceVal} km away` : null;

  return (
    <div className="group bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_12px_35px_rgba(16,50,60,0.07)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(16,50,60,0.12)] hover:border-[#9DE1E1] transition-all duration-300 ease-out flex flex-col h-full overflow-hidden">
      {/* Card Top */}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          {/* Doctor Avatar */}
          <div className="w-[72px] h-[72px] rounded-[20px] bg-[#EAF9F9] flex items-center justify-center text-[#176B83] border border-[#CDEFF0]">
            <Stethoscope className="w-8 h-8" strokeWidth={1.75} />
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FFF6E6] rounded-full">
            <Star className="w-3.5 h-3.5 fill-[#D99024] text-[#D99024]" />
            <span className="text-meta font-bold text-[#D99024]">{displayRating}</span>
          </div>
        </div>

        <h3 className="text-card-heading text-[#17313C] group-hover:text-[#176B83] transition-colors duration-200 mb-1">
          {doctor.name}
        </h3>
        <p className="text-small font-semibold text-[#27A7B5] mb-3">{doctor.specialty}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-small text-[#61727A]">
            <MapPin className="w-4 h-4 text-[#9BA9AE] mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <span className="line-clamp-1">{doctor.location || `${doctor.city || "Mumbai"}, India`}</span>
          </div>
          {displayDistance && (
            <div className="flex items-center gap-2 text-meta font-semibold text-[#15966A]">
              <Navigation className="w-3.5 h-3.5 text-[#15966A]" strokeWidth={2} />
              {displayDistance}
            </div>
          )}
          <div className="flex items-center gap-2 text-small text-[#61727A]">
            <Clock className="w-4 h-4 text-[#9BA9AE] flex-shrink-0" strokeWidth={1.75} />
            {doctor.experience} Years Experience
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="success">Available Today</Badge>
          <Badge variant="default">
            <Video className="w-3 h-3" strokeWidth={2} />
            Video
          </Badge>
          {doctor.city && (
            <span className="text-meta px-2.5 py-0.5 rounded-full bg-[#F5F9FA] text-[#61727A] border border-[rgba(16,50,60,0.06)]">
              {doctor.city}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-[#F5F9FA] border-t border-[rgba(16,50,60,0.06)] flex items-center justify-between">
        <div>
          <p className="text-meta text-[#9BA9AE]">Consultation fee</p>
          <p className="text-card-heading text-[#10232D]">
            ₹{doctor.consultation_fee}
          </p>
        </div>
        <Link href={`/patient/doctors/${doctor.id}`}>
          <Button size="sm">
            Book Now
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] p-6 shadow-[0_4px_16px_rgba(16,50,60,0.05)]">
      <div className="flex items-start justify-between mb-5">
        <Skeleton className="w-[72px] h-[72px] rounded-[20px]" />
        <Skeleton className="w-14 h-7 rounded-full" />
      </div>
      <Skeleton className="h-6 w-48 mb-2 rounded-2xl" />
      <Skeleton className="h-4 w-32 mb-5 rounded-xl" />
      <Skeleton className="h-4 w-40 mb-2 rounded-xl" />
      <Skeleton className="h-4 w-36 rounded-xl" />
      <div className="mt-6 pt-4 border-t border-[rgba(16,50,60,0.06)] flex items-center justify-between">
        <Skeleton className="h-8 w-20 rounded-2xl" />
        <Skeleton className="h-9 w-28 rounded-[14px]" />
      </div>
    </div>
  );
}
