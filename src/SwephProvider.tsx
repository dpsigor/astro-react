import { createContext, useState, useEffect, ReactNode } from "react";
import { SwEph, swephInit } from "./sweph";

export const SwephContext = createContext<SwEph | null>(null);

export const SwephProvider = ({
  children,
  rootPath,
}: {
  children: ReactNode;
  rootPath: string;
}) => {
  const [swe, setSWE] = useState<SwEph | null>(null);

  useEffect(() => {
    const initializeDependency = async () => {
      const sweph = await swephInit(rootPath);
      setSWE(sweph);
    };

    initializeDependency();
  }, []);

  return <SwephContext.Provider value={swe}>{children}</SwephContext.Provider>;
};
