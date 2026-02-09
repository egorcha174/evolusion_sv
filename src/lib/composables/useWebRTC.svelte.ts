/**
 * WebRTC Composable - Go2rtc WebRTC streaming
 * 
 * Handles WebRTC connection to Go2rtc server via WebSocket signaling.
 * Uses Svelte 5 runes for reactive state management.
 */

import type { StreamStatus } from '$lib/stores/camera.store.svelte';

// WebRTC configuration
const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Go2rtc WebSocket message types
interface Go2rtcMessage {
    type: string;
    value?: string | { type: string; sdp: string };
    error?: string;
}

// Return type for useWebRTC composable
export interface UseWebRTCReturn {
    readonly stream: MediaStream | null;
    readonly status: StreamStatus;
    readonly error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

/**
 * Create WebRTC connection to Go2rtc camera stream
 * 
 * @param getSignalUrl - Function that returns the current WebSocket URL for Go2rtc signaling
 * @returns Reactive WebRTC state and controls
 */
export function useWebRTC(getSignalUrl: () => string): UseWebRTCReturn {
    // Reactive state
    let pc: RTCPeerConnection | null = $state(null);
    let ws: WebSocket | null = $state(null);
    let stream = $state<MediaStream | null>(null);
    let status = $state<StreamStatus>('idle');
    let error = $state<string | null>(null);

    /**
     * Connect to WebRTC stream via Go2rtc signaling
     */
    let reconnectTimer: any;
    let iceDisconnectTimer: any;

    async function connect(): Promise<void> {
        // Prevent duplicate connections
        if (status === 'connecting' || status === 'connected') {
            console.log('[WebRTC] Already connecting/connected');
            return;
        }

        status = 'connecting';
        error = null;

        let attempt = 0;
        const MAX_RETRIES = 3;

        while (attempt < MAX_RETRIES) {
            try {
                // Create RTCPeerConnection
                pc = new RTCPeerConnection(RTC_CONFIG);

                // Add transceivers for receiving media (required for Go2rtc)
                pc.addTransceiver('video', { direction: 'recvonly' });
                pc.addTransceiver('audio', { direction: 'recvonly' });

                // Handle incoming media tracks
                pc.ontrack = (event) => {
                    if (event.streams && event.streams[0]) {
                        stream = event.streams[0];
                        status = 'connected';

                        // Clear any pending disconnect timers on successful connection
                        if (iceDisconnectTimer) {
                            clearTimeout(iceDisconnectTimer);
                            iceDisconnectTimer = null;
                        }
                    }
                };

                // Handle ICE connection state changes
                pc.oniceconnectionstatechange = () => {
                    const iceState = pc?.iceConnectionState;
                    console.log('[WebRTC] ICE state:', iceState);

                    if (iceState === 'connected' || iceState === 'completed') {
                        if (iceDisconnectTimer) {
                            clearTimeout(iceDisconnectTimer);
                            iceDisconnectTimer = null;
                        }
                    } else if (iceState === 'disconnected') {
                        // ICE disconnected - wait a bit before declaring failure to allow for temporary reuse
                        if (status === 'connected' && !iceDisconnectTimer) {
                            console.warn('[WebRTC] ICE disconnected, waiting for recovery...');
                            iceDisconnectTimer = setTimeout(() => {
                                console.error('[WebRTC] ICE recovery timed out');
                                reconnect();
                            }, 3000); // 3 seconds grace period
                        }
                    } else if (iceState === 'failed') {
                        // Immediate failure
                        console.error('[WebRTC] ICE connection failed');
                        reconnect();
                    }
                };

                // Collect ICE candidates
                const iceCandidates: RTCIceCandidate[] = [];
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        iceCandidates.push(event.candidate);
                    }
                };

                // Wait for ICE gathering to complete
                await new Promise<void>((resolve) => {
                    if (pc!.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        pc!.onicegatheringstatechange = () => {
                            if (pc!.iceGatheringState === 'complete') {
                                resolve();
                            }
                        };
                        // Timeout fallback
                        setTimeout(resolve, 2000);
                    }
                });

                // Create SDP offer (client-side)
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // Connect to Go2rtc WebSocket
                const currentSignalUrl = getSignalUrl();
                if (!currentSignalUrl) {
                    throw new Error('No signal URL configured');
                }
                ws = new WebSocket(currentSignalUrl);

                await new Promise<void>((resolve, reject) => {
                    ws!.onopen = () => {
                        // Send our SDP offer to Go2rtc - value should be an object
                        const offerPayload = {
                            type: 'webrtc',
                            value: {
                                type: 'offer',
                                sdp: pc!.localDescription!.sdp
                            }
                        };
                        ws!.send(JSON.stringify(offerPayload));
                        resolve();
                    };
                    ws!.onerror = (e) => reject(new Error('WebSocket connection failed'));
                });


                ws!.onmessage = async (event) => {
                    try {
                        const message: Go2rtcMessage = JSON.parse(event.data);
                        await handleSignalingMessage(message);
                    } catch (err) {
                        console.error('[WebRTC] Message parse error:', err);
                    }
                };

                ws!.onclose = (event) => {
                    console.log('[WebRTC] WebSocket closed:', event.code, event.reason);
                    if (status !== 'error' && status !== 'connected') {
                        // Only error if not already connected or errored
                        if (event.code !== 1000) {
                            console.warn(`[WebRTC] WebSocket closed unexpectedly: ${event.code}`);
                            // Don't kill the stream immediately if we have it, but usually WS close means issues.
                        }
                    }
                };

                // If we got here, connection init was successful
                return;

            } catch (err) {
                console.error(`[WebRTC] Connection attempt ${attempt + 1} failed:`, err);
                cleanup();
                attempt++;
                if (attempt >= MAX_RETRIES) {
                    handleError(err instanceof Error ? err.message : 'Connection failed after retries');
                    return;
                }
                // Wait before retry
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    /**
     * Handle Go2rtc signaling messages
     */
    async function handleSignalingMessage(message: Go2rtcMessage): Promise<void> {
        if (!pc) return;



        switch (message.type) {
            case 'webrtc':
                // Go2rtc responds with SDP answer (value could be object or string)
                if (message.value) {
                    try {
                        let answerData: { type: string; sdp: string };
                        if (typeof message.value === 'string') {
                            // Parse if it's a JSON string
                            answerData = JSON.parse(message.value);
                        } else {
                            // Use directly if it's an object
                            answerData = message.value;
                        }
                        await pc.setRemoteDescription(new RTCSessionDescription({
                            type: answerData.type as RTCSdpType || 'answer',
                            sdp: answerData.sdp
                        }));
                    } catch (err) {
                        console.error('[WebRTC] Failed to set remote description:', err);
                        handleError('Failed to set remote description');
                    }
                }
                break;

            case 'webrtc/candidate':
                // Remote ICE candidate (if trickle ICE is used)
                if (message.value && typeof message.value === 'string') {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate({
                            candidate: message.value,
                            sdpMid: '0',
                            sdpMLineIndex: 0
                        }));
                    } catch (err) {
                        console.warn('[WebRTC] ICE candidate error:', err);
                    }
                }
                break;

            case 'error':
                const errorMsg = typeof message.value === 'string' ? message.value : 'Server error';
                handleError(errorMsg);
                break;

            default:
                console.log('[WebRTC] Unknown message type:', message.type, message);
        }
    }

    /**
     * Attempt to reconnect
     */
    function reconnect(): void {
        console.log('[WebRTC] Attempting to reconnect...');
        cleanup();
        status = 'connecting'; // Keep UI in connecting state

        // Slight delay before reconnecting to allow things to settle
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            status = 'idle';
            connect();
        }, 500);
    }

    /**
     * Handle connection errors
     */
    function handleError(message: string): void {
        console.error('[WebRTC] Error:', message);
        error = message;
        status = 'error';
        cleanup();
    }

    /**
     * Disconnect and cleanup resources
     */
    function disconnect(): void {
        console.log('[WebRTC] Disconnecting');
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (iceDisconnectTimer) clearTimeout(iceDisconnectTimer);
        cleanup();
        status = 'idle';
        error = null;
    }

    /**
     * Cleanup WebRTC and WebSocket resources
     */
    function cleanup(): void {
        if (ws) {
            ws.close(1000, 'Client disconnect');
            ws = null;
        }

        if (pc) {
            pc.close();
            pc = null;
        }

        stream = null;
    }

    // Cleanup on destroy (via Svelte 5 $effect)
    $effect(() => {
        return () => {
            cleanup();
        };
    });

    // Return public API with getters for reactive values
    return {
        get stream() { return stream; },
        get status() { return status; },
        get error() { return error; },
        connect,
        disconnect
    };
}

/**
 * Build Go2rtc WebSocket URL for a camera
 * 
 * @param go2rtcUrl - Base URL of Go2rtc (e.g., http://192.168.0.98:1984)
 * @param cameraName - Camera name in Go2rtc config
 * @returns WebSocket signaling URL
 */
export function buildGo2rtcSignalUrl(go2rtcUrl: string, cameraName: string): string {
    // Convert http(s) to ws(s)
    const wsUrl = go2rtcUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');

    return `${wsUrl}/api/ws?src=${encodeURIComponent(cameraName)}`;
}
