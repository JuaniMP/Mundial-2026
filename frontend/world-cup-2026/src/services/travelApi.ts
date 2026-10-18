import axios from 'axios';
import { API_BASE_URL } from './http';

const BASE = API_BASE_URL;

export interface HotelSuggestion {
  hotelId: string | null;
  nombre: string;
  categoria: string | null;
  estrellas: number;
  ciudad: string;
  pais: string | null;
  latitud: number | null;
  longitud: number | null;
  bookingUrl: string;
  distanciaEstadio: string;
  disponible: boolean;
}

export interface Atraccion {
  nombre: string;
  tipo: string;
  emoji: string;
  descripcion: string;
  mapsUrl: string;
}

export interface TravelSuggestions {
  estadio: string;
  ciudad: string;
  pais: string;
  iataCode: string;
  googleFlightsUrl: string;
  skyscannerUrl: string;
  bookingCiudadUrl: string;
  hoteles: HotelSuggestion[];
  atracciones: Atraccion[];
  apiFuncional: boolean;
}

export async function fetchTravelSuggestions(estadio: string): Promise<TravelSuggestions> {
  const r = await axios.get(`${BASE}/api/v1/viaje/sugerencias`, {
    params: { estadio },
  });
  return (r.data.data ?? r.data) as TravelSuggestions;
}
