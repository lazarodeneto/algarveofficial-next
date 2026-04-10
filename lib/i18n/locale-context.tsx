"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  type Locale,
} from "./config";

const LocaleContext = createContext<Locale | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function LocaleProvider({
  children,
  locale,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
