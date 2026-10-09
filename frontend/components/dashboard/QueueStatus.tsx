"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { 
  Users, 
  Clock, 
  AlertCircle,
  ChevronRight,
  UserCheck,
  Timer
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import api from "@/lib/api";

interface QueueStatusProps {
  doctorId: number;
  appointmentId: number;
}

export const QueueStatus = ({ doctorId, appointmentId }: QueueStatusProps) => {
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<number | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await api.get(`/queue/doctor/${doctorId}`);
      setQueueData(res.data.queue);
      
      // Calculate position
      const appointments = res.data.appointments;
      const myIdx = appointments.findIndex((a: any) => a.id === appointmentId);
      if (myIdx !== -1) {
        setPosition(myIdx + 1);
      }
    } catch (err) {
      console.error("Failed to fetch queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Listen for real-time updates
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    
    socket.on(`queue-update-${doctorId}`, () => {
      fetchQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, [doctorId, appointmentId]);

  if (loading || !queueData || position === null) return null;

  return (
    <Card className="border-blue-100 bg-blue-50/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Live Queue Tracker</h3>
          </div>
          <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full animate-pulse">
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Your Position</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600">#{position}</span>
              <span className="text-sm text-slate-500 mb-1">in line</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Est. Wait</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-amber-600">{queueData.estimated_wait_time}</span>
              <span className="text-sm text-slate-500 mb-1">mins</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Now Serving: {queueData.current_patient_name || "None"}</span>
            <span>{Math.max(0, position - 1)} ahead of you</span>
          </div>
          <Progress value={Math.min(100, (1 / position) * 100)} className="h-2 bg-blue-100" />
          
          <div className="flex items-center gap-2 p-3 bg-white/80 rounded-xl border border-blue-50 text-[11px] text-slate-600">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Please be ready 5 minutes before your turn.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
