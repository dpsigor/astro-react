import { HouseSystem, Planet } from "./consts";

export interface Sweph {
  jd(date: Date): { jd: number; err?: string };
  planetPos(
    jd: number,
    planet: Planet
  ): { lon: number; slon: number; err?: string };
  houses(
    jd: number,
    geolat: number,
    geolon: number,
    hsys: HouseSystem
  ): number[];
}
