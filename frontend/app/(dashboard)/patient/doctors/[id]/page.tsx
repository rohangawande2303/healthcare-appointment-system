"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  Stethoscope,
  Calendar,
  Info,
  MessageSquare,
  ShieldCheck,
  Award,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingFlow } from "@/components/booking/BookingFlow";

/**
 * Doctor Profile Page — redesigned with premium header card, tabbed layout.
 * All data fetching, tab navigation, and BookingFlow integration unchanged.
 */
export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get(`/doctors/${id}`);
        setDoctor(response.data.data);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  if (loading) return <ProfileLoading />;
  if (!doctor) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#FDEEEE] flex items-center justify-center">
        <Stethoscope className="w-8 h-8 text-[#D95757]" strokeWidth={1.75} />
      </div>
      <p className="text-card-heading text-[#17313C]">Doctor not found</p>
      <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "booking", label: "Book Appointment", icon: Calendar },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 py-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-small text-[#61727A] hover:text-[#176B83] transition-colors font-semibold group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
        Back to Specialists
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Doctor Info Card */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <Card className="overflow-hidden">
            {/* Card Banner */}
            <div
              className="h-28 w-full"
              style={{ background: "linear-gradient(135deg, #123C52 0%, #176B83 60%, #27A7B5 100%)" }}
            />
            {/* Avatar & Info */}
            <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[24px] bg-white p-2 shadow-[0_12px_35px_rgba(16,50,60,0.15)] mb-4">
                <div className="w-full h-full rounded-[20px] bg-[#EAF9F9] flex items-center justify-center text-[#176B83]">
                  <Stethoscope className="w-10 h-10" strokeWidth={1.75} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h1 className="text-card-heading text-[#10232D]">Dr. {doctor.name}</h1>
                <ShieldCheck className="w-4 h-4 text-[#27A7B5] flex-shrink-0" strokeWidth={2} />
              </div>
              <p className="text-small font-semibold text-[#27A7B5] mb-5">{doctor.specialty}</p>

              <div className="flex justify-around w-full border-t border-[rgba(16,50,60,0.06)] pt-5 gap-4">
                <div className="text-center">
                  <p className="text-h3 text-[#10232D]">{doctor.experience}+</p>
                  <p className="text-meta text-[#61727A] uppercase tracking-wider">Exp. Yrs</p>
                </div>
                <div className="w-px bg-[rgba(16,50,60,0.07)]" />
                <div className="text-center">
                  <p className="text-h3 text-[#10232D]">4.8</p>
                  <div className="flex items-center justify-center gap-1 text-meta text-[#61727A] uppercase tracking-wider">
                    <Star className="w-3 h-3 fill-[#D99024] text-[#D99024]" />
                    Rating
                  </div>
                </div>
                <div className="w-px bg-[rgba(16,50,60,0.07)]" />
                <div className="text-center">
                  <p className="text-h3 text-[#10232D]">1.2k</p>
                  <p className="text-meta text-[#61727A] uppercase tracking-wider">Patients</p>
                </div>
              </div>

              <div className="w-full mt-5 pt-5 border-t border-[rgba(16,50,60,0.06)] space-y-3 text-left">
                <div className="flex items-center gap-2 text-small text-[#61727A]">
                  <MapPin className="w-4 h-4 text-[#9BA9AE]" strokeWidth={1.75} />
                  Hitech Medical Center, Mumbai
                </div>
                <div className="flex items-center gap-2 text-small text-[#61727A]">
                  <Clock className="w-4 h-4 text-[#9BA9AE]" strokeWidth={1.75} />
                  Mon–Sat, 9 AM – 6 PM
                </div>
              </div>

              <div className="flex gap-2 mt-5 w-full">
                <Badge variant="success" className="flex-1 justify-center">Available</Badge>
                <Badge variant="default" className="flex-1 justify-center">
                  <Video className="w-3 h-3" strokeWidth={2} /> Video
                </Badge>
              </div>

              <div className="w-full mt-5 p-4 bg-[#F5F9FA] rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-meta text-[#9BA9AE]">Consultation Fee</p>
                  <p className="text-card-heading text-[#10232D]">₹{doctor.consultation_fee}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("booking")}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabs & Content */}
        <div className="flex-1 w-full space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-1.5 p-1.5 bg-[#EEF7F8] rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-small font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-[#176B83] shadow-[0_4px_16px_rgba(16,50,60,0.07)]"
                    : "text-[#61727A] hover:text-[#17313C]"
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={activeTab === tab.id ? 2 : 1.75} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>About Dr. {doctor.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-6">
                    <p className="text-body text-[#405762] leading-relaxed">
                      {doctor.bio ||
                        `Dr. ${doctor.name} is a highly experienced ${doctor.specialty} specialist with over ${doctor.experience} years of dedicated practice. Known for compassionate, evidence-based care, they have helped thousands of patients achieve better health outcomes.`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-[rgba(16,50,60,0.06)]">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#EAF9F9] text-[#176B83] flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-meta text-[#9BA9AE] uppercase tracking-wider mb-1">Qualifications</p>
                          <p className="text-small font-semibold text-[#17313C]">{doctor.qualification}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#EAF9F9] text-[#176B83] flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-meta text-[#9BA9AE] uppercase tracking-wider mb-1">Clinic Address</p>
                          <p className="text-small font-semibold text-[#17313C]">Hitech Medical Center, West Mumbai</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "booking" && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <BookingFlow doctor={doctor} />
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)]">
                  <div className="w-16 h-16 rounded-3xl bg-[#EEF7F8] flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-[#9BA9AE]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-card-heading text-[#17313C]">No Reviews Yet</h3>
                    <p className="text-small text-[#61727A] mt-1">Be the first to leave a review after your appointment!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="space-y-8 py-8">
      <Skeleton className="h-5 w-36 rounded-xl" />
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="w-full lg:w-72 h-[520px] rounded-3xl" />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-14 w-80 rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
