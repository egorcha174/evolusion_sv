<script lang="ts">
	import Icon from '@iconify/svelte';

	const { icon, class: className, ...rest } = $props<{ icon: string; class?: string }>();
</script>

<Icon {icon} class={className} {...rest} />
