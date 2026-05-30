import { useEffect, useMemo, useState } from 'react';
import { ChaufflySocketClient } from './socket-client';
import type {
  ChatServerToClientEvents,
  NamespaceConnectionState,
  RidesServerToClientEvents,
  SocketNamespace
} from './events';

const emptyState = (namespace: SocketNamespace): NamespaceConnectionState => ({
  namespace,
  connected: false,
  connecting: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  lastError: null
});

export const useSocketConnectionStatus = (
  socketClient: ChaufflySocketClient,
  namespace: SocketNamespace
): NamespaceConnectionState => {
  const [state, setState] = useState<NamespaceConnectionState>(socketClient.getState(namespace) ?? emptyState(namespace));

  useEffect(() => {
    return socketClient.subscribeConnectionState((nextState) => {
      if (nextState.namespace === namespace) {
        setState(nextState);
      }
    });
  }, [namespace, socketClient]);

  return state;
};

export interface BookingUpdateHandlers {
  onStatusChanged?: RidesServerToClientEvents['booking_status_changed'];
  onDriverAssigned?: RidesServerToClientEvents['driver_assigned'];
  onDriverLocation?: RidesServerToClientEvents['driver_location_update'];
  onRideCancelled?: RidesServerToClientEvents['ride_cancelled'];
  onTripCompleted?: RidesServerToClientEvents['trip_completed'];
  onArrivedAtDestination?: RidesServerToClientEvents['arrived_at_destination'];
  onNoDrivers?: RidesServerToClientEvents['no_drivers_available'];
}

export const useBookingUpdates = (
  socketClient: ChaufflySocketClient,
  handlers: BookingUpdateHandlers
): void => {
  useEffect(() => {
    const unsubscribers = [
      handlers.onStatusChanged
        ? socketClient.onRideEvent('booking_status_changed', handlers.onStatusChanged)
        : undefined,
      handlers.onDriverAssigned
        ? socketClient.onRideEvent('driver_assigned', handlers.onDriverAssigned)
        : undefined,
      handlers.onDriverLocation
        ? socketClient.onRideEvent('driver_location_update', handlers.onDriverLocation)
        : undefined,
      handlers.onRideCancelled
        ? socketClient.onRideEvent('ride_cancelled', handlers.onRideCancelled)
        : undefined,
      handlers.onTripCompleted
        ? socketClient.onRideEvent('trip_completed', handlers.onTripCompleted)
        : undefined,
      handlers.onArrivedAtDestination
        ? socketClient.onRideEvent('arrived_at_destination', handlers.onArrivedAtDestination)
        : undefined,
      handlers.onNoDrivers
        ? socketClient.onRideEvent('no_drivers_available', handlers.onNoDrivers)
        : undefined
    ].filter(Boolean) as Array<() => void>;

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [handlers, socketClient]);
};

export interface DriverLocationState {
  lat: number | null;
  lng: number | null;
  heading: number | null;
  etaSeconds: number | null;
}

export const useDriverLocation = (socketClient: ChaufflySocketClient): DriverLocationState => {
  const [state, setState] = useState<DriverLocationState>({
    lat: null,
    lng: null,
    heading: null,
    etaSeconds: null
  });

  useEffect(() => {
    const unsubscribe = socketClient.onRideEvent('driver_location_update', (payload) => {
      setState({
        lat: payload.lat,
        lng: payload.lng,
        heading: payload.heading ?? null,
        etaSeconds: payload.eta_seconds ?? null
      });
    });

    return () => {
      unsubscribe();
    };
  }, [socketClient]);

  return state;
};

export interface UseChatMessagesResult {
  messages: Array<Parameters<ChatServerToClientEvents['new_message']>[0]>;
  sendMessage: (text: string) => void;
  joinThread: () => void;
  markRead: (messageId: string) => void;
  emitTyping: (isTyping: boolean) => void;
}

export const useChatMessages = (
  socketClient: ChaufflySocketClient,
  bookingId: string
): UseChatMessagesResult => {
  type ChatMessage = Parameters<ChatServerToClientEvents['new_message']>[0];
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const unsubscribeNewMessage = socketClient.onChatEvent('new_message', (message: ChatMessage) => {
      if (message.bookingId !== bookingId) {
        return;
      }

      setMessages((prev: ChatMessage[]) => {
        if (prev.some((entry) => entry.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
    });

    const unsubscribeRead = socketClient.onChatEvent('message_read', ({ messageId }) => {
      setMessages((prev: ChatMessage[]) =>
        prev.map((message: ChatMessage) =>
          message.id === messageId
            ? {
                ...message,
                isRead: true
              }
            : message
        )
      );
    });

    socketClient.joinChatThread(bookingId);

    return () => {
      unsubscribeNewMessage();
      unsubscribeRead();
    };
  }, [bookingId, socketClient]);

  return useMemo(
    () => ({
      messages,
      sendMessage: (text: string) => socketClient.sendChatMessage(bookingId, text),
      joinThread: () => socketClient.joinChatThread(bookingId),
      markRead: (messageId: string) => socketClient.markChatMessageRead(messageId),
      emitTyping: (isTyping: boolean) => socketClient.emitTyping(bookingId, isTyping)
    }),
    [bookingId, messages, socketClient]
  );
};
