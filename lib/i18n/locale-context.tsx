"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  type Locale,
} from "./locales";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

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
