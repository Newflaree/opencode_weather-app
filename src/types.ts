export type Unit = "c" | "f";

export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Config {
  cities: City[];
  defaultId: string | null;
  unit: Unit;
}