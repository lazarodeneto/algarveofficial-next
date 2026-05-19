"use client";

import { createContext, useContext } from "react";

import type { AppRole } from "@/lib/auth/roles";

export type UserRole = AppRole;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getDashboardPath: (role: UserRole) => string;
}

export const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({ success: false, error: "Authentication is still loading." }),
  signup: async () => ({ success: false, error: "Authentication is still loading." }),
  loginWithGoogle: async () => ({ success: false, error: "Authentication is still loading." }),
  logout: async () => {},
  getDashboardPath: () => "/",
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
}
