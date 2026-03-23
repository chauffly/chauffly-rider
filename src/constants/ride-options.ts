import { RideOption } from '@/components/home/types';

export const rideOptions: RideOption[] = [
  {
    id: 'go',
    nameKey: 'booking.ride_option_go',
    subtitleKey: 'booking.ride_option_subtitle_go',
    priceKey: 'booking.ride_option_price_go',
    image: require('@assets/images/ride-options/go.png')
  },
  {
    id: 'plus',
    nameKey: 'booking.ride_option_plus',
    subtitleKey: 'booking.ride_option_subtitle_plus',
    priceKey: 'booking.ride_option_price_plus',
    image: require('@assets/images/ride-options/plus.png')
  },
  {
    id: 'luxe',
    nameKey: 'booking.ride_option_luxe',
    subtitleKey: 'booking.ride_option_subtitle_luxe',
    priceKey: 'booking.ride_option_price_luxe',
    image: require('@assets/images/ride-options/luxe.png')
  },
  {
    id: 'black',
    nameKey: 'booking.ride_option_black',
    subtitleKey: 'booking.ride_option_subtitle_black',
    priceKey: 'booking.ride_option_price_black',
    image: require('@assets/images/ride-options/black.png')
  }
];
