export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface GeoLocationState {
  position: GeoPosition;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  isTracking: boolean;
}

export interface GeoLocationContextType extends GeoLocationState {
  requestPosition: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
}
