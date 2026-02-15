<script lang="ts">
    import { onMount } from "svelte";

    let { children } = $props<{ children: any }>();

    let ref: HTMLElement;

    onMount(() => {
        if (ref) {
            document.body.appendChild(ref);
        }
        return () => {
            if (ref && ref.parentNode) {
                ref.parentNode.removeChild(ref);
            }
        };
    });
</script>

<div bind:this={ref} style="display: contents">
    {@render children()}
</div>
