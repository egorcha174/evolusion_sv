/**
 * GET /api/cameras
 * 
 * Returns list of configured cameras.
 * Reads from config file or returns demo data.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Camera } from '$lib/stores/camera.store.svelte';

// Demo cameras for development - matches Go2rtc stream names
const DEMO_CAMERAS: Camera[] = [
    {
        id: 'rtsp_cam_1_sub',
        name: 'Камера 1 (Sub)',
        source: 'go2rtc',
        go2rtc_name: 'rtsp_cam_1_sub',
        enabled: true
    },
    {
        id: 'rtsp_cam_1_main',
        name: 'Камера 1 (Main)',
        source: 'go2rtc',
        go2rtc_name: 'rtsp_cam_1_main',
        enabled: true
    }
];

export const GET: RequestHandler = async ({ url }) => {
    try {
        // TODO: Read from actual config file or database
        // For now, return demo cameras

        // Optional: filter by enabled status
        const enabledOnly = url.searchParams.get('enabled') === 'true';

        let cameras = DEMO_CAMERAS;

        if (enabledOnly) {
            cameras = cameras.filter(c => c.enabled);
        }

        return json({
            cameras,
            total: cameras.length,
            enabled: cameras.filter(c => c.enabled).length
        });

    } catch (error) {
        console.error('[API] GET /api/cameras error:', error);
        return json(
            { error: 'Failed to load cameras' },
            { status: 500 }
        );
    }
};
