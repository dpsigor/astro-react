import { Planet, Sign, signs } from "./consts";

export enum Dignity {
  Domicile = 1,
  Detriment = 2,
  Exaltation = 3,
  Fall = 4,
}

const dignities = {
  [Planet.Sun]: {
    [Sign.Leo]: Dignity.Domicile,
    [Sign.Aquarius]: Dignity.Detriment,
    [Sign.Aries]: Dignity.Exaltation,
    [Sign.Libra]: Dignity.Fall,
  },
  [Planet.Moon]: {
    [Sign.Cancer]: Dignity.Domicile,
    [Sign.Capricorn]: Dignity.Detriment,
    [Sign.Taurus]: Dignity.Exaltation,
    [Sign.Scorpio]: Dignity.Fall,
  },
  [Planet.Mercury]: {
    [Sign.Gemini]: Dignity.Domicile,
    [Sign.Sagittarius]: Dignity.Detriment,
    [Sign.Virgo]: Dignity.Domicile,
    [Sign.Pisces]: Dignity.Detriment,
  },
  [Planet.Venus]: {
    [Sign.Taurus]: Dignity.Domicile,
    [Sign.Libra]: Dignity.Domicile,
    [Sign.Scorpio]: Dignity.Detriment,
    [Sign.Aries]: Dignity.Detriment,
    [Sign.Pisces]: Dignity.Exaltation,
    [Sign.Virgo]: Dignity.Fall,
  },
  [Planet.Mars]: {
    [Sign.Aries]: Dignity.Domicile,
    [Sign.Scorpio]: Dignity.Domicile,
    [Sign.Libra]: Dignity.Detriment,
    [Sign.Taurus]: Dignity.Detriment,
    [Sign.Capricorn]: Dignity.Exaltation,
    [Sign.Cancer]: Dignity.Fall,
  },
  [Planet.Jupiter]: {
    [Sign.Sagittarius]: Dignity.Domicile,
    [Sign.Pisces]: Dignity.Domicile,
    [Sign.Gemini]: Dignity.Detriment,
    [Sign.Virgo]: Dignity.Detriment,
    [Sign.Cancer]: Dignity.Exaltation,
    [Sign.Capricorn]: Dignity.Fall,
  },
  [Planet.Saturn]: {
    [Sign.Capricorn]: Dignity.Domicile,
    [Sign.Aquarius]: Dignity.Domicile,
    [Sign.Cancer]: Dignity.Detriment,
    [Sign.Leo]: Dignity.Detriment,
    [Sign.Libra]: Dignity.Exaltation,
    [Sign.Aries]: Dignity.Fall,
  },
}

export function dignity(p: Planet, lon: number): Dignity | undefined {
  const sign = signs[Math.floor(lon / 30)];
  if (sign === undefined) throw new Error(`sign not found at lon ${lon}`); // should never happen
  const digs: any = dignities[p];
  if (!digs) throw new Error(`dignity not found for planet ${p}`); // should never happen
  return digs[sign];
}
