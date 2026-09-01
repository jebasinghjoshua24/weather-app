"use client";

import { create } from "zustand";

export interface Location {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  timezone?: string;
}

interface WeatherStore {
  location: Location | null;
  isLocating: boolean;
  error: string | null;
  setLocation: (loc: Location) => void;
  setLocating: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  location: null,
  isLocating: false,
  error: null,
  setLocation: (location) => set({ location, error: null }),
  setLocating: (isLocating) => set({ isLocating }),
  setError: (error) => set({ error }),
}));
