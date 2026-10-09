"use client";

import React, { useState } from "react";
import { StarRating } from "../ui/StarRating";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  doctorId: number;
  appointmentId: number;
  onSuccess?: () => void;
}

export const ReviewForm = ({ doctorId, appointmentId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", {
        doctor_id: doctorId,
        rating,
        comment
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. You may have already reviewed this doctor.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center text-center"
      >
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900">Thank you for your feedback!</h3>
        <p className="text-sm text-slate-500 mt-1">Your review helps other patients make better choices.</p>
      </motion.div>
    );
  }

  return (
    <Card className="border-slate-100 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Rate Your Consultation</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-slate-500">How was your experience?</p>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              interactive 
              size={32} 
            />
          </div>

          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts about the doctor and the consultation..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            isLoading={loading} 
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
