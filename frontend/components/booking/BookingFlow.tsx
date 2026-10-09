"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Video,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  CreditCard,
  Phone,
  Clock,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import confetti from "canvas-confetti";

declare global {
  interface Window { Razorpay: any; }
}

interface BookingFlowProps {
  doctor: any;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, label: "Date & Time" },
  { id: 2, label: "Consultation Type" },
  { id: 3, label: "Review & Pay" },
];

/**
 * BookingFlow Component — redesigned with premium step progress,
 * glass summary panel, consultation type cards, and soft success screen.
 * All payment, API, and booking logic unchanged.
 */
export const BookingFlow = ({ doctor, onSuccess }: BookingFlowProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    appointment_date: "",
    time_slot: "",
    type: "in-person",
    notes: "",
  });

  const handleSlotSelect = (date: string, slot: string) => {
    setBookingData((prev) => ({ ...prev, appointment_date: date, time_slot: slot }));
  };

  const handlePayment = async (appointmentId: number) => {
    try {
      const orderRes = await api.post("/payments/create-order", { appointmentId });
      const order = orderRes.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "HealthEase",
        description: `Consultation with Dr. ${doctor.name}`,
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            setLoading(true);
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });
            confetti({ particleCount: 120, spread: 65, origin: { y: 0.6 } });
            setStep(4);
            if (onSuccess) onSuccess();
          } catch {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: "Patient", email: "patient@example.com" },
        theme: { color: "#176B83" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Failed to initialize payment. Please try again.");
    }
  };

  const handleBookAndPay = async () => {
    setLoading(true);
    try {
      const res = await api.post("/appointments", {
        doctor_id: doctor.id,
        ...bookingData,
      });
      const appointmentId = res.data.data.id;
      await handlePayment(appointmentId);
    } catch {
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center gap-2 mb-8 px-2">
          {STEPS.map((s, index) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-meta font-bold transition-all duration-300 ${
                    step > s.id
                      ? "bg-[#15966A] text-white"
                      : step === s.id
                      ? "bg-[#176B83] text-white shadow-[0_4px_12px_rgba(23,107,131,0.30)]"
                      : "bg-[#EEF7F8] text-[#9BA9AE]"
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> : s.id}
                </div>
                <span
                  className={`text-meta font-semibold hidden sm:block transition-colors duration-200 ${
                    step === s.id ? "text-[#176B83]" : step > s.id ? "text-[#15966A]" : "text-[#9BA9AE]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                    step > s.id ? "bg-[#15966A]" : "bg-[#EEF7F8]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 1: Date & Time ──────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] p-6 md:p-8">
              <AvailabilityCalendar doctorId={doctor.id} onSlotSelect={handleSlotSelect} />
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!bookingData.time_slot}
                  className="px-8 h-12 text-[15px]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Consultation Type ────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] p-6 md:p-8">
              <h3 className="text-card-heading text-[#17313C] mb-6">Select Consultation Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    type: "in-person",
                    icon: MapPin,
                    label: "In-Person Visit",
                    desc: "Visit the clinic for a physical checkup",
                  },
                  {
                    type: "video",
                    icon: Video,
                    label: "Video Consultation",
                    desc: "Consult online from the comfort of your home",
                  },
                ].map(({ type, icon: Icon, label, desc }) => {
                  const isActive = bookingData.type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setBookingData((prev) => ({ ...prev, type }))}
                      className={`p-6 rounded-3xl border-2 text-left flex flex-col gap-4 transition-all duration-200 ${
                        isActive
                          ? "border-[#176B83] bg-[#EAF9F9] shadow-[0_8px_24px_rgba(23,107,131,0.12)]"
                          : "border-[rgba(16,50,60,0.07)] bg-white hover:border-[#9DE1E1]"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isActive ? "bg-[#176B83] text-white" : "bg-[#EEF7F8] text-[#61727A]"
                        }`}
                      >
                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-small font-bold text-[#17313C] mb-1">{label}</p>
                        <p className="text-small text-[#61727A]">{desc}</p>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="w-5 h-5 text-[#176B83] self-end" strokeWidth={2} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-[#61727A]">
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="sm:w-auto px-8 h-12">
                  Review Details
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Review & Pay ─────────────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-5"
          >
            {/* Appointment Summary Glass Card */}
            <div className="glass-panel rounded-[28px] p-6 md:p-8">
              <h3 className="text-card-heading text-[#17313C] mb-6">Appointment Summary</h3>

              {/* Doctor Row */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[rgba(16,50,60,0.06)] mb-5">
                <div className="w-12 h-12 rounded-[16px] bg-[#EAF9F9] flex items-center justify-center text-[#176B83]">
                  <Stethoscope className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-meta text-[#9BA9AE]">Doctor</p>
                  <p className="text-small font-bold text-[#17313C]">Dr. {doctor.name}</p>
                  <p className="text-meta text-[#27A7B5]">{doctor.specialty}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 bg-white rounded-2xl border border-[rgba(16,50,60,0.06)]">
                  <p className="text-meta text-[#9BA9AE] mb-1">Date & Time</p>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#176B83]" strokeWidth={2} />
                    <span className="text-small font-bold text-[#17313C]">
                      {bookingData.appointment_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-[#176B83]" strokeWidth={2} />
                    <span className="text-small font-bold text-[#17313C]">{bookingData.time_slot}</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[rgba(16,50,60,0.06)]">
                  <p className="text-meta text-[#9BA9AE] mb-1">Type</p>
                  <Badge variant={bookingData.type === "video" ? "info" : "default"} className="capitalize">
                    {bookingData.type === "video" ? (
                      <><Video className="w-3 h-3" strokeWidth={2} /> Video</>
                    ) : (
                      <><MapPin className="w-3 h-3" strokeWidth={2} /> In-Person</>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Fee Row */}
              <div className="p-4 bg-white rounded-2xl border border-[rgba(16,50,60,0.06)] mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#15966A]" strokeWidth={2} />
                  <span className="text-small text-[#61727A]">Consultation Fee</span>
                </div>
                <span className="text-card-heading text-[#10232D]">₹{doctor.consultation_fee}</span>
              </div>

              {/* Notes */}
              <textarea
                placeholder="Add notes for the doctor (optional)..."
                className="w-full p-4 bg-white border border-[rgba(16,50,60,0.07)] rounded-2xl text-small text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200 resize-none"
                rows={3}
                value={bookingData.notes}
                onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)} className="text-[#61727A]">
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Button>
              <Button
                onClick={handleBookAndPay}
                isLoading={loading}
                className="sm:w-auto px-10 h-12 text-[15px] bg-[#15966A] hover:bg-[#127a57] shadow-[0_10px_30px_rgba(21,150,106,0.22)]"
              >
                Pay & Confirm Booking
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Success ──────────────────────────────── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_12px_35px_rgba(16,50,60,0.07)] overflow-hidden">
              {/* Success Banner */}
              <div className="bg-[#EAF8F2] px-8 py-10 text-center border-b border-[rgba(21,150,106,0.10)]">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_12px_35px_rgba(21,150,106,0.15)] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-[#15966A]" strokeWidth={2} />
                  </div>
                </div>
                <h2 className="text-h3 text-[#17313C] mb-2">Appointment Confirmed!</h2>
                <p className="text-small text-[#61727A]">
                  Your appointment with Dr. {doctor.name} has been confirmed.
                </p>
              </div>

              {/* Appointment Details */}
              <div className="p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Doctor",
                      value: `Dr. ${doctor.name}`,
                      sub: doctor.specialty,
                      icon: Stethoscope,
                    },
                    {
                      label: "Date & Time",
                      value: bookingData.appointment_date,
                      sub: bookingData.time_slot,
                      icon: CalendarIcon,
                    },
                    {
                      label: "Type",
                      value: bookingData.type === "video" ? "Video Consultation" : "In-Person Visit",
                      sub: bookingData.type === "video" ? "Link sent to email" : "Hitech Medical Center",
                      icon: bookingData.type === "video" ? Video : MapPin,
                    },
                    {
                      label: "Fee Paid",
                      value: `₹${doctor.consultation_fee}`,
                      sub: "Payment Successful",
                      icon: CreditCard,
                    },
                  ].map(({ label, value, sub, icon: Icon }) => (
                    <div key={label} className="flex gap-3 p-4 bg-[#F5F9FA] rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF9F9] text-[#176B83] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-meta text-[#9BA9AE]">{label}</p>
                        <p className="text-small font-bold text-[#17313C]">{value}</p>
                        <p className="text-meta text-[#61727A]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[rgba(16,50,60,0.06)]">
                  <Button
                    variant="secondary"
                    className="flex-1 h-11"
                    onClick={() => window.location.href = "/patient/appointments"}
                  >
                    <CalendarIcon className="w-4 h-4" strokeWidth={1.75} />
                    View Appointment
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 h-11"
                    onClick={() => alert("Contact feature coming soon")}
                  >
                    <Phone className="w-4 h-4" strokeWidth={1.75} />
                    Contact Doctor
                  </Button>
                  <Button
                    className="flex-1 h-11"
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
