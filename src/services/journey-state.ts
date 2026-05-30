import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNEY_DISMISSED_KEY = 'journey_dismissed_booking_id';

const JOURNEY_PATH_BY_STATUS: Record<string, string> = {
  searching: '/booking/driver-accepts',
  pending: '/booking/driver-accepts',
  driver_assigned: '/booking/driver-accepts',
  driver_heading: '/booking/driver-accepts',
  driver_arrived: '/booking/driver-accepts',
  in_progress: '/booking/heading-destination',
  completed: '/booking/trip-arrived',
  pending_payment: '/booking/trip-arrived'
};

export const ACTIVE_JOURNEY_STATUSES = Object.keys(JOURNEY_PATH_BY_STATUS);

export const getJourneyPathForStatus = (status: string): string | null =>
  JOURNEY_PATH_BY_STATUS[status] ?? null;

export const journeyStateService = {
  async getDismissedBookingId(): Promise<string | null> {
    return AsyncStorage.getItem(JOURNEY_DISMISSED_KEY);
  },

  async setDismissedBookingId(bookingId: string): Promise<void> {
    await AsyncStorage.setItem(JOURNEY_DISMISSED_KEY, bookingId);
  },

  async clearDismissedBookingId(): Promise<void> {
    await AsyncStorage.removeItem(JOURNEY_DISMISSED_KEY);
  }
};
