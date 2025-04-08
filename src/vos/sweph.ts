export enum HouseSystem {
  Placidus = "P".charCodeAt(0),
  Regiomontanus = "R".charCodeAt(0),
}

export enum Planet {
  Sun = 0,
  Moon = 1,
  Mercury = 2,
  Venus = 3,
  Mars = 4,
  Jupiter = 5,
  Saturn = 6,
}

export const planets = [
  Planet.Sun,
  Planet.Moon,
  Planet.Mercury,
  Planet.Venus,
  Planet.Mars,
  Planet.Jupiter,
  Planet.Saturn,
];

export const planetGlyph = {
  [Planet.Sun]: "A",
  [Planet.Moon]: "B",
  [Planet.Mercury]: "C",
  [Planet.Venus]: "D",
  [Planet.Mars]: "E",
  [Planet.Jupiter]: "F",
  [Planet.Saturn]: "G",
};

export const planetGlyphUnicode = {
  [Planet.Sun]: "☉",
  [Planet.Moon]: "☽",
  [Planet.Mercury]: "☿",
  [Planet.Venus]: "♀︎",
  [Planet.Mars]: "♂︎",
  [Planet.Jupiter]: "♃",
  [Planet.Saturn]: "♄",
}

export enum Sign {
  Aries = 0,
  Taurus = 1,
  Gemini = 2,
  Cancer = 3,
  Leo = 4,
  Virgo = 5,
  Libra = 6,
  Scorpio = 7,
  Sagittarius = 8,
  Capricorn = 9,
  Aquarius = 10,
  Pisces = 11,
}

export const signs = [
  Sign.Aries ,
  Sign.Taurus ,
  Sign.Gemini ,
  Sign.Cancer ,
  Sign.Leo ,
  Sign.Virgo ,
  Sign.Libra ,
  Sign.Scorpio ,
  Sign.Sagittarius ,
  Sign.Capricorn ,
  Sign.Aquarius ,
  Sign.Pisces ,
]

export enum Dignity {
  Domicile = 1,
  Detriment = 2,
  Exaltation = 3,
  Fall = 4,
}

export interface Sweph {
  jd(date: Date): { jd: number; err?: string }
  planetPos(jd: number, planet: Planet): { lon: number; slon: number; err?: string }
  houses(jd: number, geolat: number, geolon: number, hsys: HouseSystem): number[] 
}
