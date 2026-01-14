export interface AuthRequiredMessage {
  type: 'auth_required';
  ha_version: string;
}

export interface AuthOkMessage {
  type: 'auth_ok';
  ha_version: string;
}

export interface AuthInvalidMessage {
  type: 'auth_invalid';
  message: string;
}

export interface ResultMessage {
  type: 'result';
  id: number;
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}

export interface EventMessage {
  type: 'event';
  id?: number;
  event: {
    event_type: string;
    data: any;
  };
}

export interface StateChangedEventData {
  entity_id: string;
  new_state: {
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
  } | null;
  old_state: {
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
  } | null;
}

export interface GetStatesMessage {
  type: 'get_states';
  id?: number;
}

export interface CallServiceMessage {
  type: 'call_service';
  id?: number;
  domain: string;
  service: string;
  service_data: object;
  return_response?: boolean;
}

export interface SubscribeEventsMessage {
  type: 'subscribe_events';
  id?: number;
  event_type: string;
}

export interface GetConfigMessage {
  type: 'get_config';
  id?: number;
}

export interface GetHistoryMessage {
  type: 'history/history_during_period';
  id?: number;
  entity_ids: string[];
  start_time: string;
  end_time?: string;
  minimal_response?: boolean;
}

export interface SignPathMessage {
  type: 'auth/sign_path';
  id?: number;
  path: string;
}

export type IncomingMessage =
  | AuthRequiredMessage
  | AuthOkMessage
  | AuthInvalidMessage
  | ResultMessage
  | EventMessage;

export type OutgoingMessage =
  | GetStatesMessage
  | CallServiceMessage
  | SubscribeEventsMessage
  | GetConfigMessage
  | GetHistoryMessage
  | SignPathMessage
  | {
      type: 'auth';
      access_token: string;
    };
