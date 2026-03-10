import { ChaufflyApiClient } from '../client';

export type RideTabKey = 'past' | 'upcoming' | 'ongoing' | 'canceled';

export interface LegacyRideOption {
  id: string;
  nameKey: string;
  subtitleKey: string;
  priceKey: string;
  imageAsset: 'go.png' | 'plus.png' | 'luxe.png' | 'black.png';
}

export interface LegacyRideTabRecord {
  key: RideTabKey;
  label: string;
}

export interface LegacyRideListItem {
  id: string;
  type: 'history' | 'live';
  driverId: string;
  driverName: string;
  rating?: string;
  reviews?: string;
  vehicleName?: string;
  vehicleMeta?: string;
  stops: Array<{
    id: string;
    title: string;
    subtitle: string;
    time: string;
  }>;
  seatInfo?: number;
  schedule?: string;
  fare: string;
  showTrackRoute?: boolean;
}

const rideTabs: LegacyRideTabRecord[] = [
  { key: 'past', label: 'Past' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'canceled', label: 'Canceled' }
];

const read = (input: unknown, key: string): unknown => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  return (input as Record<string, unknown>)[key];
};

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const toImageAsset = (tier: string): LegacyRideOption['imageAsset'] => {
  const normalized = tier.toLowerCase();

  if (normalized === 'plus') {
    return 'plus.png';
  }

  if (normalized === 'luxe') {
    return 'luxe.png';
  }

  if (normalized === 'black' || normalized === 'elite') {
    return 'black.png';
  }

  return 'go.png';
};

export class LocalJsonApiAdapter {
  constructor(private readonly apiClient: ChaufflyApiClient) {}

  public async getCurrentUser(): Promise<Record<string, unknown>> {
    return this.apiClient.usersApi.getCurrentUser();
  }

  public async getCurrentUserRole(): Promise<string> {
    const user = await this.apiClient.usersApi.getCurrentUser();
    return asString(read(user, 'role'), 'rider');
  }

  public async getRideOptions(): Promise<LegacyRideOption[]> {
    const options = await this.apiClient.rideOptionsApi.list();

    return options.map((option) => {
      const tier = asString(read(option, 'tier'), 'go');
      const name = asString(read(option, 'name'), tier);
      const description = asString(read(option, 'description'), tier);
      const estimated = asNumber(read(option, 'estimated_fare'), 0);

      return {
        id: asString(read(option, 'id')),
        nameKey: `ride.${name.toLowerCase()}.name`,
        subtitleKey: description ? `ride.${name.toLowerCase()}.subtitle` : 'ride.default.subtitle',
        priceKey: estimated > 0 ? `₦${estimated.toLocaleString()}` : 'From ₦0',
        imageAsset: toImageAsset(tier)
      };
    });
  }

  public async getActiveBooking(): Promise<Record<string, unknown> | null> {
    return this.apiClient.bookingApi.getActive();
  }

  public getRideTabs(): LegacyRideTabRecord[] {
    return rideTabs;
  }

  public async getRidesByTab(tabKey: RideTabKey): Promise<LegacyRideListItem[]> {
    const tab: 'past' | 'upcoming' | 'ongoing' | 'cancelled' =
      tabKey === 'canceled' ? 'cancelled' : tabKey;
    const response = await this.apiClient.bookingApi.list({ tab });
    const items = (read(response, 'items') as Array<Record<string, unknown>> | undefined) ?? [];

    return items.map((booking) => {
      const bookingId = asString(read(booking, 'id'));
      const driver = (read(booking, 'driver') as Record<string, unknown> | undefined) ?? {};
      const fare = (read(booking, 'fare') as Record<string, unknown> | undefined) ?? {};
      const pickup = (read(booking, 'pickup') as Record<string, unknown> | undefined) ?? {};
      const destination = (read(booking, 'destination') as Record<string, unknown> | undefined) ?? {};

      return {
        id: bookingId,
        type: tabKey === 'ongoing' || tabKey === 'upcoming' ? 'live' : 'history',
        driverId: asString(read(driver, 'id')),
        driverName: asString(read(driver, 'display_name')),
        stops: [
          {
            id: `${bookingId}-pickup`,
            title: asString(read(pickup, 'name'), 'Pickup'),
            subtitle: asString(read(pickup, 'address')),
            time: asString(read(booking, 'created_at')).slice(11, 16)
          },
          {
            id: `${bookingId}-destination`,
            title: asString(read(destination, 'name'), 'Destination'),
            subtitle: asString(read(destination, 'address')),
            time: asString(read(booking, 'completed_at')).slice(11, 16)
          }
        ],
        fare: asString(read(fare, 'total'), asString(read(booking, 'total'), '₦0')),
        showTrackRoute: tabKey === 'ongoing'
      };
    });
  }

  public async getSavedAddresses(): Promise<Array<Record<string, unknown>>> {
    return this.apiClient.usersApi.listAddresses();
  }

  public async getChatMessages(bookingId: string): Promise<Array<Record<string, unknown>>> {
    const response = await this.apiClient.chatApi.getMessages(bookingId);
    return (read(response, 'items') as Array<Record<string, unknown>> | undefined) ?? [];
  }

  public async getCorporateSummary(period: 'today' | 'last_7_days' | 'last_30_days'): Promise<Record<string, unknown>> {
    return this.apiClient.corporateApi.getSummary(period);
  }

  public async getCorporateUsageOverview(): Promise<Record<string, unknown>> {
    return this.apiClient.corporateApi.getUsage();
  }

  public async getCorporateUsersData(): Promise<Record<string, unknown>> {
    return this.apiClient.corporateApi.listEmployees();
  }

  public async getCorporateInvoices(): Promise<Record<string, unknown>> {
    return this.apiClient.corporateApi.listInvoices();
  }

  public async getCorporateInvoiceById(id: string): Promise<Record<string, unknown>> {
    return this.apiClient.corporateApi.getInvoiceDetail(id);
  }
}

export const createLocalJsonApiAdapter = (apiClient: ChaufflyApiClient): LocalJsonApiAdapter => {
  return new LocalJsonApiAdapter(apiClient);
};
