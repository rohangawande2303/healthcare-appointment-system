"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  HeartPulse,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import axios from "axios";

/**
 * Register Page — redesigned with clinical glass card and multi-step flow.
 * All form logic, validation, and API calls are unchanged.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    date_of_birth: "",
    blood_group: "",
    specialty: "",
    qualification: "",
    experience: "",
    consultation_fee: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === "patient") {
      if (!formData.date_of_birth || !formData.blood_group) {
        setError("Please provide your date of birth and blood group.");
        return;
      }
    } else {
      if (!formData.specialty || !formData.qualification || !formData.experience || !formData.consultation_fee) {
        setError("Please fill in all professional details.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      if (formData.role === "patient") {
        payload.date_of_birth = formData.date_of_birth;
        payload.blood_group = formData.blood_group;
      } else {
        payload.specialty = formData.specialty;
        payload.qualification = formData.qualification;
        payload.experience = parseInt(formData.experience);
        payload.consultation_fee = parseFloat(formData.consultation_fee);
      }
      await axios.post(`${apiUrl}/auth/register`, payload);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-teal w-[500px] h-[500px] -top-[100px] -left-[200px] opacity-60" />
      <div className="blob-lavender w-[400px] h-[400px] bottom-0 -right-[150px] opacity-50" />

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-small text-[#61727A] hover:text-[#176B83] transition-colors mb-6 font-medium"
        >
          ← Back to Home
        </Link>

        <div className="glass-panel-strong rounded-[32px] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 border-b border-[rgba(16,50,60,0.06)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#176B83] flex items-center justify-center shadow-[0_10px_30px_rgba(23,107,131,0.25)]">
                <HeartPulse className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-h3 text-[#10232D]">Join HealthEase</h1>
                <p className="text-small text-[#61727A]">Start your journey to better healthcare</p>
              </div>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-meta font-bold transition-all duration-300 ${
                    step > s
                      ? "bg-[#15966A] text-white"
                      : step === s
                      ? "bg-[#176B83] text-white"
                      : "bg-[#EEF7F8] text-[#9BA9AE]"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s}
                  </div>
                  {s < 2 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${step > s ? "bg-[#15966A]" : "bg-[#EEF7F8]"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-meta text-[#61727A]">
              <span>Account Details</span>
              <span>Profile Setup</span>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -16, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <Input
                    label="Full Name"
                    name="name"
                    id="reg-name"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={handleChange}
                    leftIcon={<User className="w-4 h-4" strokeWidth={1.75} />}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    id="reg-email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    leftIcon={<Mail className="w-4 h-4" strokeWidth={1.75} />}
                  />
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    id="reg-password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4" strokeWidth={1.75} />}
                  />

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-small font-semibold text-[#17313C]">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["patient", "doctor"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, role })}
                          className={`h-12 rounded-[14px] border-2 font-semibold text-small capitalize transition-all duration-200 ${
                            formData.role === role
                              ? "border-[#176B83] bg-[#EAF9F9] text-[#176B83]"
                              : "border-[#DCE7E9] bg-white text-[#61727A] hover:border-[#9DE1E1] hover:text-[#17313C]"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <ErrorBanner message={error} />}

                  <Button onClick={nextStep} className="w-full h-12 mt-2" id="reg-next">
                    Continue
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -16, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-5"
                >
                  {formData.role === "patient" ? (
                    <>
                      <Input
                        label="Date of Birth"
                        type="date"
                        name="date_of_birth"
                        id="reg-dob"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                      <div className="space-y-1.5">
                        <label className="text-small font-semibold text-[#17313C]">Blood Group</label>
                        <select
                          name="blood_group"
                          id="reg-blood-group"
                          value={formData.blood_group}
                          onChange={handleChange}
                          className="w-full h-12 px-4 rounded-[14px] border border-[#DCE7E9] bg-white text-[15px] text-[#10232D] focus:outline-none focus:border-[#27A7B5] focus:shadow-[0_0_0_3px_rgba(39,167,181,0.10)] transition-all duration-200"
                        >
                          <option value="">Select Blood Group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input label="Specialty" name="specialty" id="reg-specialty" placeholder="e.g. Cardiology" value={formData.specialty} onChange={handleChange} />
                      <Input label="Qualification" name="qualification" id="reg-qual" placeholder="e.g. MD, MBBS" value={formData.qualification} onChange={handleChange} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Experience (yrs)" type="number" name="experience" id="reg-exp" placeholder="e.g. 10" value={formData.experience} onChange={handleChange} />
                        <Input label="Fee (₹)" type="number" name="consultation_fee" id="reg-fee" placeholder="e.g. 500" value={formData.consultation_fee} onChange={handleChange} />
                      </div>
                    </>
                  )}

                  {error && <ErrorBanner message={error} />}

                  <div className="flex gap-3 mt-2">
                    <Button variant="secondary" onClick={prevStep} className="flex-none px-5 h-12">
                      <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                      Back
                    </Button>
                    <Button onClick={handleSubmit} isLoading={loading} className="flex-1 h-12" id="reg-submit">
                      Complete Registration
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-[#EAF8F2] rounded-3xl flex items-center justify-center shadow-[0_12px_35px_rgba(21,150,106,0.15)]">
                      <Check className="w-9 h-9 text-[#15966A]" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-h3 text-[#17313C]">Welcome to HealthEase!</h3>
                    <p className="text-body text-[#61727A]">Your account has been created successfully.</p>
                  </div>
                  <Button onClick={() => router.push("/login")} className="w-full h-12">
                    Continue to Sign In
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-[rgba(16,50,60,0.06)] text-center">
              <p className="text-small text-[#61727A]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#176B83] font-semibold hover:text-[#16869A] transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-center gap-2.5 p-3.5 bg-[#FDEEEE] border border-[#F5BBBB] rounded-2xl text-small text-[#D95757]"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
      {message}
    </motion.div>
  );
}
