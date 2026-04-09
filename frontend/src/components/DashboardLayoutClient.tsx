"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isToolPage =
    pathname.includes('/topics') ||
    pathname.includes('/script') ||
    pathname.includes('/planning') ||
    pathname.includes('/settings');

  const paddingLeft = isToolPage ? 'pl-[80px]' : 'pl-[240px]';

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isCollapsed={isToolPage} />
      <main className={`flex-1 transition-all duration-300 ${paddingLeft}`}>
        <div className="min-h-screen border-l border-border">
          {children}
        </div>
      </main>
    </div>
  );
}
