<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let label: string;
	export let description: string | null = null;

	export let value = 0;

	const dispatch = createEventDispatcher();

	function onChange(e: any) {
		value = parseFloat(e.target.value);
		dispatch('change', [value, e]);
	}
</script>

<div class="input">
	<div class="text">
		<h4>{label}</h4>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
	<select value={value.toString()} on:change={onChange}>
		<slot />
	</select>
</div>

<style>
	.input {
		width: calc(100% - 20px);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 10px;
		padding: 5px 10px;
	}
	.text {
		margin: 10px;
		display: flex;
		flex-direction: column;
	}
	select,
	.text {
		flex-grow: 1;
		font-size: 1em;
	}
	select {
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #666;
		align-self: center;
	}
	h4,
	p {
		margin: 0;
	}
</style>
