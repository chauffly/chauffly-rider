import { RideOption } from '@/components/home/types';

export const rideOptions: RideOption[] = [
  {
    id: 'go',
    nameKey: 'ride_options.go',
    subtitleKey: 'ride_options.go_subtitle',
    priceKey: 'ride_options.go_price',
    image: require('@assets/images/ride-options/go.png')
  },
  {
    id: 'plus',
    nameKey: 'ride_options.plus',
    subtitleKey: 'ride_options.plus_subtitle',
    priceKey: 'ride_options.plus_price',
    image: require('@assets/images/ride-options/plus.png')
  },
  {
    id: 'luxe',
    nameKey: 'ride_options.luxe',
    subtitleKey: 'ride_options.luxe_subtitle',
    priceKey: 'ride_options.luxe_price',
    image: require('@assets/images/ride-options/luxe.png')
  },
  {
    id: 'black',
    nameKey: 'ride_options.black',
    subtitleKey: 'ride_options.black_subtitle',
    priceKey: 'ride_options.black_price',
    image: require('@assets/images/ride-options/black.png')
  }
];
