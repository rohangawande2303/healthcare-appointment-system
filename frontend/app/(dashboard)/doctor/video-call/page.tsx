"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings, 
  Monitor, 
  Camera,
  Users,
  ShieldCheck,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { VideoCall } from "@/components/video/VideoCall";

function DoctorVideoCallContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const roomId = searchParams.get("roomId") || "test-consultation";
  const userId = (session?.user as any)?.id?.toString() || "doctor-" + Math.random().toString(36).slice(2, 7);

  useEffect(() => {
    async function getMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media Device:", err);
      }
    }

    if (!inCall) {
      getMedia();
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [inCall]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  if (inCall) {
    return (
      <VideoCall 
        roomId={roomId} 
        userId={userId} 
        onEndCall={() => setInCall(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side: Video Preview */}
        <div className="space-y-6">
          <div className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {isVideoOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                  <VideoOff className="w-10 h-10" />
                </div>
                <p className="text-sm font-medium">Camera is off</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
            
            {/* Overlay Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <button 
                onClick={toggleMute}
                className={`p-3 rounded-xl transition-all ${isMuted ? "bg-red-500 text-white" : "text-white hover:bg-white/10"}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition-all ${isVideoOff ? "bg-red-500 text-white" : "text-white hover:bg-white/10"}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Camera Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium">Audio Level OK</span>
            </div>
          </div>
        </div>

        {/* Right Side: Join Details */}
        <div className="space-y-8 lg:pl-8">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              <ClipboardList className="w-4 h-4" />
              Tele-Health Portal
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Start your <span className="text-emerald-500">Video Consultation</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md mx-auto lg:mx-0">
              Check your equipment before starting the session. Ensure you have a stable internet connection and a quiet environment.
            </p>
          </div>

          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Consultation Room</p>
                    <p className="text-white font-mono text-sm">{roomId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-600/20 group"
                  onClick={() => setInCall(true)}
                >
                  Enter Room Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-center text-xs text-slate-500 font-medium">
                  HIPAA Compliant • End-to-End Encrypted
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>
    </div>
  );
}

export default function DoctorVideoCallPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading consultation room...</div>}>
      <DoctorVideoCallContent />
    </React.Suspense>
  );
}
