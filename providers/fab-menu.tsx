import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type FabMenuContextValue = {
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
};

const defaultFabMenuContext: FabMenuContextValue = {
  fabOpen: false,
  setFabOpen: () => {},
};

const FabMenuContext = createContext<FabMenuContextValue>(defaultFabMenuContext);

// FAB 菜单状态跨首页和浮层共享，后续如果多个页面需要快捷入口可继续复用。
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
  return useContext(FabMenuContext);
}
