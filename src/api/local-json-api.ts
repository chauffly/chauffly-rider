import { RideOption } from '@/components/home/types';

type RideTabKey = 'past' | 'upcoming' | 'ongoing' | 'canceled';

type ApiUser = {
  id: string;
  phone_number: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    avatar_asset: string;
  };
  wallet: {
    id: string;
    currency: string;
    available_balance: number;
  };
};

type ApiDriver = {
  id: string;
  user_id: string;
  full_name: string;
  display_name: string;
  phone_number: string;
  rating: number;
  review_count: number;
  trips_completed: number;
  member_since: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    display_name: string;
  };
};

type ApiRideOptionRecord = {
  id: string;
  name_key: string;
  subtitle_key: string;
  price_key: string;
  image_asset: 'go.png' | 'plus.png' | 'luxe.png' | 'black.png';
};

type ApiRideStop = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
};

type ApiRideRecord = {
  id: string;
  type: 'history' | 'live';
  driver_id: string;
  rating?: string;
  reviews?: string;
  vehicle_name?: string;
  vehicle_meta?: string;
  stops: ApiRideStop[];
  seat_info?: number;
  schedule?: string;
  fare: string;
  show_track_route?: boolean;
};

type ApiBooking = {
  id: string;
  rider_user_id: string;
  driver_id: string;
  selected_ride_option_id: string;
  booking_type: 'instant' | 'scheduled';
  status: string;
  route_defaults: {
    origin_name: string;
    origin_address: string;
    destination_name: string;
    destination_address: string;
  };
  fare_breakdown: {
    currency: string;
    trip_fare: string;
    tax: string;
    total: string;
  };
  trip_metrics: {
    duration_text: string;
    distance_text: string;
    average_speed_text: string;
  };
  payment: {
    method_type: string;
    display_name: string;
    masked_pan: string;
  };
  created_at: string;
  updated_at: string;
};

type ApiSavedAddress = {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  created_at: string;
  updated_at: string;
};

type ApiChatMessage = {
  id: string;
  sender_type: 'driver' | 'rider';
  text: string;
  time: string;
};

type ApiChatThread = {
  id: string;
  booking_id: string;
  driver_id: string;
  messages: ApiChatMessage[];
};

type UiDefaults = {
  booking: {
    pickup_placeholder: string;
    destination_placeholder: string;
    set_location_pickup_label: string;
    set_location_pickup_subtitle: string;
    default_eta_minutes: number;
    heading_destination_title: string;
    heading_destination_subtitle: string;
  };
  rides: {
    screen_title: string;
    search_placeholder: string;
    track_route_label: string;
    verified_account_label: string;
  };
};

type CorporatePeriodKey = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days';

type CorporateSummary = {
  total_employees: number;
  total_rides: number;
  new_employees: number;
  monthly_usage: string;
  growth: {
    total_employees: string;
    total_rides: string;
    new_employees: string;
    monthly_usage: string;
  };
};

type CorporateJoinRequest = {
  id: string;
  name: string;
  email: string;
  requested_date: string;
};

type CorporateEmployee = {
  id: string;
  name: string;
  email: string;
  last_active: string;
  is_online: boolean;
};

type CorporateInvoice = {
  id: string;
  destination: string;
  date: string;
  amount: string;
  payment_method: string;
  status: 'paid' | 'cancelled';
  payment_card: string;
  transaction_id: string;
  time: string;
  full_date: string;
  image: 'go.png' | 'plus.png' | 'luxe.png' | 'black.png';
};

type CorporateData = {
  corporate_dashboard: {
    summary_by_period: Record<CorporatePeriodKey, CorporateSummary>;
    usage_overview_bars: number[];
    usage_overview_by_period?: Record<
      CorporatePeriodKey,
      {
        y_ticks: number[];
        points: { label: string; value: number }[];
      }
    >;
  };
  users_tab: {
    employees: CorporateEmployee[];
    join_requests: CorporateJoinRequest[];
  };
  billing_invoice: {
    current_cycle: string;
    total_spend: string;
    invoice_status: string;
    next_billing_date: string;
  };
  invoices: CorporateInvoice[];
};

type ApiRideListItem = {
  id: string;
  type: 'history' | 'live';
  driverId: string;
  driverName: string;
  rating?: string;
  reviews?: string;
  vehicleName?: string;
  vehicleMeta?: string;
  stops: ApiRideStop[];
  seatInfo?: number;
  schedule?: string;
  fare: string;
  showTrackRoute?: boolean;
};

type RideTabRecord = {
  key: RideTabKey;
  label: string;
};

const usersData = require('../../../api-data/users.json') as { users: ApiUser[] };
const driversData = require('../../../api-data/drivers.json') as { drivers: ApiDriver[] };
const rideOptionsData = require('../../../api-data/ride-options.json') as {
  ride_options: ApiRideOptionRecord[];
};
const ridesData = require('../../../api-data/rides.json') as {
  tabs: RideTabRecord[];
  rides_by_tab: Record<RideTabKey, ApiRideRecord[]>;
};
const bookingsData = require('../../../api-data/bookings.json') as {
  active_booking: ApiBooking;
};
const addressesData = require('../../../api-data/addresses.json') as {
  saved_addresses: ApiSavedAddress[];
};
const chatData = require('../../../api-data/chat-messages.json') as {
  threads: ApiChatThread[];
};
const authData = require('../../../api-data/auth.json') as {
  auth_defaults: {
    login: { phone_number: string; password: string };
    register: {
      phone_number: string;
      password: string;
      confirm_password: string;
      agree_to_terms: boolean;
    };
  };
};
const uiDefaultsData = require('../../../api-data/ui-defaults.json') as UiDefaults;
const corporateData = require('../../../api-data/corporate.json') as CorporateData;

const rideOptionImages: Record<ApiRideOptionRecord['image_asset'], number> = {
  'go.png': require('../../assets/images/ride-options/go.png'),
  'plus.png': require('../../assets/images/ride-options/plus.png'),
  'luxe.png': require('../../assets/images/ride-options/luxe.png'),
  'black.png': require('../../assets/images/ride-options/black.png'),
};

export const localJsonApi = {
  getCurrentUser(): ApiUser {
    return usersData.users[0];
  },

  getCurrentUserRole(): string {
    return usersData.users[0]?.role ?? 'rider';
  },

  getDriverById(driverId?: string): ApiDriver {
    if (!driverId) {
      return driversData.drivers[0];
    }
    return driversData.drivers.find((driver) => driver.id === driverId) ?? driversData.drivers[0];
  },

  getPrimaryDriver(): ApiDriver {
    return driversData.drivers[0];
  },

  getRideOptions(): RideOption[] {
    return rideOptionsData.ride_options.map((option) => ({
      id: option.id,
      nameKey: option.name_key,
      subtitleKey: option.subtitle_key,
      priceKey: option.price_key,
      image: rideOptionImages[option.image_asset],
    }));
  },

  getActiveBooking(): ApiBooking {
    return bookingsData.active_booking;
  },

  getRideTabs(): RideTabRecord[] {
    return ridesData.tabs;
  },

  getRidesByTab(tabKey: RideTabKey): ApiRideListItem[] {
    return ridesData.rides_by_tab[tabKey].map((ride) => {
      const driver = this.getDriverById(ride.driver_id);
      return {
        id: ride.id,
        type: ride.type,
        driverId: ride.driver_id,
        driverName: driver.display_name,
        rating: ride.rating,
        reviews: ride.reviews,
        vehicleName: ride.vehicle_name,
        vehicleMeta: ride.vehicle_meta,
        stops: ride.stops,
        seatInfo: ride.seat_info,
        schedule: ride.schedule,
        fare: ride.fare,
        showTrackRoute: ride.show_track_route,
      };
    });
  },

  getSavedAddresses(): ApiSavedAddress[] {
    return addressesData.saved_addresses;
  },

  getChatMessages(bookingId?: string): ApiChatMessage[] {
    const activeBookingId = bookingId ?? bookingsData.active_booking.id;
    const thread = chatData.threads.find((record) => record.booking_id === activeBookingId);
    return thread?.messages ?? [];
  },

  getAuthDefaults() {
    return authData.auth_defaults;
  },

  getUiDefaults(): UiDefaults {
    return uiDefaultsData;
  },

  getCorporateSummary(period: CorporatePeriodKey): CorporateSummary {
    return corporateData.corporate_dashboard.summary_by_period[period];
  },

  getCorporateUsageOverviewBars(): number[] {
    return corporateData.corporate_dashboard.usage_overview_bars;
  },

  getCorporateUsageOverview(period: CorporatePeriodKey): {
    yTicks: number[];
    points: { label: string; value: number }[];
  } {
    const periodData = corporateData.corporate_dashboard.usage_overview_by_period?.[period];
    if (periodData) {
      return {
        yTicks: periodData.y_ticks,
        points: periodData.points,
      };
    }

    const bars = corporateData.corporate_dashboard.usage_overview_bars;
    return {
      yTicks: [0, 500, 1000, 1500, 2000, 2500],
      points: bars.map((value, index) => ({
        label: `P${index + 1}`,
        value,
      })),
    };
  },

  getCorporateUsersData(): CorporateData['users_tab'] {
    return corporateData.users_tab;
  },

  getCorporateBillingInvoice(): CorporateData['billing_invoice'] {
    return corporateData.billing_invoice;
  },

  getCorporateInvoices(): CorporateInvoice[] {
    return corporateData.invoices;
  },

  getCorporateInvoiceById(id: string): CorporateInvoice | undefined {
    return corporateData.invoices.find((inv) => inv.id === id);
  },
};

export type { RideTabKey, ApiSavedAddress, CorporatePeriodKey, CorporateJoinRequest, CorporateEmployee, CorporateInvoice };
