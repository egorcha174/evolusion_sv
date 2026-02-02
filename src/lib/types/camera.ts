export interface CameraConfig {
    name: string;
    source: string;
    mode: 'preview' | 'live';
    go2rtcHost: string;
    go2rtcProtocol?: 'http' | 'https';
    previewRefreshInterval?: number;
    previewObjectFit?: 'cover' | 'contain';
    webrtcReconnectInterval?: number;
    webrtcTimeout?: number;
    webrtcMaxReconnectAttempts?: number;
    showTitle?: boolean;
    showLoadingSpinner?: boolean;
    aspectRatio?: string;
    onError?: (error: Error) => void;
    onReady?: () => void;
}

export interface CameraCardState {
    isLoading: boolean;
    isConnected: boolean;
    error: string | null;
}
