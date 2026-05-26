import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type FabMenuContextValue = {
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
};

const FabMenuContext = createContext<FabMenuContextValue | null>(null);

export function FabMenuProvider({ children }: { children: ReactNode }) {
  const [fabOpen, setFabOpen] = useState(false);

  const value = useMemo(
    () => ({
      fabOpen,
      setFabOpen,
    }),
    [fabOpen],
  );

  return <FabMenuContext.Provider value={value}>{children}</FabMenuContext.Provider>;
}

export function useFabMenu() {
  const context = useContext(FabMenuContext);

  if (!context) {
    throw new Error("useFabMenu must be used within FabMenuProvider");
  }

  return context;
}
