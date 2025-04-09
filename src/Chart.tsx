import { useRef, useEffect } from "react";
import { drawChart } from "./chart";
import { Sweph } from "./vos/sweph";
import { Config } from "./ConfigProvider";

function Chart({ swe, cfg }: { swe: Sweph; cfg: Config }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not found"); // TODO: handle this error
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not found"); // TODO: handle this error

    const { innerWidth, innerHeight } = window;
    let v = Math.min(innerWidth - 20, innerHeight);
    if (v > 600) v = 600;
    if (v > innerHeight - 200) v = innerHeight - 210;
    if (v > innerWidth - 10) v = innerWidth - 10;
    if (v < 100) v = 102; // TODO: handle this better
    const width = v;
    const height = v;
    const radius = (v - 100) / 2;
    canvas.width = width;
    canvas.height = height;

    drawChart(ctx, swe, cfg.chartColors, {
      date: new Date(cfg.date),
      geolat: cfg.geolat,
      geolon: cfg.geolon,
      width,
      height,
      radius,
    });
  }, [cfg]);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default Chart;
