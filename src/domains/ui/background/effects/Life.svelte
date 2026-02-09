<script lang="ts">
    import { onMount } from 'svelte';
    import type { LifeSettings } from '../types';

    let {
        settings = {
            backgroundColor: '#000000',
            cellColor: '#00ff00',
            cellSize: 15,
            updateInterval: 100
        },
    }: { settings?: LifeSettings } = $props();

    let canvas: HTMLCanvasElement;
    let animationFrameId: number;

    let COLS: number;
    let ROWS: number;

    let grid: number[][];

    function createGrid(rows: number, cols: number): number[][] {
        return new Array(rows)
            .fill(0)
            .map(() => new Array(cols).fill(0).map(() => (Math.random() > 0.8 ? 1 : 0)));
    }

    function getNextGrid(currentGrid: number[][]): number[][] {
        if (!currentGrid) return [];
        const nextGrid = currentGrid.map((arr) => [...arr]);
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = currentGrid[row][col];
                let neighbors = 0;
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (i === 0 && j === 0) continue;
                        const x = col + j;
                        const y = row + i;
                        if (x >= 0 && y >= 0 && x < COLS && y < ROWS) {
                            neighbors += currentGrid[y][x];
                        }
                    }
                }
                if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[row][col] = 0;
                } else if (cell === 0 && neighbors === 3) {
                    nextGrid[row][col] = 1;
                }
            }
        }
        return nextGrid;
    }

    function drawGrid(ctx: CanvasRenderingContext2D, currentGrid: number[][]) {
        if (!currentGrid) return;
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = settings.cellColor;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (currentGrid[row][col] === 1) {
                    ctx.fillRect(col * settings.cellSize, row * settings.cellSize, settings.cellSize - 1, settings.cellSize - 1);
                }
            }
        }
    }

    onMount(() => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setup = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            COLS = Math.floor(width / settings.cellSize);
            ROWS = Math.floor(height / settings.cellSize);
            grid = createGrid(ROWS, COLS);
        };

        setup();

        let lastUpdateTime = 0;
        const animate = (timestamp: number) => {
            if (timestamp - lastUpdateTime > settings.updateInterval) {
                grid = getNextGrid(grid);
                drawGrid(ctx, grid);
                lastUpdateTime = timestamp;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate(0);

        const handleResize = () => {
            setup();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<canvas bind:this={canvas} class="life-canvas" style="background-color: {settings.backgroundColor};"></canvas>

<style>
  .life-canvas {
    display: block;
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
  }
</style>
