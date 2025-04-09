import { useRef, useEffect, useContext } from "react";
import { drawChart } from "./chart";
import { Sweph } from "./vos/sweph";
import { ConfigContext } from "./ConfigProvider";

function Chart({ swe }: { swe: Sweph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = useContext(ConfigContext).config;

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not found");

      const { innerWidth, innerHeight } = window;
      let v = Math.min(innerWidth - 20, innerHeight);
      if (v > 600) v = 600;
      if (v > innerHeight - 200) v = innerHeight - 210;
      if (v > innerWidth - 10) v = innerWidth - 10;
      if (v < 100) v = 102;
      const width = v;
      const height = v;
      const radius = (v - 100) / 2;
      canvas.width = width;
      canvas.height = height;

      const drawChartErr = drawChart(ctx, swe, cfg.chartColors, {
        date: new Date(cfg.date),
        geolat: cfg.geolat,
        geolon: cfg.geolon,
        width,
        height,
        radius,
      });
      if (drawChartErr) throw `drawChart: ${drawChartErr}`;
    } catch (e) {
      console.error(e);
      // TODO: handle this error
    }
  }, [cfg]);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default Chart;
