import { WASI, File, OpenFile } from "@bjorn3/browser_wasi_shim";
import { Planet, HouseSystem } from "./vos/consts";

interface Astro {
  memory: WebAssembly.Memory;
  swe_utc_to_jd: (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    gregflag: number,
    dret: number, // Float64Array, idx1 = universal time
    serr: number // Uint8Array
  ) => number;
  swe_calc_ut: (
    tjd_ut: number,
    ipl: number,
    iflag: number,
    xxPtr: number,
    serrPtr: number
  ) => number;
  swe_houses: (
    tjd_ut: number,
    lat: number,
    lon: number,
    hsys: number,
    cuspPtr: number, // Float64Array, houses at indexes 1..12
    ascmcPtr: number
  ) => number;
}

export class SwEph {
  constructor(private astro: Astro) {}

  jd(date: Date): { jd: number; err?: string } {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds() + date.getUTCMilliseconds() / 1000;
    const gregflag = 1;
    const dretPtr = 0;
    const serrPtr = 2 * 8;
    const jdCode = this.astro.swe_utc_to_jd(
      year,
      month,
      day,
      hour,
      minute,
      second,
      gregflag,
      dretPtr,
      serrPtr
    );
    if (jdCode < 0) {
      const serr = new Uint8Array(this.astro.memory.buffer, serrPtr, 256);
      return { jd: 0, err: new TextDecoder().decode(serr) };
    }
    const dret = new Float64Array(this.astro.memory.buffer, dretPtr, 2);
    return { jd: dret[1] };
  }

  planetPos(
    jd: number,
    planet: Planet
  ): { lon: number; slon: number; err?: string } {
    const iflag = 128; // no flags
    const xxPtr = 0;
    const serrPtr = 6 * 8;
    const calcCode = this.astro.swe_calc_ut(jd, planet, iflag, xxPtr, serrPtr);
    if (calcCode < 0) {
      const serr2 = new Uint8Array(this.astro.memory.buffer, serrPtr, 256);
      const err = new TextDecoder().decode(serr2);
      return { lon: 0, slon: 0, err };
    }
    const xx = new Float64Array(this.astro.memory.buffer, xxPtr, 6);
    const lon = xx[0];
    return { lon, slon: xx[3] };
  }

  houses(
    jd: number,
    geolat: number,
    geolon: number,
    hsys: HouseSystem
  ): number[] {
    const cuspsPtr = 0;
    const ascmcPtr = 13 * 8;
    this.astro.swe_houses(jd, geolat, geolon, hsys, cuspsPtr, ascmcPtr);
    const cusps = new Float64Array(this.astro.memory.buffer, cuspsPtr, 13);
    return Array.from(cusps).slice(1);
  }
}

export async function swephInit(rootPath: string): Promise<SwEph> {
  const args: string[] = [];
  const env: string[] = [];
  const fds = [
    new OpenFile(new File([])), // stdin
    new OpenFile(new File([])), // stdout
    new OpenFile(new File([])), // stderr
  ];
  const wasi = new WASI(args, env, fds);

  const wasm = await WebAssembly.compileStreaming(
    fetch(`${rootPath}/astro.wasm`)
  );
  const inst = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });
  wasi.start(inst as unknown as any);
  const sweph = new SwEph(inst.exports as unknown as any);
  return sweph;
}
