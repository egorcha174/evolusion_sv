export type HAMessageType =
  | 'auth_required'
  | 'auth'
  | 'auth_ok'
  | 'auth_invalid'
  | 'result'
  | 'subscribe_events'
  | 'unsubscribe_events'
  | 'get_states'
  | 'event'
  | 'ping'
  | 'pong';

export interface BaseMessage {
  type: HAMessageType;
}

export interface AuthRequiredMessage extends BaseMessage {
  type: 'auth_required';
  ha_version: string;
}

export interface AuthMessage extends BaseMessage {
  type: 'auth';
  access_token: string;
}

export interface AuthOkMessage extends BaseMessage {
  type: 'auth_ok';
  ha_version: string;
}

export interface AuthInvalidMessage extends BaseMessage {
  type: 'auth_invalid';
  message: string;
}

export interface CommandMessage extends BaseMessage {
  id: number;
  [key: string]: any;
}

export interface ResultMessage extends BaseMessage {
  type: 'result';
  id: number;
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}

export interface SubscribeEventsMessage extends CommandMessage {
  type: 'subscribe_events';
  event_type?: string;
}

export interface UnsubscribeEventsMessage extends CommandMessage {
  type: 'unsubscribe_events';
  subscription: number;
}

export interface GetStatesMessage extends CommandMessage {
  type: 'get_states';
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface StateChangedEvent {
  event_type: 'state_changed';
  data: {
    entity_id: string;
    old_state: HAState | null;
    new_state: HAState | null;
  };
  origin: string;
  time_fired: string;
  context: any;
}

export interface EventMessage extends BaseMessage {
  type: 'event';
  id: number;
  event: StateChangedEvent | any;
}

export type HAMessage =
  | AuthRequiredMessage
  | AuthMessage
  | AuthOkMessage
  | AuthInvalidMessage
  | ResultMessage
  | EventMessage;
