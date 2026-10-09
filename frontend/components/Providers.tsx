"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

/**
 * Providers Component
 * 
 * Wraps the application with necessary context providers.
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
