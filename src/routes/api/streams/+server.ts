/**
 * GET /api/streams
 * 
 * Returns stream URL for a specific camera.
 * Supports WebRTC signaling URL from Go2rtc.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Go2rtc configuration
const GO2RTC_URL = 'http://192.168.0.98:1984';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const cameraId = url.searchParams.get('camera');
        const type = url.searchParams.get('type') || 'webrtc';

        if (!cameraId) {
            return json(
                { error: 'Camera ID is required' },
                { status: 400 }
            );
        }

        // Build stream URL based on type
        let streamUrl: string;

        switch (type) {
            case 'webrtc':
                // WebSocket signaling URL for WebRTC
                streamUrl = `${GO2RTC_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/api/ws?src=${encodeURIComponent(cameraId)}`;
                break;

            case 'hls':
                // HLS stream URL
                streamUrl = `${GO2RTC_URL}/api/stream.m3u8?src=${encodeURIComponent(cameraId)}`;
                break;

            case 'mjpeg':
                // MJPEG stream URL
                streamUrl = `${GO2RTC_URL}/api/stream.mjpeg?src=${encodeURIComponent(cameraId)}`;
                break;

            case 'snapshot':
                // Snapshot URL
                streamUrl = `${GO2RTC_URL}/api/frame.jpeg?src=${encodeURIComponent(cameraId)}`;
                break;

            default:
                return json(
                    { error: `Unknown stream type: ${type}` },
                    { status: 400 }
                );
        }

        return json({
            camera: cameraId,
            type,
            url: streamUrl
        });

    } catch (error) {
        console.error('[API] GET /api/streams error:', error);
        return json(
            { error: 'Failed to get stream URL' },
            { status: 500 }
        );
    }
};
