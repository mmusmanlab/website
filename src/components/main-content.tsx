"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <main className={`flex-grow ${isDashboard ? "" : "pt-16"}`}>
      {children}
    </main>
  );
}
