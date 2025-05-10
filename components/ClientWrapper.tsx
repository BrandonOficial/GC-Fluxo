"use client";

import { useEffect, useState, ReactNode } from "react";
import { FlowProvider } from "@/lib/providers/FlowProvider";

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <FlowProvider>
      {children}
    </FlowProvider>
  ) : null;
} 