import { createContext, type ReactNode } from "react";

import { ShareScene } from "@/renderer";

interface SharedContextType {
  shareScene: ShareScene;
}

const SharedContext = createContext<SharedContextType | null>(null);

export function SharedProvider({ children }: { children: ReactNode }) {
  const shareScene = new ShareScene();

  return <SharedContext.Provider value={{ shareScene }}>{children}</SharedContext.Provider>;
}

export const useShareContext = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error("useShareContext must be used within a SharedProvider");
  }
  return context;
};
