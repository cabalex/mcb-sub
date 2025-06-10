<script lang="ts" context="module">
	export interface CaptionStyle {
		fontColor: string;
		fontSize: number;
		backgroundColor: string;
		backgroundOpacity: number;
		offsetPosition: number;
		textOpacity: number;
		fontWeight: number;
		fxEnabled: boolean;
		improveMachineTranslation: boolean;
	}

	export const defaultStyle = {
		fontColor: '#ffffff',
		fontSize: 24,
		backgroundColor: '#000000',
		backgroundOpacity: 0.7,
		offsetPosition: 0,
		textOpacity: 1,
		fontWeight: 400,
		fxEnabled: window.matchMedia(`(prefers-reduced-motion: reduce)`).matches !== true,
		improveMachineTranslation: false
	};

	export function applyStyle(style: CaptionStyle) {
		return `color: ${style.fontColor}; font-weight: ${style.fontWeight}; font-size: calc(${style.fontSize}px * var(--font-scale, 1)); opacity: ${style.textOpacity};`;
	}

	export function applyWordStyle(style: CaptionStyle) {
		const backgroundWithOpacity =
			style.backgroundColor +
			Math.round(style.backgroundOpacity * 255)
				.toString(16)
				.padStart(2, '0');
		return `background-color: ${backgroundWithOpacity};`;
	}
</script>

<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import BoolInput from './BoolInput.svelte';
	import ColorInput from './ColorInput.svelte';
	import SelectNumberInput from './SelectNumberInput.svelte';

	export let showCaptionStyle = false;
	export let captionStyle: CaptionStyle = JSON.parse(JSON.stringify(defaultStyle));

	function resetStyle() {
		captionStyle = JSON.parse(JSON.stringify(defaultStyle));
	}

	$: {
		localStorage.setItem('mcb-captionStyle', JSON.stringify(captionStyle));
	}

	$: {
		if (captionStyle.fxEnabled) {
			captionStyle.improveMachineTranslation = false;
		}
	}

	$: isDefault = JSON.stringify(captionStyle) === JSON.stringify(defaultStyle);

	$: subtitleStyles = applyStyle(captionStyle);
	$: wordStyles = applyWordStyle(captionStyle);

	let aprilFools = document.body.classList.contains('april-fools');
	function removeAprilFools() {
		document.body.classList.remove('april-fools');
		aprilFools = false;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={() => (showCaptionStyle = false)} transition:fade={{ duration: 100 }}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="modalContent"
		on:click={(e) => e.stopPropagation()}
		transition:fly={{ duration: 100, y: 50 }}
	>
		<div class="captionPreview">
			{#if captionStyle.improveMachineTranslation}
				<div class="subtitle" style={subtitleStyles}>
					<span style={wordStyles}>Blue Cop, set up!</span>
				</div>
			{:else}
				<div class="subtitle" style={subtitleStyles}>
					<span style={wordStyles}>Blue</span>
					<span style={wordStyles}>Cop,</span>
					<span style={wordStyles}>set</span>
					<span style={wordStyles}>up!</span>
				</div>
			{/if}
		</div>
		<BoolInput
			label="Enable FX (select episodes)"
			description="FX may override certain caption settings."
			bind:value={captionStyle.fxEnabled}
		/>
		<div class:inputDisabled={captionStyle.fxEnabled}>
			<BoolInput
				label="Improve machine translation"
				description="Make captions more readable for browser translation features. (FX must be disabled.)"
				bind:value={captionStyle.improveMachineTranslation}
			/>
		</div>
		<hr />
		<SelectNumberInput label="Text size" bind:value={captionStyle.fontSize}>
			<option value="6">25%</option>
			<option value="12">50%</option>
			<option value="18">75%</option>
			<option value="24">100%</option>
			<option value="30">125%</option>
			<option value="34">150%</option>
			<option value="48">200%</option>
		</SelectNumberInput>
		<SelectNumberInput label="Position offset" bind:value={captionStyle.offsetPosition}>
			<option value="-17">None</option>
			<option value="0">Normal</option>
			<option value="17">2x</option>
			<option value="51">3x</option>
			<option value="85">5x</option>
			<option value="170">10x</option>
		</SelectNumberInput>
		<SelectNumberInput label="Font weight" bind:value={captionStyle.fontWeight}>
			<option value="200">Thin</option>
			<option value="400">Normal</option>
			<option value="700">Bold</option>
			<option value="900">Black</option>
		</SelectNumberInput>
		<SelectNumberInput label="Opacity" bind:value={captionStyle.textOpacity}>
			<option value="0">0%</option>
			<option value="0.25">25%</option>
			<option value="0.5">50%</option>
			<option value="0.75">75%</option>
			<option value="1">100%</option>
		</SelectNumberInput>
		<ColorInput label="Text color" bind:value={captionStyle.fontColor} />
		<ColorInput label="Background color" bind:value={captionStyle.backgroundColor} />
		<SelectNumberInput label="Background opacity" bind:value={captionStyle.backgroundOpacity}>
			<option value="0">0%</option>
			<option value="0.25">25%</option>
			<option value="0.5">50%</option>
			<option value="0.7">70%</option>
			<option value="1">100%</option>
		</SelectNumberInput>
		{#if aprilFools}
			<hr />
			<button class="april-fools-disable" on:click={removeAprilFools}> 🎉 April Fools! </button>
		{/if}
		<div class="btnrow">
			<button
				disabled={isDefault}
				class="close"
				style="color: var(--phoenixFire)"
				on:click={resetStyle}>Reset to default</button
			>
			<button class="close" on:click={() => (showCaptionStyle = false)}>Close</button>
		</div>
	</div>
</div>

<style>
	.april-fools-disable {
		font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
		background-color: var(--blueCop);
		transition: all 0.2s ease-in-out;
		color: white;
		border-radius: 100px;
	}
	.april-fools-disable:hover {
		background-color: var(--redBlitz);
	}
	.captionPreview {
		width: 100%;
		min-height: 75px;
		max-height: 75px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--blackHook);
		border-radius: 10px;
		position: sticky;
		top: 0;
		z-index: 1;
		overflow: hidden;
	}
	.subtitle {
		max-width: 80%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;

		/* additions */
		margin: 0 auto;
	}
	hr {
		width: calc(100% - 20px);
		border-color: #333;
		border-style: solid;
	}
	button:disabled {
		opacity: 0.5;
	}
	.subtitle span {
		padding: 0 0.25ch;
	}
	.inputDisabled {
		pointer-events: none;
		opacity: 0.5;
	}
	@media screen and (min-width: 900px) {
		.captionPreview {
			min-width: 500px;
		}
	}
	@media (prefers-color-scheme: light) {
		hr {
			border-color: #ccc;
		}
	}
</style>
