"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Search,
  MapPin,
  Calendar,
  SlidersHorizontal,
  ArrowRight,
  Stethoscope,
  Video,
  Bell,
  ShieldCheck,
  Users,
  HeartPulse,
  Star,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";

const SPECIALTIES = [
  { name: "Cardiology", icon: HeartPulse, color: "bg-[#FDEEEE] text-[#D95757]" },
  { name: "Dermatology", icon: Star, color: "bg-[#FFF6E6] text-[#D99024]" },
  { name: "Neurology", icon: ShieldCheck, color: "bg-[#EDF5FF] text-[#3677C8]" },
  { name: "Pediatrics", icon: Users, color: "bg-[#F1EFFF] text-[#8176D9]" },
  { name: "Orthopedics", icon: CheckCircle, color: "bg-[#EAF8F2] text-[#15966A]" },
  { name: "General Medicine", icon: Stethoscope, color: "bg-[#EAF9F9] text-[#176B83]" },
  { name: "Gynecology", icon: HeartPulse, color: "bg-[#FDEEEE] text-[#D95757]" },
  { name: "Psychiatry", icon: ShieldCheck, color: "bg-[#F1EFFF] text-[#8176D9]" },
];

const FEATURES = [
  {
    icon: Calendar,
    title: "Easy Booking",
    desc: "Schedule appointments in seconds with your preferred doctors and specialists.",
    color: "bg-[#EAF9F9] text-[#176B83]",
  },
  {
    icon: Video,
    title: "Video Consultation",
    desc: "Connect with specialists from the comfort of your home via HD video calls.",
    color: "bg-[#EDF5FF] text-[#3677C8]",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Never miss a dose or appointment with intelligent, automated alerts.",
    color: "bg-[#F1EFFF] text-[#8176D9]",
  },
  {
    icon: ShieldCheck,
    title: "Secure Records",
    desc: "Your medical data is encrypted and stored with enterprise-grade security.",
    color: "bg-[#EAF8F2] text-[#15966A]",
  },
  {
    icon: Users,
    title: "Expert Doctors",
    desc: "Access verified healthcare professionals across dozens of specialties.",
    color: "bg-[#FFF6E6] text-[#D99024]",
  },
  {
    icon: HeartPulse,
    title: "Queue Tracking",
    desc: "Monitor your clinic queue position in real-time so you never wait unnecessarily.",
    color: "bg-[#FDEEEE] text-[#D95757]",
  },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: any = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-4 left-4 right-4 z-50 glass-panel rounded-[20px] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto transition-all duration-300">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#176B83] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[17px] font-bold text-[#10232D] tracking-tight">HealthEase</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-small font-medium text-[#405762] hover:text-[#176B83] transition-colors duration-200">Features</Link>
          <Link href="#specialties" className="text-small font-medium text-[#405762] hover:text-[#176B83] transition-colors duration-200">Specialties</Link>
          <Link href="#how-it-works" className="text-small font-medium text-[#405762] hover:text-[#176B83] transition-colors duration-200">How It Works</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-xl text-[#405762] hover:bg-[#EEF7F8] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-20 left-4 right-4 z-40 glass-panel-strong rounded-3xl p-6 space-y-4"
        >
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-[#405762] font-medium py-2 hover:text-[#176B83] transition-colors">Features</Link>
          <Link href="#specialties" onClick={() => setMobileMenuOpen(false)} className="block text-[#405762] font-medium py-2 hover:text-[#176B83] transition-colors">Specialties</Link>
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-[#405762] font-medium py-2 hover:text-[#176B83] transition-colors">How It Works</Link>
          <div className="pt-4 border-t border-[rgba(16,50,60,0.07)] space-y-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Get Started <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center overflow-hidden">
        {/* Background Blobs */}
        <div className="blob-teal w-[600px] h-[600px] -top-[150px] -left-[200px] opacity-60" />
        <div className="blob-lavender w-[500px] h-[500px] top-[10%] -right-[200px] opacity-50" />
        <div className="blob-teal w-[400px] h-[400px] bottom-0 left-[30%] opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto space-y-6"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full text-meta text-[#176B83]">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            Trusted by 50,000+ patients across India
          </div>

          {/* Headline */}
          <h1 className="text-hero text-[#10232D]">
            Find the right doctor.{" "}
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #176B83 0%, #27A7B5 50%, #8176D9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Book with confidence.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-body text-[#405762] max-w-2xl mx-auto">
            Discover trusted doctors, compare availability, and book your appointment in just a few minutes.
            All in one place — seamlessly simple, beautifully designed.
          </p>

          {/* Hero Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="glass-panel rounded-[32px] p-6 md:p-8 mt-10 text-left max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9BA9AE]" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search doctors, specialties or conditions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
                />
              </div>
              {/* Location */}
              <div className="relative md:w-44">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA9AE]" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full h-12 pl-10 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] placeholder:text-[#9BA9AE] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
                />
              </div>
              {/* Date */}
              <div className="relative md:w-40">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA9AE] pointer-events-none" strokeWidth={2} />
                <input
                  type="date"
                  className="w-full h-12 pl-10 pr-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] border border-[#DCE7E9] bg-white text-small text-[#405762] hover:border-[#9DE1E1] hover:text-[#176B83] transition-all duration-200 w-full sm:w-auto">
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
                More Filters
              </button>
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 h-12 text-[15px]">
                  Search Doctors
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────── */}
      <section className="px-4 py-12 bg-white/60 border-y border-[rgba(16,50,60,0.06)]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Patients Served", val: "50,000+", icon: Users },
            { label: "Verified Doctors", val: "1,000+", icon: Stethoscope },
            { label: "Consultations", val: "100,000+", icon: Calendar },
            { label: "Average Rating", val: "4.9 / 5", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="text-h2 text-[#176B83]">{stat.val}</div>
              <div className="text-small text-[#61727A] font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Specialties Section ─────────────────────────── */}
      <section id="specialties" className="px-4 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-3">
          <div className="text-meta text-[#176B83] uppercase tracking-widest font-semibold">Browse by Specialty</div>
          <h2 className="text-h2 text-[#17313C]">Find a Specialist</h2>
          <p className="text-body text-[#61727A] max-w-xl mx-auto">
            Browse our comprehensive list of specialties and find the right expert for your needs.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {SPECIALTIES.map(({ name, icon: Icon, color }) => (
            <motion.div key={name} variants={itemVariants}>
              <Link href="/login">
                <div className="group p-5 bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(16,50,60,0.10)] hover:border-[#9DE1E1] transition-all duration-300 ease-out cursor-pointer flex flex-col items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <p className="text-small font-semibold text-[#17313C] group-hover:text-[#176B83] transition-colors duration-200">{name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features Section ────────────────────────────── */}
      <section id="features" className="px-4 py-24 bg-[#EEF7F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <div className="text-meta text-[#176B83] uppercase tracking-widest font-semibold">Why HealthEase</div>
            <h2 className="text-h2 text-[#17313C]">Everything You Need</h2>
            <p className="text-body text-[#61727A] max-w-xl mx-auto">
              A comprehensive suite of features built for a modern, seamless healthcare experience.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white p-8 rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] hover:shadow-[0_20px_50px_rgba(16,50,60,0.10)] hover:border-[#9DE1E1] transition-all duration-300 ease-out"
              >
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-card-heading text-[#17313C] mb-2">{title}</h3>
                <p className="text-body text-[#61727A]">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="px-4 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-3">
          <div className="text-meta text-[#176B83] uppercase tracking-widest font-semibold">Simple Process</div>
          <h2 className="text-h2 text-[#17313C]">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Search & Discover", desc: "Browse verified doctors by specialty, location, and availability." },
            { step: "02", title: "Book Instantly", desc: "Select a convenient time slot and book in under two minutes." },
            { step: "03", title: "Consult with Confidence", desc: "Meet your doctor in-person or via video call from anywhere." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative p-8 bg-white rounded-3xl border border-[rgba(16,50,60,0.07)] shadow-[0_4px_16px_rgba(16,50,60,0.05)] overflow-hidden">
              <div className="absolute top-4 right-4 text-[80px] font-extrabold text-[#EAF9F9] leading-none select-none">{step}</div>
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF9F9] text-[#176B83] flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-card-heading text-[#17313C] mb-2">{title}</h3>
                <p className="text-body text-[#61727A]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────── */}
      <section className="px-4 py-16 mb-16">
        <div
          className="max-w-4xl mx-auto rounded-[32px] p-10 md:p-16 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #123C52 0%, #176B83 50%, #16869A 100%)" }}
        >
          <div className="blob-lavender w-[300px] h-[300px] -top-[100px] -right-[100px] opacity-30" />
          <div className="relative">
            <h2 className="text-h1 text-white mb-4">Ready to take charge of your health?</h2>
            <p className="text-body text-[#9DE1E1] mb-8 max-w-xl mx-auto">
              Join 50,000+ patients who trust HealthEase for their healthcare needs.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#176B83] hover:bg-[#EAF9F9] shadow-[0_10px_30px_rgba(0,0,0,0.20)]"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-[#10232D] text-[#61727A] py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 pb-10 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#176B83] flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-[17px] font-bold text-white">HealthEase</span>
              </div>
              <p className="text-small text-[#61727A] max-w-xs">
                Modern healthcare appointment platform for patients and doctors.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-small">
              <div>
                <p className="text-meta uppercase tracking-widest text-[#9BA9AE] mb-3">Product</p>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Specialties</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">For Doctors</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-meta uppercase tracking-widest text-[#9BA9AE] mb-3">Company</p>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-meta uppercase tracking-widest text-[#9BA9AE] mb-3">Legal</p>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-meta text-[#61727A] mt-8 text-center">© 2026 HealthEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
