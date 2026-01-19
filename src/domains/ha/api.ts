import type { 
  AuthMessage, 
  GetStatesMessage, 
  SubscribeEventsMessage, 
  UnsubscribeEventsMessage,
  StateChangedEvent,
  ResultMessage,
  EventMessage,
  HAState
} from './contracts/messages';

type ResolveFn = (value: any) => void;
type RejectFn = (reason?: any) => void;

export class HAClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private messageId: number = 0;
  private subscriptions: Map<number, (data: any) => void> = new Map();
  private pendingCommands: Map<number, { resolve: ResolveFn; reject: RejectFn }> = new Map();
  private stateChangeCallbacks: Set<(event: StateChangedEvent) => void> = new Set();
  
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectPromise: { resolve: ResolveFn; reject: RejectFn } | null = null;
  
  private forcedDisconnect: boolean = false;

  constructor(url: string, token: string) {
    this.url = this.formatUrl(url);
    this.token = token;
  }

  private formatUrl(url: string): string {
    const isSecure = url.startsWith('https');
    const protocol = isSecure ? 'wss://' : 'ws://';
    // Remove protocol and trailing slash
    let host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${protocol}${host}/api/websocket`;
  }

  async connect(): Promise<void> {
    this.forcedDisconnect = false;
    
    if (this.isConnected()) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.connectPromise = { resolve, reject };

      try {
        this.ws = new WebSocket(this.url);
      } catch (e) {
        this._onError(new Event('error'));
        reject(e);
        return;
      }

      this.ws.onopen = this._onOpen.bind(this);
      this.ws.onmessage = this._onMessage.bind(this);
      this.ws.onerror = this._onError.bind(this);
      this.ws.onclose = this._onClose.bind(this);
    });
  }

  async disconnect(): Promise<void> {
    this.forcedDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === 1; // WebSocket.OPEN
  }

  async getStates(): Promise<HAState[]> {
    return this._sendCommand<HAState[]>({ type: 'get_states' });
  }

  async subscribe(eventType: string = 'state_changed'): Promise<number> {
    const id = await this._sendCommand<number>({ 
      type: 'subscribe_events', 
      event_type: eventType 
    });
    
    // In HA WebSocket, the subscription ID is the command ID.
    // The `_sendCommand` logic for subscription needs to know to return the ID, not the result object.
    // However, strictly speaking, HA returns a result message.
    // We register the subscription handler *after* success or pre-emptively?
    // Actually, HA events come with "id": <subscription_id>.
    // So we map the command ID (which becomes subscription ID) to a handler.
    
    // For specific events, we might want a specific handler.
    // But for now, we just ensure we track it.
    
    return id; 
  }

  unsubscribe(subscriptionId: number): void {
    // Send unsubscribe (fire and forget or wait?)
    this._send({ 
      type: 'unsubscribe_events', 
      subscription: subscriptionId 
    }).catch(console.error);
    
    this.subscriptions.delete(subscriptionId);
  }

  onStateChange(callback: (event: StateChangedEvent) => void): void {
    this.stateChangeCallbacks.add(callback);
  }

  private async _sendCommand<T>(payload: any): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('Not connected');
    }

    const id = ++this.messageId;
    const message = { ...payload, id };

    return new Promise((resolve, reject) => {
      this.pendingCommands.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(message));
      
      // If it's a subscribe command, we prepare to route future events with this ID
      if (payload.type === 'subscribe_events') {
        this.subscriptions.set(id, (eventData) => {
           // Dispatch to global listeners if it's state_changed
           if (payload.event_type === 'state_changed' || !payload.event_type) {
             this.stateChangeCallbacks.forEach(cb => cb(eventData));
           }
        });
      }
    });
  }
  
  // Internal fire-and-forget send (wrapped as promise for consistency)
  private async _send(payload: any): Promise<void> {
    if (!this.isConnected()) return;
    const id = ++this.messageId;
    const message = { ...payload, id };
    this.ws!.send(JSON.stringify(message));
  }

  private _onOpen() {
    console.log('WS Open');
  }

  private _onMessage(event: MessageEvent) {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error('Failed to parse WS message', e);
      return;
    }

    switch (data.type) {
      case 'auth_required':
        this._sendAuth();
        break;
      
      case 'auth_ok':
        this.reconnectAttempts = 0;
        if (this.connectPromise) {
          this.connectPromise.resolve(null);
          this.connectPromise = null;
        }
        break;
      
      case 'auth_invalid':
        if (this.connectPromise) {
          this.connectPromise.reject(new Error(data.message));
          this.connectPromise = null;
        }
        this.disconnect();
        break;
        
      case 'result':
        this._handleResult(data as ResultMessage);
        break;
        
      case 'event':
        this._handleEvent(data as EventMessage);
        break;

      case 'pong':
        // Handle pong if we implemented ping
        break;
        
      default:
        // console.log('Unknown message type', data.type);
    }
  }

  private _sendAuth() {
    const authMsg: AuthMessage = {
      type: 'auth',
      access_token: this.token
    };
    this.ws!.send(JSON.stringify(authMsg));
  }

  private _handleResult(data: ResultMessage) {
    const pending = this.pendingCommands.get(data.id);
    if (pending) {
      if (data.success) {
        // Special case: if we asked for subscription, result is just success/fail. 
        // We want to resolve with the ID so the caller knows the subscription ID.
        // But for get_states, we want data.result.
        if (data.result !== undefined) {
           pending.resolve(data.result);
        } else {
           // Assume it was a command where ID is the important return (like subscribe)
           pending.resolve(data.id);
        }
      } else {
        pending.reject(new Error(data.error?.message || 'Unknown error'));
      }
      this.pendingCommands.delete(data.id);
    }
  }

  private _handleEvent(data: EventMessage) {
    const handler = this.subscriptions.get(data.id);
    if (handler) {
      handler(data.event);
    }
  }

  private _onError(event: Event) {
    console.error('WS Error', event);
    if (this.connectPromise) {
      this.connectPromise.reject(new Error('WebSocket connection failed'));
      this.connectPromise = null;
    }
  }

  private _onClose(event: CloseEvent) {
    console.log('WS Close', event.code, event.reason);
    
    if (this.connectPromise) {
      this.connectPromise.reject(new Error('Connection closed during handshake'));
      this.connectPromise = null;
    }

    // Clear state
    this.ws = null;
    this.pendingCommands.forEach(p => p.reject(new Error('Connection closed')));
    this.pendingCommands.clear();

    if (!this.forcedDisconnect) {
      this._attemptReconnect();
    }
  }

  private _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(e => console.error('Reconnect failed', e));
    }, delay);
  }
}
