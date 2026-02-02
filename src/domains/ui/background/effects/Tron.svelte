<script lang="ts">
    import { onMount } from "svelte";
    import type { TronSettings } from "../types";

    let {
        settings = { backgroundColor: "#000000", maxBeams: 8, beamSpeed: 3 },
    }: { settings?: TronSettings } = $props();

    let canvas: HTMLCanvasElement;
    let animationFrameId: number;

    // Predefined neon colors for beams
    const NEON_COLORS = [
        "#00ffff", // Cyan
        "#ff00ff", // Magenta
        "#ffff00", // Yellow
        "#00ff00", // Green
        "#ff0000", // Red
        "#0088ff", // Blue
    ];

    interface Point {
        x: number;
        y: number;
    }

    class TronBeam {
        path: Point[] = [];
        vx: number = 0;
        vy: number = 0;
        color: string;
        colorIndex: number;
        speed: number;
        turnTimer: number;
        alive: boolean = true;
        growing: boolean = true;
        maxLength: number = 2000;
        lastTurnDirection: number = 0; // 1 for clockwise, -1 for counterclockwise, 0 for no turn yet
        extraLives: number = 0; // Bonus lives earned from winning collisions

        constructor(width: number, height: number, speed: number) {
            this.speed = speed;

            // Random color
            this.colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
            this.color = NEON_COLORS[this.colorIndex];

            // Start from random edge with ONLY horizontal or vertical direction
            const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left

            switch (edge) {
                case 0: // Top - move DOWN only
                    this.path.push({ x: Math.random() * width, y: 0 });
                    this.vx = 0;
                    this.vy = 1;
                    break;
                case 1: // Right - move LEFT only
                    this.path.push({ x: width, y: Math.random() * height });
                    this.vx = -1;
                    this.vy = 0;
                    break;
                case 2: // Bottom - move UP only
                    this.path.push({ x: Math.random() * width, y: height });
                    this.vx = 0;
                    this.vy = -1;
                    break;
                case 3: // Left - move RIGHT only
                    this.path.push({ x: 0, y: Math.random() * height });
                    this.vx = 1;
                    this.vy = 0;
                    break;
            }

            // Normalize to speed
            const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx = (this.vx / len) * this.speed;
            this.vy = (this.vy / len) * this.speed;

            this.turnTimer = 50 + Math.random() * 150;
        }

        update(width: number, height: number) {
            if (!this.alive || !this.growing) return;

            // Add new point to path
            const lastPoint = this.path[this.path.length - 1];
            const newPoint = {
                x: lastPoint.x + this.vx,
                y: lastPoint.y + this.vy,
            };

            // Check if reached edge
            if (
                newPoint.x < 0 ||
                newPoint.x > width ||
                newPoint.y < 0 ||
                newPoint.y > height
            ) {
                this.growing = false;
                return;
            }

            // Check max length
            if (this.path.length > this.maxLength) {
                this.growing = false;
                return;
            }

            this.path.push(newPoint);

            // Random turns (90 degrees only, alternating direction)
            this.turnTimer--;
            if (this.turnTimer <= 0 && Math.random() < 0.3) {
                this.turnTimer = 50 + Math.random() * 150;

                // Determine turn direction (must alternate)
                let turnDirection: number;
                if (this.lastTurnDirection === 0) {
                    // First turn, can be either direction
                    turnDirection = Math.random() < 0.5 ? 1 : -1;
                } else {
                    // Must be opposite of last turn
                    turnDirection = -this.lastTurnDirection;
                }

                // Apply turn
                const oldVx = this.vx;
                const oldVy = this.vy;

                if (turnDirection === 1) {
                    // Turn clockwise (right): (vx, vy) -> (-vy, vx)
                    this.vx = -oldVy;
                    this.vy = oldVx;
                } else {
                    // Turn counterclockwise (left): (vx, vy) -> (vy, -vx)
                    this.vx = oldVy;
                    this.vy = -oldVx;
                }

                this.lastTurnDirection = turnDirection;
            }
        }

        draw(ctx: CanvasRenderingContext2D) {
            if (!this.alive || this.path.length < 2) return;

            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Draw the entire path
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);

            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }

            ctx.stroke();

            // Draw brighter glow at the tip if still growing
            if (this.growing) {
                const tip = this.path[this.path.length - 1];
                ctx.shadowBlur = 50;
                ctx.beginPath();
                ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            ctx.restore();
        }

        // Check collision with another beam
        intersects(other: TronBeam): boolean {
            if (!this.alive || !other.alive) return false;
            if (this.colorIndex === other.colorIndex) return false; // Only different colors collide
            if (this.path.length < 2 || other.path.length < 2) return false;

            // Check if any point in this beam's path intersects with other beam's path
            const tip = this.path[this.path.length - 1];

            for (let i = 0; i < other.path.length - 1; i++) {
                const p1 = other.path[i];
                const p2 = other.path[i + 1];

                // Simple distance check to line segment
                const dist = this.pointToSegmentDistance(tip, p1, p2);
                if (dist < 5) {
                    return true;
                }
            }

            return false;
        }

        pointToSegmentDistance(
            point: Point,
            segStart: Point,
            segEnd: Point,
        ): number {
            const A = point.x - segStart.x;
            const B = point.y - segStart.y;
            const C = segEnd.x - segStart.x;
            const D = segEnd.y - segStart.y;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;

            if (lenSq !== 0) param = dot / lenSq;

            let xx, yy;

            if (param < 0) {
                xx = segStart.x;
                yy = segStart.y;
            } else if (param > 1) {
                xx = segEnd.x;
                yy = segEnd.y;
            } else {
                xx = segStart.x + param * C;
                yy = segStart.y + param * D;
            }

            const dx = point.x - xx;
            const dy = point.y - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }

        respawn(width: number, height: number, speed: number) {
            this.path = [];
            this.speed = speed;
            this.colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
            this.color = NEON_COLORS[this.colorIndex];
            this.lastTurnDirection = 0; // Reset turn direction
            this.extraLives = 0; // Reset bonus lives

            // Start from random edge with ONLY horizontal or vertical direction
            const edge = Math.floor(Math.random() * 4);

            switch (edge) {
                case 0: // Top - move DOWN only
                    this.path.push({ x: Math.random() * width, y: 0 });
                    this.vx = 0;
                    this.vy = 1;
                    break;
                case 1: // Right - move LEFT only
                    this.path.push({ x: width, y: Math.random() * height });
                    this.vx = -1;
                    this.vy = 0;
                    break;
                case 2: // Bottom - move UP only
                    this.path.push({ x: Math.random() * width, y: height });
                    this.vx = 0;
                    this.vy = -1;
                    break;
                case 3: // Left - move RIGHT only
                    this.path.push({ x: 0, y: Math.random() * height });
                    this.vx = 1;
                    this.vy = 0;
                    break;
            }

            // Normalize to speed
            const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx = (this.vx / len) * this.speed;
            this.vy = (this.vy / len) * this.speed;

            this.turnTimer = 50 + Math.random() * 150;
            this.alive = true;
            this.growing = true;
        }
    }

    onMount(() => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Create initial beams
        let beams: TronBeam[] = [];
        const maxBeams = settings?.maxBeams || 8;
        const beamSpeed = settings?.beamSpeed || 3;

        for (let i = 0; i < maxBeams; i++) {
            beams.push(new TronBeam(width, height, beamSpeed));
        }

        // Watch for settings changes and adjust beams
        let lastMaxBeams = maxBeams;
        let lastBeamSpeed = beamSpeed;

        const animate = () => {
            if (!ctx || !canvas) return;

            // Check if maxBeams changed
            const currentMaxBeams = settings?.maxBeams || 8;
            const currentBeamSpeed = settings?.beamSpeed || 3;

            if (currentMaxBeams !== lastMaxBeams) {
                if (currentMaxBeams > lastMaxBeams) {
                    // Add more beams
                    for (let i = lastMaxBeams; i < currentMaxBeams; i++) {
                        beams.push(
                            new TronBeam(width, height, currentBeamSpeed),
                        );
                    }
                } else {
                    // Remove excess beams
                    beams = beams.slice(0, currentMaxBeams);
                }
                lastMaxBeams = currentMaxBeams;
            }

            // Update speed if changed
            if (currentBeamSpeed !== lastBeamSpeed) {
                for (const beam of beams) {
                    beam.speed = currentBeamSpeed;
                    // Update velocity magnitude
                    const len = Math.sqrt(
                        beam.vx * beam.vx + beam.vy * beam.vy,
                    );
                    if (len > 0) {
                        beam.vx = (beam.vx / len) * currentBeamSpeed;
                        beam.vy = (beam.vy / len) * currentBeamSpeed;
                    }
                }
                lastBeamSpeed = currentBeamSpeed;
            }

            // Clear canvas (transparent so CSS background shows through)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update all beams
            for (const beam of beams) {
                beam.update(width, height);
            }

            // Check for collisions (different colors only)
            // Length-based combat with extra lives system
            for (let i = 0; i < beams.length; i++) {
                if (!beams[i].growing) continue;

                for (let j = 0; j < beams.length; j++) {
                    if (i === j) continue;
                    if (!beams[j].growing) continue;

                    if (beams[i].intersects(beams[j])) {
                        const lengthI = beams[i].path.length;
                        const lengthJ = beams[j].path.length;

                        if (lengthI < lengthJ) {
                            // i is shorter - check for extra life
                            if (beams[i].extraLives > 0) {
                                // Survives! Consume the extra life
                                beams[i].extraLives--;
                            } else {
                                // Dies
                                beams[i].growing = false;
                            }
                            // j wins and gets bonus life
                            beams[j].extraLives++;
                            break;
                        } else if (lengthI > lengthJ) {
                            // j is shorter - check for extra life
                            if (beams[j].extraLives > 0) {
                                // Survives! Consume the extra life
                                beams[j].extraLives--;
                            } else {
                                // Dies
                                beams[j].growing = false;
                            }
                            // i wins and gets bonus life
                            beams[i].extraLives++;
                        } else {
                            // Equal length - BOTH DIE regardless of extra lives
                            beams[i].growing = false;
                            beams[j].growing = false;
                            break;
                        }
                    }
                }
            }

            // Respawn beams that stopped growing
            for (const beam of beams) {
                if (!beam.growing && beam.alive) {
                    beam.alive = false;
                    setTimeout(
                        () => {
                            beam.respawn(width, height, currentBeamSpeed);
                        },
                        1000 + Math.random() * 2000,
                    );
                }
            }

            // Draw all beams
            for (const beam of beams) {
                beam.draw(ctx);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    });
</script>

<canvas
    bind:this={canvas}
    class="tron-canvas"
    style="background-color: {settings?.backgroundColor || '#000000'};"
></canvas>

<style>
    .tron-canvas {
        display: block;
        position: fixed;
        inset: 0;
        z-index: -1;
    }
</style>
