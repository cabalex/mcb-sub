<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import CaptionEffect from './CaptionEffect.svelte';
	import {
		applyStyle,
		applyWordStyle,
		type CaptionStyle
	} from './CaptionStyle/CaptionStyle.svelte';
	import FinalCountdown from '../assets/FinalCountdown.svelte';
	import Credits from '../assets/Credits.svelte';
	import type { Episode } from '../subtitles';

	export let subtitles: Array<{ start: number; end: number; text: string }>;
	export let path: string | null = null;
	export let target: any;
	export let hover: boolean;
	export let captionStyle: CaptionStyle;
	export let credits: Episode['credits'] = [];
	export let bilingual: boolean = false;

	let atEnd = false;

	let currentSubtitle: (typeof subtitles)[number] | null = null;

	let mounted = true;
	function subtitleUpdate() {
		if (mounted) requestAnimationFrame(subtitleUpdate);
		if (!target) return;
		let time = target.getCurrentTime();

		atEnd = (time > 0 && target.getDuration() - time < 0.1) || target.getPlayerState() === 0;

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

	function* split(word: string, splitter: RegExp = /[ \n]/) {
		let w = '';
		for (let part of word.split(splitter)) {
			yield part;
			w += part + (word[w.length] || '');
			if (word[w.length - 1] === '\n') {
				yield '\n';
			}
		}
	}

	$: subtitleStyles = applyStyle(captionStyle);
	$: wordStyles = applyWordStyle(captionStyle);
	$: {
		if (subtitles) {
			// Reset current subtitle if subtitles change
			currentSubtitle = null;
		}
	}
	$: {
		if (!currentSubtitle && captionStyle.improveMachineTranslation) {
			let area = document.getElementsByClassName('subtitleArea');
			if (area.length > 0) {
				area[0].remove();
			}
		}
	}

	onMount(() => {
		requestAnimationFrame(subtitleUpdate);
		mounted = true;
	});

	onDestroy(() => {
		mounted = false;
	});
</script>

{#if currentSubtitle}
	{#if captionStyle.improveMachineTranslation}
		{@const machineTranslatedText = currentSubtitle.text.split('(FX-')[0].split(' / ')[0]}
		{#key machineTranslatedText}
			<div
				class="subtitleArea"
				class:bilingual
				class:hover
				style="--bottomOffset: {captionStyle.offsetPosition}px"
			>
				<div
					class="subtitle"
					style={subtitleStyles}
					class:needsFixing={machineTranslatedText.includes('FIX_THIS')}
				>
					{#each split(machineTranslatedText.replace(' (FIX_THIS)', '')) as word}
						<span style={wordStyles} class:newline={word === '\n'}>{word}</span>
					{/each}
				</div>
			</div>
		{/key}
	{:else}
		<div
			class="subtitleArea"
			class:bilingual
			class:hover
			style="--bottomOffset: {captionStyle.offsetPosition}px"
		>
			{#if currentSubtitle.text.includes(' (FX-')}
				<CaptionEffect
					disabled={!captionStyle.fxEnabled}
					{subtitleStyles}
					{wordStyles}
					text={currentSubtitle.text.split(' (FX-')[0]}
					effect={currentSubtitle.text.split(' (FX-')[1].split(')')[0]}
				/>
			{:else if bilingual}
				{@const parts = currentSubtitle.text.split(' / ')}
				<div
					class="subtitle"
					style={subtitleStyles}
					class:needsFixing={parts[0].includes('FIX_THIS')}
				>
					{#each split(parts[0].replace(' (FIX_THIS)', '')) as word}
						<span style={wordStyles} class:newline={word === '\n'}>{word}</span>
					{/each}
				</div>
				{#if parts.length > 1}
					<div style="flex-grow: 1"></div>
					<div
						class="subtitle"
						style={'font-style: italic; ' + subtitleStyles}
						class:needsFixing={parts[1].includes('FIX_THIS')}
					>
						{#each split(parts[1].replace(' (FIX_THIS)', '')) as word}
							<span style={wordStyles} class:newline={word === '\n'}>{word}</span>
						{/each}
					</div>
				{/if}
			{:else}
				<div
					class="subtitle"
					style={subtitleStyles}
					class:needsFixing={currentSubtitle.text.includes('FIX_THIS')}
				>
					{#each split(currentSubtitle.text) as word}
						<span style={wordStyles} class:newline={word === '\n'}>{word}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}

{#if target && atEnd && credits !== null}
	<Credits {credits} />
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
