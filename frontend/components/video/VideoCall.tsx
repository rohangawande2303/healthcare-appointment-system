"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  User,
  Loader2,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VideoCallProps {
  roomId: string;
  userId: string;
  onEndCall: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const VideoCall = ({ roomId, userId, onEndCall }: VideoCallProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Initialize Socket
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true
    });

    // 2. Get User Media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 3. Setup WebRTC
        setupPeerConnection(stream);
        
        // 4. Join Room
        socketRef.current?.emit("join-room", roomId, userId);
      } catch (err: any) {
        console.error("Error accessing media devices:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionError("Camera and microphone access was denied. Please enable them in your browser settings to join the call.");
        } else {
          setPermissionError("Could not access camera or microphone. Please ensure they are connected and not in use by another app.");
        }
      }
    };

    startMedia();

    // Socket listeners for signaling
    socketRef.current.on("user-connected", (otherUserId) => {
      console.log("Other user connected:", otherUserId);
      createOffer();
    });

    socketRef.current.on("offer", async (payload) => {
      console.log("Received offer from:", payload.sender);
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pcRef.current?.createAnswer();
      await pcRef.current?.setLocalDescription(answer);
      socketRef.current?.emit("answer", {
        target: payload.sender,
        sdp: answer,
        sender: socketRef.current?.id
      });
    });

    socketRef.current.on("answer", async (payload) => {
      console.log("Received answer from:", payload.sender);
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    });

    socketRef.current.on("ice-candidate", (payload) => {
      console.log("Received ICE candidate");
      if (payload.candidate) {
        pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    });

    socketRef.current.on("call-ended", () => {
      handleEndCall();
    });

    return () => {
      socketRef.current?.disconnect();
      pcRef.current?.close();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, userId]);

  const setupPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Received remote track");
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setIsConnected(true);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          target: roomId, // In simple logic we emit to room, backend handles targeting
          candidate: event.candidate,
          sender: socketRef.current?.id
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        setIsConnected(false);
      }
    };
  };

  const createOffer = async () => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socketRef.current?.emit("offer", {
      target: roomId,
      sdp: offer,
      sender: socketRef.current?.id
    });
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    socketRef.current?.emit("end-call", roomId);
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {permissionError && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-[60] flex items-center justify-center p-6 text-center">
          <Card className="max-w-md bg-slate-800 border-slate-700 shadow-2xl p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <VideoOff className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Permission Required</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {permissionError}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                Retry Connection
              </Button>
              <Button variant="ghost" onClick={onEndCall} className="text-slate-400 hover:text-white">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            H
          </div>
          <div>
            <h3 className="text-white font-medium">Video Consultation</h3>
            <p className="text-xs text-slate-400">Room: {roomId.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
            isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {isConnected ? "Connected" : "Waiting for Peer..."}
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        {/* Remote Video (Main) */}
        <div className="w-full h-full max-w-5xl aspect-video bg-slate-800 rounded-3xl overflow-hidden relative shadow-2xl">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Waiting for patient to join...</p>
              </div>
            </div>
          )}

          {/* Local Video (Overlay) */}
          <div className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video bg-slate-700 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-xl z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-600" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white">
              You (Preview)
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 flex items-center justify-center bg-gradient-to-t from-slate-900 to-transparent">
        <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 shadow-2xl">
          <Button
            variant="outline"
            onClick={toggleMute}
            className={`w-14 h-14 rounded-2xl p-0 transition-all ${
              isMuted ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20" : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-2xl p-0 transition-all ${
              isVideoOff ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20" : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          <div className="w-px h-10 bg-slate-700 mx-2" />

          <Button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-2xl p-0 shadow-lg shadow-red-600/20"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            className="w-14 h-14 rounded-2xl p-0 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
          >
            <Maximize2 className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
