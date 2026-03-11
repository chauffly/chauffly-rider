import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import {
  AdminClientToServerEvents,
  AdminServerToClientEvents,
  ChatClientToServerEvents,
  ChatServerToClientEvents,
  NamespaceConnectionState,
  RidesClientToServerEvents,
  RidesServerToClientEvents,
  SocketNamespace
} from './events';

export interface SocketClientOptions {
  socketBaseUrl: string;
  socketPath?: string;
  getAccessToken: () => Promise<string | null> | string | null;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  transports?: Array<'websocket' | 'polling'>;
  enableDebugLogs?: boolean;
}

type RidesSocket = Socket<RidesServerToClientEvents, RidesClientToServerEvents>;
type ChatSocket = Socket<ChatServerToClientEvents, ChatClientToServerEvents>;
type AdminSocket = Socket<AdminServerToClientEvents, AdminClientToServerEvents>;

type ConnectionStateListener = (state: NamespaceConnectionState) => void;

const nowIso = (): string => new Date().toISOString();

export class ChaufflySocketClient {
  private readonly options: SocketClientOptions;
  private readonly listeners = new Set<ConnectionStateListener>();
  private readonly ridesListeners = new Map<keyof RidesServerToClientEvents, Set<(...args: any[]) => void>>();
  private readonly chatListeners = new Map<keyof ChatServerToClientEvents, Set<(...args: any[]) => void>>();
  private readonly adminListeners = new Map<keyof AdminServerToClientEvents, Set<(...args: any[]) => void>>();

  private ridesSocket: RidesSocket | null = null;
  private chatSocket: ChatSocket | null = null;
  private adminSocket: AdminSocket | null = null;

  private states: Record<SocketNamespace, NamespaceConnectionState> = {
    rides: {
      namespace: 'rides',
      connected: false,
      connecting: false,
      lastConnectedAt: null,
      reconnectAttempts: 0,
      lastError: null
    },
    chat: {
      namespace: 'chat',
      connected: false,
      connecting: false,
      lastConnectedAt: null,
      reconnectAttempts: 0,
      lastError: null
    },
    admin: {
      namespace: 'admin',
      connected: false,
      connecting: false,
      lastConnectedAt: null,
      reconnectAttempts: 0,
      lastError: null
    }
  };

  constructor(options: SocketClientOptions) {
    this.options = options;
  }

  public getState(namespace: SocketNamespace): NamespaceConnectionState {
    return this.states[namespace];
  }

  public subscribeConnectionState(listener: ConnectionStateListener): () => void {
    this.listeners.add(listener);

    for (const state of Object.values(this.states)) {
      listener(state);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  public async connectAll(): Promise<void> {
    await Promise.all([this.connectRides(), this.connectChat(), this.connectAdmin()]);
  }

  public disconnectAll(): void {
    this.ridesSocket?.disconnect();
    this.chatSocket?.disconnect();
    this.adminSocket?.disconnect();
  }

  public async connectRides(): Promise<void> {
    if (this.ridesSocket?.connected) {
      return;
    }

    this.ridesSocket = await this.connectNamespace('rides');
  }

  public async connectChat(): Promise<void> {
    if (this.chatSocket?.connected) {
      return;
    }

    this.chatSocket = await this.connectNamespace('chat');
  }

  public async connectAdmin(): Promise<void> {
    if (this.adminSocket?.connected) {
      return;
    }

    this.adminSocket = await this.connectNamespace('admin');
  }

  public emitRideLocation(payload: { lat: number; lng: number; heading?: number; speed?: number }): void {
    this.ridesSocket?.emit('location_update', payload);
  }

  public emitRideAccept(bookingId: string): void {
    this.ridesSocket?.emit('accept_ride', { bookingId });
  }

  public emitRideDecline(bookingId: string, reason?: string): void {
    this.ridesSocket?.emit('decline_ride', { bookingId, reason });
  }

  public joinChatThread(bookingId: string): void {
    this.chatSocket?.emit('join_thread', { bookingId });
  }

  public sendChatMessage(bookingId: string, text: string): void {
    this.chatSocket?.emit('send_message', { bookingId, text });
  }

  public markChatMessageRead(messageId: string): void {
    this.chatSocket?.emit('message_read', { messageId });
  }

  public emitTyping(bookingId: string, isTyping: boolean): void {
    this.chatSocket?.emit('typing', { bookingId, isTyping });
  }

  public onRideEvent(
    event: keyof RidesServerToClientEvents,
    handler: (...args: any[]) => void
  ): () => void {
    const handlers = this.ridesListeners.get(event) ?? new Set<(...args: any[]) => void>();
    handlers.add(handler);
    this.ridesListeners.set(event, handlers);
    this.ridesSocket?.on(event, handler as never);

    return () => {
      const currentHandlers = this.ridesListeners.get(event);
      currentHandlers?.delete(handler);
      this.ridesSocket?.off(event, handler as never);
    };
  }

  public onChatEvent(
    event: keyof ChatServerToClientEvents,
    handler: (...args: any[]) => void
  ): () => void {
    const handlers = this.chatListeners.get(event) ?? new Set<(...args: any[]) => void>();
    handlers.add(handler);
    this.chatListeners.set(event, handlers);
    this.chatSocket?.on(event, handler as never);

    return () => {
      const currentHandlers = this.chatListeners.get(event);
      currentHandlers?.delete(handler);
      this.chatSocket?.off(event, handler as never);
    };
  }

  public onAdminEvent(
    event: keyof AdminServerToClientEvents,
    handler: (...args: any[]) => void
  ): () => void {
    const handlers = this.adminListeners.get(event) ?? new Set<(...args: any[]) => void>();
    handlers.add(handler);
    this.adminListeners.set(event, handlers);
    this.adminSocket?.on(event, handler as never);

    return () => {
      const currentHandlers = this.adminListeners.get(event);
      currentHandlers?.delete(handler);
      this.adminSocket?.off(event, handler as never);
    };
  }

  private async connectNamespace(namespace: SocketNamespace): Promise<Socket> {
    const token = await this.options.getAccessToken();

    const socketOptions: Partial<ManagerOptions & SocketOptions> = {
      autoConnect: this.options.autoConnect ?? true,
      reconnection: this.options.reconnection ?? true,
      reconnectionAttempts: this.options.reconnectionAttempts ?? Infinity,
      reconnectionDelay: this.options.reconnectionDelay ?? 1000,
      reconnectionDelayMax: this.options.reconnectionDelayMax ?? 10_000,
      transports: this.options.transports ?? ['websocket'],
      path: this.options.socketPath,
      auth: token
        ? {
            token
          }
        : undefined
    };

    const socket = io(`${this.options.socketBaseUrl}/${namespace}`, socketOptions);

    this.setState(namespace, {
      connecting: true,
      connected: false,
      lastError: null
    });

    socket.on('connect', () => {
      this.setState(namespace, {
        connecting: false,
        connected: true,
        lastConnectedAt: nowIso(),
        lastError: null
      });
    });

    socket.io.on('reconnect_attempt', async (attempt: number) => {
      const refreshedToken = await this.options.getAccessToken();
      socket.auth = refreshedToken ? { token: refreshedToken } : {};

      this.setState(namespace, {
        connecting: true,
        reconnectAttempts: attempt
      });
    });

    socket.on('connect_error', (error: Error) => {
      this.setState(namespace, {
        connecting: false,
        connected: false,
        lastError: error.message
      });

      this.logDebug(`${namespace}:connect_error`, {
        message: error.message
      });
    });

    socket.on('disconnect', (reason: string) => {
      this.setState(namespace, {
        connecting: false,
        connected: false,
        lastError: reason
      });
    });

    this.bindPersistedListeners(namespace, socket);

    return socket;
  }

  private bindPersistedListeners(namespace: SocketNamespace, socket: Socket): void {
    if (namespace === 'rides') {
      for (const [event, handlers] of this.ridesListeners.entries()) {
        handlers.forEach((handler) => {
          socket.on(event as never, handler as never);
        });
      }
      return;
    }

    if (namespace === 'chat') {
      for (const [event, handlers] of this.chatListeners.entries()) {
        handlers.forEach((handler) => {
          socket.on(event as never, handler as never);
        });
      }
      return;
    }

    for (const [event, handlers] of this.adminListeners.entries()) {
      handlers.forEach((handler) => {
        socket.on(event as never, handler as never);
      });
    }
  }

  private setState(
    namespace: SocketNamespace,
    patch: Partial<NamespaceConnectionState>
  ): void {
    this.states[namespace] = {
      ...this.states[namespace],
      ...patch
    };

    for (const listener of this.listeners) {
      listener(this.states[namespace]);
    }
  }

  private logDebug(message: string, payload: Record<string, unknown>): void {
    if (!this.options.enableDebugLogs) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`[chauffly-socket] ${message}`, payload);
  }
}
