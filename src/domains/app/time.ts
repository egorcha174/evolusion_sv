
import { readable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Updates every second
export const time = readable(new Date(), (set) => {
    if (!browser) return;

    const interval = setInterval(() => {
        set(new Date());
    }, 1000);

    return () => clearInterval(interval);
});

// Derived store for minutes (useful for theming schedules, updates less frequently)
export const minutesOfDay = derived(time, ($time) => {
    return $time.getHours() * 60 + $time.getMinutes();
});

// Helper formatted strings
export const timeString = derived(time, ($time) => {
    return $time.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
});
