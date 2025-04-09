import { createContext, ReactNode, useState } from "react";

export interface ChartColorsDignities {
  none: string;
  domicile: string;
  detriment: string;
  exaltation: string;
  fall: string;
}

export interface ChartColors {
  background: string;
  stroke: string;
  signs: string;
  dignities: ChartColorsDignities;
}

export interface Config {
  date: number; // unix timestamp in milliseconds
  chartColors: ChartColors;
  geolat: number;
  geolon: number;
}

const defaultConfig: Config = {
  date: new Date().valueOf(),
  chartColors: {
    background: "#1C1C1C",
    stroke: "#FFF",
    signs: "#FFF",
    dignities: {
      none: "#00CCFF",
      domicile: "#00FF00",
      detriment: "#FF0000",
      exaltation: "#FFFF00",
      fall: "#CD5C5C",
    },
  },
  geolat: Math.round((-19 - 55 / 60) * 100) / 100,
  geolon: Math.round((-43 - 56 / 60) * 100) / 100,
};

function encodeConfig(config: Config): string {
  return JSON.stringify(config);
}

function decodeConfig(prev: Config, s: string): Config {
  try {
    const c: Config = JSON.parse(JSON.stringify(prev));
    const parsed: Partial<Config> = JSON.parse(s);
    if (parsed.date && typeof parsed.date === "number") c.date = parsed.date;
    if (parsed.chartColors && typeof parsed.chartColors === "object") {
      const cc = parsed.chartColors;
      if (cc.background && typeof cc.background === "string") {
        c.chartColors.background = cc.background;
      }
      if (cc.stroke && typeof cc.stroke === "string") {
        c.chartColors.stroke = cc.stroke;
      }
      if (cc.signs && typeof cc.signs === "string") {
        c.chartColors.signs = cc.signs;
      }
      if (cc.dignities && typeof cc.dignities === "object") {
        const d = cc.dignities;
        if (d.none && typeof d.none === "string")
          c.chartColors.dignities.none = d.none;
        if (d.domicile && typeof d.domicile === "string")
          c.chartColors.dignities.domicile = d.domicile;
        if (d.detriment && typeof d.detriment === "string")
          c.chartColors.dignities.detriment = d.detriment;
        if (d.exaltation && typeof d.exaltation === "string")
          c.chartColors.dignities.exaltation = d.exaltation;
        if (d.fall && typeof d.fall === "string")
          c.chartColors.dignities.fall = d.fall;
      }
    }
    if (parsed.geolat && typeof parsed.geolat === "number")
      c.geolat = parsed.geolat;
    if (parsed.geolon && typeof parsed.geolon === "number")
      c.geolon = parsed.geolon;
    return c;
  } catch {
    return prev;
  }
}

export const ConfigContext = createContext<{
  config: Config;
  resetDefaults: () => void;
  setBackgroundColor: (color: string) => void;
  setDate: (date: Date) => void;
  setGeolat: (geolat: number) => void;
  setGeolon: (geolon: number) => void;
}>({
  config: defaultConfig,
  resetDefaults: () => {},
  setBackgroundColor: () => {},
  setDate: () => {},
  setGeolat: () => {},
  setGeolon: () => {},
});

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  let cfg = defaultConfig;
  const stored = localStorage.getItem("config");
  if (stored) {
    cfg = decodeConfig(cfg, stored);
  }

  const [config, setConfig] = useState<Config>(cfg);

  localStorage.setItem("config", encodeConfig(config));

  const setBackgroundColor = (color: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      chartColors: {
        ...prevConfig.chartColors,
        background: color,
      },
    }));
  };

  const setDate = (date: Date) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      date: date.valueOf(),
    }));
  };

  const setGeolat = (geolat: number) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      geolat: geolat,
    }));
  };

  const setGeolon = (geolon: number) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      geolon: geolon,
    }));
  };

  const resetDefaults = () => {
    defaultConfig.date = new Date().valueOf();
    setConfig(defaultConfig);
    localStorage.setItem("config", encodeConfig(defaultConfig));
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        resetDefaults,
        setBackgroundColor,
        setDate,
        setGeolat,
        setGeolon,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
