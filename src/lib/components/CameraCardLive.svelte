<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import type { CameraConfig } from "$lib/types/camera";

    export let config: CameraConfig;

    const dispatch = createEventDispatcher();
    let videoElement: HTMLVideoElement;
    let pc: RTCPeerConnection | null = null;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let connectionAttempts = 0;
    let isMounted = false;

    const maxReconnectAttempts = config.webrtcMaxReconnectAttempts ?? 5;
    const reconnectInterval = config.webrtcReconnectInterval ?? 3000;
    const protocol = config.go2rtcProtocol === "https" ? "wss" : "ws";
    const wsUrl = `${protocol}://${config.go2rtcHost}/api/ws?src=${config.source}`;

    // Action to handle srcObject binding safely
    function srcObjectAction(
        node: HTMLVideoElement,
        stream: MediaStream | null,
    ) {
        node.srcObject = stream;
        return {
            update(newStream: MediaStream | null) {
                if (node.srcObject !== newStream) {
                    node.srcObject = newStream;
                }
            },
            destroy() {
                node.srcObject = null;
            },
        };
    }

    let currentStream: MediaStream | null = null;

    async function initWebRTC() {
        if (!isMounted) return;

        console.log(
            `[CameraCardLive] Connecting to ${wsUrl} (Attempt ${connectionAttempts + 1}/${maxReconnectAttempts})`,
        );

        try {
            cleanupConnection(); // Ensure clean slate

            pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            pc.onconnectionstatechange = () => {
                console.log(
                    `[CameraCardLive] Connection State: ${pc?.connectionState}`,
                );
                if (
                    pc?.connectionState === "failed" ||
                    pc?.connectionState === "disconnected"
                ) {
                    scheduleReconnect();
                }
            };

            pc.ontrack = (event) => {
                console.log("[CameraCardLive] Track received");
                currentStream = event.streams[0];
                dispatch("ready");
                // Reset attempts on success
                connectionAttempts = 0;
            };

            ws = new WebSocket(wsUrl);

            ws.onopen = async () => {
                console.log("[CameraCardLive] WebSocket connected");
            };

            ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === "offer") {
                    console.log("[CameraCardLive] Offer received");
                    if (!pc) return;

                    await pc.setRemoteDescription(msg);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({ type: "answer", sdp: answer.sdp }),
                        );
                        console.log("[CameraCardLive] Answer sent");
                    }
                }
            };

            ws.onerror = (e) => {
                console.warn("[CameraCardLive] WebSocket error", e);
                // Let onclose handle reconnect
            };

            ws.onclose = () => {
                console.log("[CameraCardLive] WebSocket closed");
                if (connectionAttempts < maxReconnectAttempts && isMounted) {
                    scheduleReconnect();
                } else if (connectionAttempts >= maxReconnectAttempts) {
                    dispatch(
                        "error",
                        new Error("Max reconnect attempts reached"),
                    );
                }
            };
        } catch (e: any) {
            console.error("[CameraCardLive] Init error", e);
            if (connectionAttempts < maxReconnectAttempts) {
                scheduleReconnect();
            } else {
                dispatch("error", e);
            }
        }
    }

    function scheduleReconnect() {
        if (reconnectTimeout) return; // Already scheduled
        connectionAttempts++;
        console.log(
            `[CameraCardLive] Scheduling reconnect in ${reconnectInterval}ms`,
        );
        reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            initWebRTC();
        }, reconnectInterval);
    }

    function cleanupConnection() {
        if (pc) {
            pc.close();
            pc = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
        if (currentStream) {
            currentStream.getTracks().forEach((t) => t.stop());
            currentStream = null;
        }
    }

    onMount(() => {
        isMounted = true;
        initWebRTC();

        return () => {
            isMounted = false;
            console.log(`[CameraCardLive] Cleanup ${config.name}`);
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            cleanupConnection();
        };
    });
</script>

<video
    autoplay
    muted
    playsinline
    class="live-video"
    style:object-fit={config.aspectRatio ? "contain" : "cover"}
    use:srcObjectAction={currentStream}
></video>

<style>
    .live-video {
        width: 100%;
        height: 100%;
        display: block;
        background: black;
    }
</style>
