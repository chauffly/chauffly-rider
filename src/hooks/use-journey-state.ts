import { useCallback, useEffect, useState } from 'react';

import { useActiveBooking } from '@/api-client';
import { asRecord, asString } from '@/utils/api-helpers';
import { ACTIVE_JOURNEY_STATUSES, getJourneyPathForStatus, journeyStateService } from '@/services/journey-state';

export interface ActiveJourney {
  bookingId: string;
  status: string;
  path: string;
}

export interface JourneyState {
  activeJourney: ActiveJourney | null;
  dismissedBookingId: string | null;
  /** Whether the user has explicitly dismissed the current journey to the home screen. */
  isDismissed: boolean;
  dismissJourney: () => Promise<void>;
  clearDismissal: () => Promise<void>;
}

export const useJourneyState = (): JourneyState => {
  const { data: activeBookingData } = useActiveBooking({
    refetchInterval: 5000
  });
  const [dismissedBookingId, setDismissedBookingId] = useState<string | null>(null);

  const activeBooking = asRecord(activeBookingData);
  const booking = asRecord(activeBooking.booking);
  const bookingId = asString(booking.id);
  const status = asString(booking.status);
  const path = getJourneyPathForStatus(status);

  const activeJourney: ActiveJourney | null =
    bookingId && status && path && ACTIVE_JOURNEY_STATUSES.includes(status)
      ? { bookingId, status, path }
      : null;

  useEffect(() => {
    let cancelled = false;
    journeyStateService.getDismissedBookingId().then((value) => {
      if (!cancelled) {
        setDismissedBookingId(value);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Clear any stale dismissal whose booking is no longer active.
  useEffect(() => {
    if (!dismissedBookingId) {
      return;
    }
    if (!activeJourney || activeJourney.bookingId !== dismissedBookingId) {
      void journeyStateService.clearDismissedBookingId();
      setDismissedBookingId(null);
    }
  }, [activeJourney, dismissedBookingId]);

  const dismissJourney = useCallback(async () => {
    if (!activeJourney) {
      return;
    }
    await journeyStateService.setDismissedBookingId(activeJourney.bookingId);
    setDismissedBookingId(activeJourney.bookingId);
  }, [activeJourney]);

  const clearDismissal = useCallback(async () => {
    await journeyStateService.clearDismissedBookingId();
    setDismissedBookingId(null);
  }, []);

  const isDismissed =
    Boolean(activeJourney) && activeJourney?.bookingId === dismissedBookingId;

  return {
    activeJourney,
    dismissedBookingId,
    isDismissed,
    dismissJourney,
    clearDismissal
  };
};
