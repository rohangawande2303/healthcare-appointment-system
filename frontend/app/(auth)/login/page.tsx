"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HeartPulse, LogIn, AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";

/**
 * Login Page — redesigned with clinical glass card and premium typography
 * Functionality: NextAuth credentials signIn — unchanged
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
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
        className="relative w-full max-w-md"
      >
        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-small text-[#61727A] hover:text-[#176B83] transition-colors mb-6 font-medium"
        >
          ← Back to Home
        </Link>

        <div className="glass-panel-strong rounded-[32px] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center border-b border-[rgba(16,50,60,0.06)]">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#176B83] flex items-center justify-center shadow-[0_10px_30px_rgba(23,107,131,0.25)]">
                <HeartPulse className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-h1 text-[#10232D] mb-2">Welcome back</h1>
            <p className="text-body text-[#61727A]">Sign in to your HealthEase account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                id="login-email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" strokeWidth={1.75} />}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                id="login-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="w-4 h-4" strokeWidth={1.75} />}
                required
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-2.5 p-3.5 bg-[#FDEEEE] border border-[#F5BBBB] rounded-2xl text-small text-[#D95757]"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-[15px] mt-2"
                isLoading={loading}
                id="login-submit"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                Sign In
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[rgba(16,50,60,0.06)] text-center">
              <p className="text-small text-[#61727A]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#176B83] font-semibold hover:text-[#16869A] transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
