export type Unit = "c" | "f";

export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface Forecast {
  temperature: number;
  time: string;
}

export interface DailyForecast {
  date: string;
  code: number;
  max: number;
  min: number;
}