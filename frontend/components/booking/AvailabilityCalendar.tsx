"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface AvailabilityCalendarProps {
  doctorId: string;
  onSlotSelect: (date: string, slot: string) => void;
}

/**
 * AvailabilityCalendar — redesigned date pills and time slots grid
 * using brand teal colors. All API and logic unchanged.
 */
export const AvailabilityCalendar = ({ doctorId, onSlotSelect }: AvailabilityCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState("");

  const days = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError("");
      setSlots([]);
      setSelectedSlot(null);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const response = await api.get(`/doctors/${doctorId}/availability`, {
          params: { date: formattedDate },
        });
        setSlots(response.data.slots);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load available slots.");
      } finally {
        setLoading(false);
      }
    };
    if (doctorId && selectedDate) fetchSlots();
  }, [doctorId, selectedDate]);

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    onSlotSelect(format(selectedDate, "yyyy-MM-dd"), slot);
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="text-small font-semibold text-[#17313C] mb-3 block">Select Date</label>
        <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, startOfToday());
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center min-w-[64px] p-3 rounded-2xl border transition-all duration-200 ${isSelected
                    ? "bg-[#176B83] border-[#176B83] text-white shadow-[0_6px_20px_rgba(23,107,131,0.25)]"
                    : "bg-white border-[#DCE7E9] text-[#61727A] hover:border-[#9DE1E1] hover:text-[#176B83]"
                  }`}
              >
                <span className={`text-meta uppercase font-semibold mb-1 ${isSelected ? "text-white/70" : "text-[#9BA9AE]"}`}>
                  {format(day, "eee")}
                </span>
                <span className="text-[18px] font-bold leading-tight">{format(day, "d")}</span>
                {isToday && (
                  <span className={`text-meta mt-0.5 ${isSelected ? "text-white/60" : "text-[#27A7B5]"}`}>Today</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="bg-[#F5F9FA] rounded-2xl p-5 border border-[rgba(16,50,60,0.06)] min-h-[180px]">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-[#27A7B5]" strokeWidth={2} />
          <h3 className="text-small font-bold text-[#17313C]">Available Time Slots</h3>
          <span className="text-meta text-[#9BA9AE]">— {format(selectedDate, "MMMM d, yyyy")}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-11 bg-white rounded-2xl animate-pulse border border-[rgba(16,50,60,0.06)]" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-[#D95757]" strokeWidth={1.75} />
            <p className="text-small text-[#61727A]">{error}</p>
          </div>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            <AnimatePresence mode="popLayout">
              {slots.map((slot) => (
                <motion.button
                  key={slot}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSlotClick(slot)}
                  className={`py-2.5 px-2 rounded-2xl text-small font-semibold transition-all duration-200 border ${selectedSlot === slot
                      ? "bg-[#176B83] border-[#176B83] text-white shadow-[0_4px_12px_rgba(23,107,131,0.20)]"
                      : "bg-white border-[#DCE7E9] text-[#405762] hover:border-[#9DE1E1] hover:text-[#176B83]"
                    }`}
                >
                  {slot}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-[rgba(16,50,60,0.06)]">
              <CalendarIcon className="w-6 h-6 text-[#9BA9AE]" strokeWidth={1.75} />
            </div>
            <p className="text-small font-semibold text-[#17313C]">No slots available</p>
            <p className="text-meta text-[#9BA9AE]">Try selecting another date</p>
          </div>
        )}
      </div>

      {/* Selected Slot Confirmation */}
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center gap-3 p-4 bg-[#EAF8F2] border border-[#B8ECCA] rounded-2xl text-small text-[#15966A]"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
          <span>
            Selected:{" "}
            <strong className="font-bold">{format(selectedDate, "MMMM d, yyyy")}</strong> at{" "}
            <strong className="font-bold">{selectedSlot}</strong>
          </span>
        </motion.div>
      )}
    </div>
  );
};
