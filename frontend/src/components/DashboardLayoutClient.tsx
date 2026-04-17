"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isToolPage =
    pathname.includes('/topics') ||
    pathname.includes('/script') ||
    pathname.includes('/planning') ||
    pathname.includes('/publish') ||
    pathname.includes('/settings');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("main-sidebar-collapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    } else {
      setIsSidebarCollapsed(isToolPage);
    }
  }, [isToolPage]);

  const actualCollapsed = isSidebarCollapsed === null ? isToolPage : isSidebarCollapsed;

  const toggleSidebar = () => {
    const newState = !actualCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("main-sidebar-collapsed", String(newState));
  };

  const paddingLeft = actualCollapsed ? 'pl-[80px]' : 'pl-[240px]';

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="relative z-50">
        <Sidebar isCollapsed={actualCollapsed} />
        
        {/* Toggle Button - Chevron style */}
        <button 
          onClick={toggleSidebar}
          className="fixed z-[60] bg-surface border border-border rounded-full p-1.5 shadow-md hover:scale-110 transition-all text-subtle active:scale-95 group"
          style={{ 
            left: actualCollapsed ? '70px' : '230px',
            top: '24px',
            transition: 'left 0.3s ease-in-out'
          }}
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform", !actualCollapsed && "rotate-180")} />
        </button>
      </div>

      <main className={cn("flex-1 transition-all duration-300", paddingLeft)}>
        <div className="min-h-screen border-l border-border bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
