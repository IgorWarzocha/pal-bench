"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface DisclaimerContextType {
  hasAcceptedDisclaimer: boolean;
  acceptDisclaimer: () => void;
}

const DisclaimerContext = createContext<DisclaimerContextType | undefined>(undefined);

export function DisclaimerProvider({ children }: { children: ReactNode }) {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pal-bench-disclaimer-accepted") === "true";
    }
    return false;
  });

  const acceptDisclaimer = useCallback(() => {
    localStorage.setItem("pal-bench-disclaimer-accepted", "true");
    setHasAcceptedDisclaimer(true);
  }, []);

  return (
    <DisclaimerContext.Provider value={{ hasAcceptedDisclaimer, acceptDisclaimer }}>
      {children}
    </DisclaimerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDisclaimer() {
  const context = useContext(DisclaimerContext);
  if (context === undefined) {
    throw new Error("useDisclaimer must be used within a DisclaimerProvider");
  }
  return context;
}
