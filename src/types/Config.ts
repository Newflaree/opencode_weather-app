import type { City } from "./City.ts";
import type { Unit } from "./Weather.ts";

export interface Config {
  cities: City[];
  defaultId: string | null;
  unit: Unit;
}