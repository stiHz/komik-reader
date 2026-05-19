"use client";

import { cn } from "@/lib/utils";

interface TabsContext {
  value: string;
}

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1 p-1 rounded-lg bg-secondary", className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function TabsTrigger({ value, children, asChild, className }: TabsTriggerProps) {
  const isActive = typeof window !== "undefined" && window.location.search.includes(`tab=${value}`) || 
                   (typeof window !== "undefined" && !window.location.search.includes("tab=") && value === "latest");

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}
