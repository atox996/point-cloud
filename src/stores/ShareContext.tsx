import { createContext, type ReactNode } from "react";

import { ShareScene } from "@/renderer";

interface SharedContextType {
  shareScene: ShareScene;
}

const SharedContext = createContext<SharedContextType | null>(null);

export function SharedProvider({ children }: { children: ReactNode }) {
  const shareSceneRef = useRef<ShareScene>(null);
  // 单例初始化
  if (!shareSceneRef.current) {
    shareSceneRef.current = new ShareScene();
  }
  useEffect(() => {
    return () => {
      shareSceneRef.current?.dispose();
    };
  }, []);
  return <SharedContext.Provider value={{ shareScene: shareSceneRef.current }}>{children}</SharedContext.Provider>;
}

export const useShareContext = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error("useShareContext must be used within a SharedProvider");
  }
  return context;
};
