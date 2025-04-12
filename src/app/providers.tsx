"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface NextThemeProviderProps {
  children: ReactNode;
}

export function NextThemeProvider({ children }: NextThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
} 