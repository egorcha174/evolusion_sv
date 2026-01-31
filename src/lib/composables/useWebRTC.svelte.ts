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
 * @param signalUrl - WebSocket URL for Go2rtc signaling (e.g., ws://192.168.0.98:1984/api/ws?src=front_door)
 * @returns Reactive WebRTC state and controls
 */
export function useWebRTC(signalUrl: string): UseWebRTCReturn {
    // Reactive state
    let pc: RTCPeerConnection | null = $state(null);
    let ws: WebSocket | null = $state(null);
    let stream = $state<MediaStream | null>(null);
    let status = $state<StreamStatus>('idle');
    let error = $state<string | null>(null);

    /**
     * Connect to WebRTC stream via Go2rtc signaling
     */
    async function connect(): Promise<void> {
        // Prevent duplicate connections
        if (status === 'connecting' || status === 'connected') {
            console.log('[WebRTC] Already connecting/connected');
            return;
        }

        status = 'connecting';
        error = null;

        try {
            // Create RTCPeerConnection
            pc = new RTCPeerConnection(RTC_CONFIG);
            console.log('[WebRTC] Created RTCPeerConnection');

            // Add transceivers for receiving media (required for Go2rtc)
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });

            // Handle incoming media tracks
            pc.ontrack = (event) => {
                console.log('[WebRTC] Track received:', event.track.kind);
                if (event.streams && event.streams[0]) {
                    stream = event.streams[0];
                    status = 'connected';
                    console.log('[WebRTC] Stream connected');
                }
            };

            // Handle ICE connection state changes
            pc.oniceconnectionstatechange = () => {
                console.log('[WebRTC] ICE state:', pc?.iceConnectionState);
                if (pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') {
                    handleError('ICE connection failed');
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
            console.log('[WebRTC] Created SDP offer');

            // Connect to Go2rtc WebSocket
            ws = new WebSocket(signalUrl);

            ws.onopen = () => {
                console.log('[WebRTC] WebSocket connected to:', signalUrl);
                // Send our SDP offer to Go2rtc - value should be an object
                const offerPayload = {
                    type: 'webrtc',
                    value: {
                        type: 'offer',
                        sdp: pc!.localDescription!.sdp
                    }
                };
                ws!.send(JSON.stringify(offerPayload));
                console.log('[WebRTC] Sent SDP offer to server:', offerPayload);
            };

            ws.onmessage = async (event) => {
                try {
                    const message: Go2rtcMessage = JSON.parse(event.data);
                    await handleSignalingMessage(message);
                } catch (err) {
                    console.error('[WebRTC] Message parse error:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('[WebRTC] WebSocket error:', event);
                handleError('WebSocket connection error');
            };

            ws.onclose = (event) => {
                console.log('[WebRTC] WebSocket closed:', event.code, event.reason);
                if (status !== 'error' && status !== 'connected') {
                    // Only error if not already connected or errored
                    if (event.code !== 1000) {
                        handleError(`WebSocket closed unexpectedly: ${event.code}`);
                    }
                }
            };

        } catch (err) {
            handleError(err instanceof Error ? err.message : 'Connection failed');
        }
    }

    /**
     * Handle Go2rtc signaling messages
     */
    async function handleSignalingMessage(message: Go2rtcMessage): Promise<void> {
        if (!pc) return;

        console.log('[WebRTC] Received message:', message.type);

        switch (message.type) {
            case 'webrtc':
                // Go2rtc responds with SDP answer (value could be object or string)
                if (message.value) {
                    console.log('[WebRTC] Received SDP answer', message.value);
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
                        console.log('[WebRTC] Remote description set');
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
            console.log('[WebRTC] Cleanup on destroy');
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
