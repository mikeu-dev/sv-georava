export interface NominatimHit {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
}

export interface GeocodingOptions {
  appId?: string;
  minIntervalMs?: number;
  language?: string;
}

export class GeocodingService {
  private appId: string;
  private minIntervalMs: number;
  private language: string;
  private lastRequestAt = 0;
  private queue: Promise<any> = Promise.resolve();

  constructor(options: GeocodingOptions = {}) {
    this.appId = options.appId || 'Geovara/0.1.0';
    this.minIntervalMs = options.minIntervalMs || 1000;
    this.language = options.language || 'en';
  }

  private getFetchInit(): RequestInit {
    const headers = new Headers();
    headers.set('Accept-Language', this.language);
    headers.set('User-Agent', `${this.appId} (geospatial map editor)`);
    return { headers };
  }

  async search(params: Record<string, string | number | undefined>): Promise<NominatimHit[]> {
    const q = new URLSearchParams();
    q.set('format', 'json');
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
    }
    const url = `https://nominatim.openstreetmap.org/search?${q.toString()}`;

    const response = await this.throttledFetch(url);
    if (!response.ok) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? (data as NominatimHit[]) : [];
  }

  async reverse(lat: number, lon: number): Promise<NominatimHit | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await this.throttledFetch(url);
    if (!response.ok) return null;
    return response.json();
  }

  private throttledFetch(url: string): Promise<Response> {
    const run = this.queue.then(async () => {
      const gap = Date.now() - this.lastRequestAt;
      if (gap < this.minIntervalMs) {
        await new Promise((r) => setTimeout(r, this.minIntervalMs - gap));
      }
      this.lastRequestAt = Date.now();
      return fetch(url, this.getFetchInit());
    });

    this.queue = run.then(
      () => undefined,
      () => undefined
    );

    return run;
  }
}

export const defaultGeocodingService = new GeocodingService();
