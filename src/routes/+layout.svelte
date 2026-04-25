<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import '../app.css';
	let { children } = $props();
</script>

<Tooltip.Provider>
	{@render children()}
</Tooltip.Provider>
