import { signGlyph } from "./sweph";
import { Dignity, HouseSystem, Planet, planetGlyph, planets, Sign, signs, Sweph } from "./vos/sweph";

export interface ChartCfg {
  date: Date;
  width: number;
  height: number;
  radius: number;
  geolat: number;
  geolon: number;
}

const planetPositions = new Map<
  Planet,
  {
    rads: number;
    lon: number;
    slon: number;
    x: number;
    y: number;
  }
>();

function dignityColor(d?: Dignity) {
  if (!d) return "#00CCFF";
  switch (d) {
    case Dignity.Domicile:
      return "#00FF00";
    case Dignity.Exaltation:
      return "#FFFF00";
    case Dignity.Fall:
      return "#CD5C5C";
    case Dignity.Detriment:
      return "#FF0000";
    default:
      throw new Error(`Unknown dignity: ${d}`);
  }
}

export function dignity(p: Planet, lon: number): Dignity | undefined {
  const sign = signs[Math.floor(lon / 30)];
  if (sign === undefined) throw new Error(`sign not found at lon ${lon}`);
  switch (p) {
    case Planet.Sun:
      if (sign === Sign.Leo) return Dignity.Domicile;
      if (sign === Sign.Aquarius) return Dignity.Detriment;
      if (sign === Sign.Aries) return Dignity.Exaltation;
      if (sign === Sign.Libra) return Dignity.Fall;
      return;
    case Planet.Moon:
      if (sign === Sign.Cancer) return Dignity.Domicile;
      if (sign === Sign.Capricorn) return Dignity.Detriment;
      if (sign === Sign.Taurus) return Dignity.Exaltation;
      if (sign === Sign.Scorpio) return Dignity.Fall;
      return;
    case Planet.Mercury:
      if (sign === Sign.Gemini) return Dignity.Domicile;
      if (sign === Sign.Sagittarius) return Dignity.Detriment;
      if (sign === Sign.Virgo) return Dignity.Domicile;
      if (sign === Sign.Pisces) return Dignity.Detriment;
      return;
    case Planet.Venus:
      if (sign === Sign.Taurus||sign === Sign.Libra) return Dignity.Domicile;
      if (sign === Sign.Scorpio || sign === Sign.Aries) return Dignity.Detriment;
      if (sign === Sign.Pisces) return Dignity.Exaltation;
      if (sign === Sign.Virgo) return Dignity.Fall;
      return;
    case Planet.Mars:
      if (sign === Sign.Aries||sign === Sign.Scorpio) return Dignity.Domicile;
      if (sign === Sign.Libra || sign === Sign.Taurus) return Dignity.Detriment;
      if (sign === Sign.Capricorn) return Dignity.Exaltation;
      if (sign === Sign.Cancer) return Dignity.Fall;
      return;
    case Planet.Jupiter:
      if (sign === Sign.Sagittarius||sign === Sign.Pisces) return Dignity.Domicile;
      if (sign === Sign.Gemini || sign === Sign.Virgo) return Dignity.Detriment;
      if (sign === Sign.Cancer) return Dignity.Exaltation;
      if (sign === Sign.Capricorn) return Dignity.Fall;
      return;
    case Planet.Saturn:
      if (sign === Sign.Capricorn||sign === Sign.Aquarius) return Dignity.Domicile;
      if (sign === Sign.Cancer || sign === Sign.Leo) return Dignity.Detriment;
      if (sign === Sign.Libra) return Dignity.Exaltation;
      if (sign === Sign.Aries) return Dignity.Fall;
      return;
  }
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  sweph: Sweph,
  opts: ChartCfg,
) {
    const { date, width, height, radius, geolat, geolon } = opts;
    ctx.clearRect(0, 0, width, height);
    // fill black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { jd, err } = sweph.jd(date);
    if (err) throw err; // TODO: handle error
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();

    const houses = sweph.houses(
      jd,
      geolat,
      geolon,
      HouseSystem.Placidus
    );

    const angleOffset = 180 + houses[0];

    // draw house lines
    {
      const innerCircleRadius = 20;
      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        innerCircleRadius,
        0,
        2 * Math.PI
      );
      ctx.lineWidth = 3;
      ctx.stroke();
      for (let i = 0; i < houses.length; i++) {
        let r = radius;
        ctx.lineWidth = 1;
        if (!(i % 6) || !((i - 3) % 6)) {
          r += 20;
          // make the stroke thicker
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

    // write planets
    {
      ctx.font = "20px glyphsFont";
      ctx.textAlign = "center";
      const metrics = ctx.measureText("M");
      const fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      const radiusPlanets = radius + 20;
      for (const planet of planets) {
        const glyph = planetGlyph[planet];
        const { lon, slon, err } = sweph.planetPos(jd, planet);
        if (err) throw err;
        ctx.fillStyle = dignityColor(dignity(planet, lon));
        const rads = ((angleOffset - lon) * Math.PI) / 180;
        const x = width / 2 + radiusPlanets * Math.cos(rads);
        let y = height / 2 + radiusPlanets * Math.sin(rads);
        planetPositions.set(planet, { x, y, rads, lon, slon });
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

    // draw aspects
    {
      const arad = radius - 4;
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          // compare each planet to the previous one
          const p1 = planetPositions.get(planets[i]);
          if (!p1) throw new Error(`planet at index ${i} not found`);
          const p2 = planetPositions.get(planets[j]);
          if (!p2) throw new Error(`planet at index ${i} not found`);
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
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#FFFFFF";
      const metrics = ctx.measureText("M");
      const fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      const radiusSign = radius + 40;
      for (let i = 0; i < signGlyph.length; i++) {
        const signRads = ((angleOffset - i * 30 - 15) * Math.PI) / 180;
        const x = width / 2 + radiusSign * Math.cos(signRads);
        let y = height / 2 + radiusSign * Math.sin(signRads);
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
