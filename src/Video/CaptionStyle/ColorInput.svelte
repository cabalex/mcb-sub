<script lang="ts">
	export let label: string;
	export let description: string | null = null;

	export let value = '#000000';

	let colorInput: HTMLInputElement;
	function setColor() {
		colorInput.click();
	}
</script>

<div class="input">
	<div class="text">
		<h4>{label}</h4>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
	<button style="background-color: {value}" on:click={setColor} />
	<input type="color" bind:value bind:this={colorInput} />
</div>

<style>
	.input {
		width: calc(100% - 20px);
		display: flex;
		flex-direction: row;
		gap: 10px;
		padding: 5px 10px;
		position: relative;
	}
	.text {
		margin: 10px;
		display: flex;
		flex-direction: column;
	}
	.text {
		flex-grow: 1;
		font-size: 1em;
	}
	h4,
	p {
		margin: 0;
	}
	button {
		width: 36px;
		height: 36px;
		padding: 0;
		align-self: center;
		border-radius: 50%;
		border: none;
		border: none;
		cursor: pointer;
	}
	input {
		opacity: 0;
		position: absolute;
		top: 0;
		right: 10px;
		width: 18px;
		pointer-events: none;
	}
</style>
