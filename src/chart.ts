import { ChartColorsDignities, ChartColors } from "./ConfigProvider";
import { HouseSystem, Planet, planets } from "./vos/consts";
import { Dignity, dignity } from "./vos/dignity";
import { partFortuneGlyph, planetGlyph, signGlyph } from "./vos/glyphs";
import { Sweph } from "./vos/sweph";

export interface ChartCfg {
  date: Date;
  width: number;
  height: number;
  radius: number;
  geolat: number;
  geolon: number;
}

function dignityColor(colors: ChartColorsDignities, d?: Dignity) {
  switch (d) {
    case Dignity.Domicile:
      return colors.domicile;
    case Dignity.Exaltation:
      return colors.exaltation;
    case Dignity.Fall:
      return colors.fall;
    case Dignity.Detriment:
      return colors.detriment;
    default:
      return colors.none;
  }
}

interface positionsOutput {
  houses: number[];
  planets: { [key in Planet]: { lon: number; slon: number } };
}

function positions(
  sweph: Sweph,
  date: Date,
  geolat: number,
  geolon: number
): { out: positionsOutput; err?: string } {
  const out: positionsOutput = {
    houses: [],
    planets: {
      [Planet.Sun]: { lon: 0, slon: 0 },
      [Planet.Moon]: { lon: 0, slon: 0 },
      [Planet.Mercury]: { lon: 0, slon: 0 },
      [Planet.Venus]: { lon: 0, slon: 0 },
      [Planet.Mars]: { lon: 0, slon: 0 },
      [Planet.Jupiter]: { lon: 0, slon: 0 },
      [Planet.Saturn]: { lon: 0, slon: 0 },
    },
  };
  const { jd, err } = sweph.jd(date);
  if (err) return { out, err: `jd: ${err}` };
  const houses = sweph.houses(jd, geolat, geolon, HouseSystem.Placidus);
  out.houses = houses;
  for (const planet of planets) {
    const { lon, slon, err } = sweph.planetPos(jd, planet);
    if (err) return { out, err: `planet ${planet}: ${err}` };
    out.planets[planet] = { lon, slon };
  }
  return { out };
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  sweph: Sweph,
  chartColors: ChartColors,
  opts: ChartCfg
): string | void {
  const { date, width, height, radius, geolat, geolon } = opts;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = chartColors.background;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = chartColors.stroke;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
  ctx.stroke();

  const ps = positions(sweph, date, geolat, geolon);
  if (ps.err) return ps.err;

  const houses = ps.out.houses;

  const metrics = ctx.measureText("M");
  const fontHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

  const angleOffset = 180 + houses[0];

  // draw house lines
  {
    const innerCircleRadius = Math.min(width,height)*0.0333333;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, innerCircleRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let i = 0; i < houses.length; i++) {
      let r = radius;
      ctx.lineWidth = 1;
      if (i === 0 || i === 3 || i === 6 || i === 9) {
        // make the stroke thicker and longer
        r += Math.min(width,height)*0.0333333;
        ctx.lineWidth = 3;
      }
      const rads = ((angleOffset - houses[i]) * Math.PI) / 180;
      const x0 = width / 2 + innerCircleRadius * Math.cos(rads);
      const y0 = width / 2 + innerCircleRadius * Math.sin(rads);
      const x1 = width / 2 + r * Math.cos(rads);
      const y1 = height / 2 + r * Math.sin(rads);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      if (i === 0 || i === 9) {
        // draw arrow point
        const arrowSize = 15;
        [1, -1].forEach((v) => {
          const arrowRads = rads + v * Math.PI * 1.15;
          const x2 = x1 + arrowSize * Math.cos(arrowRads);
          const y2 = y1 + arrowSize * Math.sin(arrowRads);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      }
    }
  }

  const planetPositions: {
    [key in Planet]: {
      rads: number;
      lon: number;
      slon: number;
      x: number;
      y: number;
    };
  } = {
    [Planet.Sun]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Moon]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Mercury]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Venus]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Mars]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Jupiter]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
    [Planet.Saturn]: { rads: 0, lon: 0, slon: 0, x: 0, y: 0 },
  };

  // write planets
  {
    ctx.font = "20px glyphsFont";
    ctx.textAlign = "center";
    const radiusPlanets = radius + Math.min(width,height)*0.0333333;
    for (const planet of planets) {
      const glyph = planetGlyph[planet];
      const { lon, slon } = ps.out.planets[planet];
      ctx.fillStyle = dignityColor(chartColors.dignities, dignity(planet, lon));
      const rads = ((angleOffset - lon) * Math.PI) / 180;
      const x = width / 2 + radiusPlanets * Math.cos(rads);
      const y = height / 2 + radiusPlanets * Math.sin(rads);
      planetPositions[planet] = { x, y, rads, lon, slon };
      ctx.fillText(glyph, x, y + fontHeight / 4);
      // if retrograde, write an R
      if (slon < 0) {
        ctx.textAlign = "left";
        ctx.font = "10px Arial";
        ctx.fillText(
          "R",
          x + metrics.width / 2,
          y - metrics.fontBoundingBoxAscent / 2
        );
        ctx.font = "20px glyphsFont";
        ctx.textAlign = "center";
      }
      // small line from the planet to the circle
      const x0 = width / 2 + radius * Math.cos(rads);
      const y0 = height / 2 + radius * Math.sin(rads);
      let x1 = width / 2 + radiusPlanets * Math.cos(rads);
      let y1 = height / 2 + radiusPlanets * Math.sin(rads);
      const lineSize = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      if (lineSize > 5) {
        const ftr = 8 / lineSize;
        x1 = x0 + (x1 - x0) * ftr;
        y1 = y0 + (y1 - y0) * ftr;
      }
      ctx.beginPath();
      ctx.strokeStyle = "#00CCFF";
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }

  // part of fortune
  {
    const lonAsc = houses[0];
    const sun = planetPositions[Planet.Sun];
    const { lon: lonSun } = sun;
    const moon = planetPositions[Planet.Moon];
    const { lon: lonMoon } = moon;
    const isDayChart = (lonAsc + 180) % 360 < (lonSun + 180) % 360;
    const lonFortune = isDayChart
      ? (lonAsc + lonMoon - lonSun + 360) % 360
      : (lonAsc + lonSun - lonMoon + 360) % 360;
    const rads = ((angleOffset - lonFortune) * Math.PI) / 180;
    ctx.fillStyle = "#FF00FF";
    ctx.beginPath();
    const x = width / 2 + radius * 1.05 * Math.cos(rads);
    const y = height / 2 + radius * 1.05 * Math.sin(rads);
    ctx.fillText(partFortuneGlyph, x, y + fontHeight / 4);
  }

  // draw aspects
  {
    const arad = radius - 4;
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        // compare each planet to the previous one
        const p1 = planetPositions[planets[i]];
        const p2 = planetPositions[planets[j]];
        const angle = (Math.abs(p1.rads - p2.rads) * 180) / Math.PI;
        const p1sign = Math.floor(p1.lon / 30);
        const p2sign = Math.floor(p2.lon / 30);
        const orb = 5;
        let color = "";
        if (p1sign === p2sign && angle < orb /* conjunct*/) {
          color = "#FFFF00";
        } else if (
          !(((p1sign - p2sign) % 2) /* sextile*/) &&
          ((angle > 60 - orb && angle < 60 + orb) ||
            (angle > 300 - orb && angle < 300 + orb))
        ) {
          color = "#00FFFF";
        } else if (
          !(((p1sign - p2sign) % 3) /* square*/) &&
          ((angle > 90 - orb && angle < 90 + orb) ||
            (angle > 270 - orb && angle < 270 + orb))
        ) {
          color = "#FF0000";
        } else if (
          !(((p1sign - p2sign) % 4) /* trine*/) &&
          ((angle > 120 - orb && angle < 120 + orb) ||
            (angle > 240 - orb && angle < 240 + orb))
        ) {
          color = "#00FF00";
        } else if (
          !(((p1sign - p2sign) % 6) /* opposition*/) &&
          angle > 180 - orb &&
          angle < 180 + orb
        ) {
          color = "#FF00FF";
        }
        if (!color) continue;
        ctx.beginPath();
        ctx.strokeStyle = color;
        const x1 = width / 2 + arad * Math.cos(p1.rads);
        const y1 = height / 2 + arad * Math.sin(p1.rads);
        const x2 = width / 2 + arad * Math.cos(p2.rads);
        const y2 = height / 2 + arad * Math.sin(p2.rads);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }

  // draw sign lines and write sign symbols
  {
    ctx.font = "20px glyphsFont";
    ctx.fillStyle = chartColors.signs;
    ctx.textAlign = "center";
    ctx.strokeStyle = chartColors.stroke;
    const metrics = ctx.measureText("M");
    const fontHeight =
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const radiusSign = radius + Math.min(width,height)*0.0666666;
    for (let i = 0; i < signGlyph.length; i++) {
      const signRads = ((angleOffset - i * 30 - 15) * Math.PI) / 180;
      const x = width / 2 + radiusSign * Math.cos(signRads);
      const y = height / 2 + radiusSign * Math.sin(signRads);
      ctx.fillText(signGlyph[i], x, y + fontHeight / 4);
      const strokeRads = ((angleOffset - i * 30) * Math.PI) / 180;
      const x0 = width / 2 + radius * Math.cos(strokeRads);
      const y0 = height / 2 + radius * Math.sin(strokeRads);
      const x1 = width / 2 + (radius + 30) * Math.cos(strokeRads);
      const y1 = height / 2 + (radius + 30) * Math.sin(strokeRads);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }
}
