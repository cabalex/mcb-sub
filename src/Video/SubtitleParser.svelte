<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import CaptionEffect from './CaptionEffect.svelte';
	import {
		applyStyle,
		applyWordStyle,
		type CaptionStyle
	} from './CaptionStyle/CaptionStyle.svelte';

	export let subtitles: Array<{ start: number; end: number; text: string }>;
	export let target: any;
	export let hover: boolean;
	export let captionStyle: CaptionStyle;
	export let bilingual: boolean = false;

	let currentSubtitle: (typeof subtitles)[number] | null = null;

	let mounted = true;
	function subtitleUpdate() {
		if (mounted) requestAnimationFrame(subtitleUpdate);
		if (!target) return;
		let time = target.getCurrentTime();

		if (currentSubtitle && time >= currentSubtitle.start && time < currentSubtitle.end) return;
		for (let sub of subtitles) {
			if (time >= sub.start && time <= sub.end) {
				currentSubtitle = sub;
				return;
			}
			if (time < sub.start) break;
		}
		currentSubtitle = null;
	}

	$: subtitleStyles = applyStyle(captionStyle);
	$: wordStyles = applyWordStyle(captionStyle);

	onMount(() => {
		requestAnimationFrame(subtitleUpdate);
		mounted = true;
	});

	onDestroy(() => {
		mounted = false;
	});
</script>

{#if currentSubtitle}
	<div class="subtitleArea" class:bilingual class:hover style="--bottomOffset: {captionStyle.offsetPosition}px">
		{#if currentSubtitle.text.includes(' (FX-')}
			<CaptionEffect
				disabled={!captionStyle.fxEnabled}
				{subtitleStyles}
				{wordStyles}
				text={currentSubtitle.text.split(' (FX-')[0]}
				effect={currentSubtitle.text.split(' (FX-')[1].split(')')[0]}
			/>
		{:else if bilingual}
			{@const parts = currentSubtitle.text.split(" / ")}
			<div
				class="subtitle"
				style={subtitleStyles}
				class:needsFixing={parts[0].includes('FIX_THIS')}
			>
				{#each parts[0].replace(' (FIX_THIS)', '').split(/[ \n]/) as word}
					<span style={wordStyles}>{word}</span>
					{#if currentSubtitle.text.includes(word + '\n')}
						<span style={wordStyles} class="newline"></span>
					{/if}
				{/each}
			</div>
			{#if parts.length > 1}
			<div style="flex-grow: 1"></div>
			<div
				class="subtitle"
				style={"font-style: italic; " + subtitleStyles}
				class:needsFixing={parts[1].includes('FIX_THIS')}
			>
				{#each parts[1].replace(' (FIX_THIS)', '').split(/[ \n]/) as word}
					<span style={wordStyles}>{word}</span>
					{#if currentSubtitle.text.includes(word + '\n')}
						<span style={wordStyles} class="newline"></span>
					{/if}
				{/each}
			</div>
			{/if}
		{:else}
			<div
				class="subtitle"
				style={subtitleStyles}
				class:needsFixing={currentSubtitle.text.includes('FIX_THIS')}
			>
				{#each currentSubtitle.text.replace(' (FIX_THIS)', '').split(/[ \n]/) as word}
					<span style={wordStyles}>{word}</span>
					{#if currentSubtitle.text.includes(word + '\n')}
						<span style={wordStyles} class="newline"></span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.subtitleArea {
		position: absolute;
		bottom: calc(17px + var(--bottomOffset, 0px));
		left: 0;
		width: 100%;
		height: calc(100% - calc(calc(17px + var(--bottomOffset, 0px))) * 2);
		color: white;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		transition:
			bottom 0.1s ease-in-out,
			top 0.1s ease-in-out,
			height 0.1s ease-in-out;
	}
	.subtitleArea.hover {
		bottom: calc(70px + var(--bottomOffset, 0px));
		height: calc(100% - calc(calc(70px + var(--bottomOffset, 0px))) * 2);
	}
	.subtitle {
		max-width: 80%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}
	:global(.subtitle) {
		font-size: 24px;
		--font-scale: 1;
	}
	.subtitle.needsFixing {
		color: orange;
	}
	.subtitle.needsFixing:after {
		content: '⚠️';
		font-size: 0.5em;
		background-color: rgba(0, 0, 0, 0.7);
		align-self: flex-start;
		height: 3em;
	}
	.subtitle span {
		background-color: rgba(0, 0, 0, 0.7);
		padding: 0 0.25ch;
	}
	.subtitle span.newline {
		width: 0;
		flex-basis: 100%;
	}
	@media screen and (max-width: 700px) {
		:global(.subtitle) {
			--font-scale: 0.75;
			font-size: 18px;
		}
	}
	@media screen and (min-width: 1200px) {
		:global(.subtitle) {
			--font-scale: 1.5;
			font-size: 36px;
		}
	}
</style>
