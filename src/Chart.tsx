import { useRef, useEffect } from 'react'
import { Sweph } from './vos/sweph'
import { drawChart } from './chart'

function Chart(props: { swh: Sweph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) throw new Error('Canvas not found') // TODO: handle this error
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not found') // TODO: handle this error

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

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    console.log(props.swh.jd(new Date()).jd)
    const date = new Date();
    const geolon = -43 - 56 / 60;
    const geolat = -19 - 55 / 60;
    drawChart(ctx, props.swh, {
        date,
        width,
        height,
        radius,
        geolat,
        geolon,
    })
  }, [])

  return (
    <>
      <canvas ref={canvasRef}/>
    </>
  )
}

export default Chart
