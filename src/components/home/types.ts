import { ImageSourcePropType } from 'react-native';
import { LocationCoordinates } from '@/context/location-context';

export interface RouteStop {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
}

export interface Origin {
  name: string;
  address: string;
  coordinates: LocationCoordinates;
}

export interface RideOption {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: ImageSourcePropType;
}
