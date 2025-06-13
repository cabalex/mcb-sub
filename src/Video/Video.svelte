<script lang="ts">
	import './captionEffects.css';
	import SvelteYouTube from '../assets/SvelteYouTube.svelte';
	import { translationNotes, type Episode, type Source } from '../subtitles';
	import CaptionEditor from './CaptionEditor/CaptionEditor.svelte';
	import SubtitleParser from './SubtitleParser.svelte';
	import FullscreenIcon from '../assets/fullscreen.svg';
	import FullscreenExitIcon from '../assets/fullscreen-exit.svg';
	import { fade, fly, slide } from 'svelte/transition';
	import type { Writable } from 'svelte/store';
	import type { CustomDraft, CustomEpisode } from '../editor';
	import CaptionStyleModal, {
		defaultStyle,
		type CaptionStyle
	} from './CaptionStyle/CaptionStyle.svelte';
	import LocalVideo from './LocalVideo/LocalVideo.svelte';

	export let video: Writable<Episode | CustomEpisode | null>;
	export let source: Writable<Source | CustomDraft | null>;
	export let editor: Writable<CustomDraft | null>;

	let fullscreen = false;

	let hover = false;
	let target: { getCurrentTime: () => any } | null = null;
	function onPlay(e) {
		if (target === e.detail.target) return;
		target = e.detail.target;
		console.log('Playing', e.detail.target);
		//console.log(e.detail.target.getOption('captions', 'track'));
		//e.detail.target.setOption('captions', 'track', { languageCode: 'ko' });
		//console.log(e.detail.target.getOption('captions', 'track'));
		hover = true;
		timeout = setTimeout(() => (hover = false), 3000);
	}

	function onEnd(e) {
		// get next video
		console.log('Ended', e.detail.target);
		if ($editor !== null) return;

		if ($video !== null && $source !== null) {
			// move to next custom episode
			let index = $source.episodes.indexOf($video);
			if (index < $source.episodes.length - 1) {
				video.set($source.episodes[index + 1]);
			}
		}
	}

	function parseTimestamp(timestamp: string) {
		let [hours, minutes, seconds] = timestamp.replace(',', '.').split(':').map(parseFloat);
		return hours * 3600 + minutes * 60 + seconds;
	}

	let subs: Array<{ start: number; end: number; text: string }> = [];
	async function fetchSubtitle(toFetch: string | [number, number, string][]) {
		if (typeof toFetch === 'string') {
			let response = await fetch(toFetch);
			if (!response.ok) return console.error('Failed to fetch subtitle');
			if (response.headers.get('content-type') === 'text/html') {
				return console.error('Subtitle is not a valid SRT file');
			}
			let data = await response.text();
			let lines = data
				.split('\n\n')
				.map((x) => x.trim())
				.filter((x) => x.length > 0);
			subs = [];
			let i = 0;
			for (let line of lines) {
				if (line.startsWith((i + 1).toString() + '\n')) {
					i++;
					const sublines = line.split('\n');
					const sub = { start: -1, end: 1, text: '' };
					[sub.start, sub.end] = sublines[1].split(' --> ').map(parseTimestamp);
					sub.text = sublines.slice(2).join('\n');
					subs.push(sub);
				}
			}
		} else {
			subs = toFetch.map(([start, end, text]) => ({ start, end, text }));
		}
	}

	$: {
		if ($video && $source && 'path' in $source) {
			fetchSubtitle(`./sub${$source.path}/${$video.id}.srt`);
		} else if ($video && $source && 'episodes' in $source) {
			// load from custom subtitle
			const episode = $source.episodes.find((x) => x.id === $video.id);
			if (episode) {
				fetchSubtitle(episode.timings);
			} else {
				subs = [];
			}
		} else {
			subs = [];
		}
	}

	let videoElem: HTMLDivElement;
	// requestFullscreen is not supported on iOS. (it is supported on iPad >:( )
	let fakeFullscreen = false;
	async function toggleFullscreen() {
		shownFullscreenTooltip();
		if (fullscreen) {
			if (!fakeFullscreen) document.exitFullscreen();
			fullscreen = false;
			fakeFullscreen = false;
			try {
				screen.orientation.unlock();
			} catch (e) {
				// Locking not supported
			}
		} else {
			try {
				await videoElem.requestFullscreen();
				fullscreen = true;
				try {
					screen.orientation.lock('landscape');
				} catch (e) {
					// Locking not supported
				}
			} catch (e) {
				fullscreen = true;
				fakeFullscreen = true;
			}
		}
	}

	let timeout: number;
	function hovered(e) {
		hover = true;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => (hover = false), 3000);
	}

	function clearHover() {
		hover = false;
		if (timeout) clearTimeout(timeout);
	}

	$: issueReportAvailable = !!$video && !!target && subs.length > 0 && !fullscreen;

	const toTime = (time: number) =>
		`${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`;

	function openIssueReporter() {
		if (!target || !$video) return;
		// construct github issue request with context
		let currentTime = target.getCurrentTime();
		let currentCaptionIndex = subs.findIndex(
			(sub) => currentTime >= sub.start && currentTime <= sub.end
		);
		console.log(currentCaptionIndex);
		let previousCaption, currentCaption, nextCaption;
		if (currentCaptionIndex > 0) {
			previousCaption =
				`(${toTime(subs[currentCaptionIndex - 1].start)} - ${toTime(subs[currentCaptionIndex - 1].end)}) ` +
				subs[currentCaptionIndex - 1].text;
		}
		if (currentCaptionIndex !== -1 && currentCaptionIndex < subs.length - 1) {
			nextCaption =
				`(${toTime(subs[currentCaptionIndex + 1].start)} - ${toTime(subs[currentCaptionIndex + 1].end)}) ` +
				subs[currentCaptionIndex + 1].text;
		}
		if (currentCaptionIndex !== -1) {
			currentCaption =
				`(${toTime(subs[currentCaptionIndex].start)} - ${toTime(subs[currentCaptionIndex].end)}) ` +
				subs[currentCaptionIndex].text;
		}
		let title = `CC issue | ${$video.name}, ${toTime(currentTime)}`;
		let body = `## Issue template (do not remove)\n**Video**: ${$video.name} <https://youtu.be/${$video.id}>\n⏱️ ${toTime(currentTime)}`;

		if (previousCaption) body += `\n⏮️CC: ${previousCaption}`;
		if (currentCaption) body += `\n🟦CC: ${currentCaption}`;
		if (nextCaption) body += `\n⏭️CC: ${nextCaption}`;

		body += '\n\n## Describe the problem';

		window.open(
			`https://github.com/cabalex/mcb-sub/issues/new?title=${title}&body=${encodeURIComponent(body)}`
		);
	}

	let fullscreenTooltipShown = localStorage.getItem('mcb-fullscreenTooltipShown') === 'true';
	function shownFullscreenTooltip() {
		localStorage.setItem('mcb-fullscreenTooltipShown', 'true');
		fullscreenTooltipShown = true;
	}

	let screenspaceEffect = '';

	type Timing = { start: number; end: number; animation: string };
	const screenspaceTimings: { [key: string]: Timing[] } = {
		L0WnJ7Kz_rw: [
			{ start: 1 * 60 + 55.1, end: 1 * 60 + 55.5, animation: 'bonkRight' },
			{ start: 1 * 60 + 57, end: 1 * 60 + 57.5, animation: 'bonkRight' },
			{ start: 1 * 60 + 59.4, end: 2 * 60, animation: 'bonkUp' },
			{ start: 2 * 60 + 49.3, end: 2 * 60 + 50.3, animation: 'bonkRight' },
			{ start: 3 * 60 + 16.3, end: 3 * 60 + 17, animation: 'bonkLeft' },
			{ start: 3 * 60 + 21.2, end: 3 * 60 + 22, animation: 'bonkRight' },
			{ start: 3 * 60 + 24.3, end: 3 * 60 + 25, animation: 'bonkUp' },
			{ start: 3 * 60 + 23, end: 3 * 60 + 24, animation: 'bonkDown' },
			{ start: 3 * 60 + 45.8, end: 3 * 60 + 47, animation: 'bonkDown' },
			{ start: 3 * 60 + 47.9, end: 3 * 60 + 49, animation: 'impactSmall' },
			{ start: 5 * 60 + 17.5, end: 5 * 60 + 18, animation: 'impact' },
			{ start: 5 * 60 + 18, end: 5 * 60 + 24.5, animation: 'screenshake' },
			{ start: 6 * 60 + 16.7, end: 6 * 60 + 18, animation: 'impact' },
			{ start: 6 * 60 + 23.8, end: 6 * 60 + 25, animation: 'impactSmall' }
		],
		ACqsVI_TFl4: [
			{ start: 7 * 60 + 20.5, end: 7 * 60 + 22, animation: 'impactSmall' },
			{ start: 9 * 60 + 5, end: 9 * 60 + 7, animation: 'flashbang' },
			{ start: 9 * 60 + 10.3, end: 9 * 60 + 11, animation: 'slice' },
			{ start: 9 * 60 + 11, end: 9 * 60 + 35, animation: 'sliceAfter' },
			{ start: 9 * 60 + 35, end: 9 * 60 + 39.15, animation: 'fnDie' }
		]
	};
	function getScreenspaceEffect(target: any) {
		const timings = screenspaceTimings[$video?.id ?? ''];
		if (!timings || !target) return;
		requestAnimationFrame(getScreenspaceEffect.bind(null, target));
		if (fullscreen || !captionStyle.fxEnabled) {
			screenspaceEffect = '';
			return;
		}
		let currentTime = target.getCurrentTime();
		let effect = timings.find((timing) => currentTime >= timing.start && currentTime <= timing.end);
		if (effect && target.getPlayerState() === 1) {
			screenspaceEffect = effect.animation;
		} else {
			screenspaceEffect = '';
		}
	}
	$: getScreenspaceEffect(target);

	$: {
		if (
			$source !== null &&
			'path' in $source &&
			$video !== null &&
			translationNotes[$source.path] &&
			translationNotes[$source.path][$video.id] &&
			showTranslationNotes
		) {
			setTimeout(() => {
				// Set .timestamp jump events
				const timestamps = document.querySelectorAll('.timestamp');
				timestamps.forEach((timestamp) => {
					timestamp.addEventListener('click', (e) => {
						e.stopPropagation();
						const time = parseTimestamp('0:' + timestamp.innerText);
						if (isNaN(time)) return;
						if (target) target.seekTo(time);
					});
				});
			}, 0);
		}
	}

	let showTranslationNotes = false;
	let showCaptionStyle = false;
	let captionStyle: CaptionStyle = {
		...defaultStyle,
		...JSON.parse(localStorage.getItem('mcb-captionStyle') ?? JSON.stringify(defaultStyle))
	};
</script>

<div class="video" class:fullscreen class:fakeFullscreen bind:this={videoElem}>
	{#if $video}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class={'videoInner ' + screenspaceEffect}
			transition:slide={{ duration: 100, axis: 'y' }}
			on:focus={hovered}
			on:mouseover={hovered}
			on:mousemove={hovered}
			on:mouseout={clearHover}
			on:blur={clearHover}
		>
			{#if process.env.NODE_ENV === 'development' && $video.id === 'local'}
				<LocalVideo on:play={onPlay} on:end={onEnd} />
			{:else}
				<SvelteYouTube
					videoId={$video.id}
					on:play={onPlay}
					on:end={onEnd}
					responsive={true}
					options={{
						playerVars: {
							autoplay: 1,
							fs: 0,
							playsinline: 1,
							rel: 0
						}
					}}
				/>
			{/if}
			{#if target && $editor === null}
				<SubtitleParser
					{captionStyle}
					subtitles={subs}
					path={$source?.path ?? null}
					credits={$source?.episodes.indexOf($video) === ($source?.episodes.length || 0) - 1
						? $source?.credits
						: null}
					{target}
					{hover}
					bilingual={$video.label === 'OP'}
				/>
			{/if}
			<button class="fullscreenBtn" on:click={toggleFullscreen} class:visible={hover}>
				{#if fullscreen}
					<img width="24px" height="24px" src={FullscreenExitIcon} alt="Exit Fullscreen" />
				{:else}
					<img width="24px" height="24px" src={FullscreenIcon} alt="Enter Fullscreen" />
				{/if}
			</button>
			{#if !fullscreenTooltipShown && issueReportAvailable}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="fullscreenTooltip"
					on:click={shownFullscreenTooltip}
					transition:slide={{ duration: 300, axis: 'y' }}
				>
					Tap the bottom right of the video to toggle fullscreen
				</div>
			{/if}
		</div>
		<div class="btnrowScrollWrapper">
			<div class="btnrow">
				{#if issueReportAvailable && $editor === null && $source !== null && 'path' in $source}
					{#if translationNotes[$source.path] && translationNotes[$source.path][$video.id]}
						<button
							class="reportIssueBtn"
							on:click={() => (showTranslationNotes = !showTranslationNotes)}
						>
							{#if $video.id === 'ZLcqsmPCHLY'}
								🔊 Hearing English?
							{:else}
								📝 Translation Notes
							{/if}
						</button>
					{/if}
					<button
						class:fxActive={$video.fx}
						class="reportIssueBtn"
						on:click={() => (showCaptionStyle = !showCaptionStyle)}
					>
						{$video.fx ? '✨' : '⚙️'} CC
					</button>
					<button class="reportIssueBtn" on:click={openIssueReporter}> ⚠️ Report issue </button>
				{/if}
			</div>
		</div>
	{:else}
		<h1>Choose an episode! ➡️</h1>
	{/if}
</div>

{#if $video && target && $editor !== null}
	{#key $video.id}
		<CaptionEditor subtitles={subs} {target} {editor} {video} />
	{/key}
{/if}

{#if $source !== null && 'path' in $source && $video !== null && translationNotes[$source.path] && translationNotes[$source.path][$video.id] && showTranslationNotes}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="modal"
		on:click={() => (showTranslationNotes = false)}
		transition:fade={{ duration: 100 }}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="modalContent"
			on:click={(e) => e.stopPropagation()}
			transition:fly={{ duration: 100, y: 50 }}
		>
			<h2>Translation Notes</h2>
			<div class="notes">
				{@html translationNotes[$source.path][$video.id]}
			</div>
			<button class="close" on:click={() => (showTranslationNotes = false)}>Close</button>
		</div>
	</div>
{/if}

{#if $source !== null && 'path' in $source && $video !== null && showCaptionStyle}
	<CaptionStyleModal bind:showCaptionStyle bind:captionStyle />
{/if}

<svelte:body on:fullscreenchange={() => (fullscreen = document.fullscreenElement !== null)} />

<style>
	.video {
		position: relative;
		width: 100%;
		margin: 0 auto;
		max-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.fakeFullscreen {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 100;
		background-color: black;
		overflow: hidden;
	}
	:global(body:has(.fakeFullscreen)) {
		overflow: hidden;
		margin: 0;
		margin-top: 1px;
		padding: 0;
		border: 0;
		width: 100%;
		height: 100%;
	}
	.videoInner {
		max-width: calc(16 / 9 * 100vh);
		position: relative;
		width: 100%;
		margin: 0 auto;
		max-height: 100vh;
	}
	.fullscreenBtn {
		position: absolute;
		bottom: 0px;
		right: 0px;
		border-radius: 5px 0 0 0;
		z-index: 100;
		width: 38px;
		height: 38px;
		padding: 0;
		background-color: #333;
		color: white;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		line-height: 0;
		outline: none !important;
		animation: hide 0.5s forwards;
		transition: opacity 0.2s ease-in-out;
	}
	@keyframes hide {
		0% {
			opacity: 1;
		}
		100% {
			background-color: transparent;
			opacity: 0;
		}
	}
	.fullscreenBtn.visible,
	.fullscreenBtn:hover {
		opacity: 1;
		animation: none;
	}
	.btnrow {
		display: flex;
		width: 100%;
		justify-content: flex-end;
		align-items: center;
		margin-top: 5px;
	}
	.btnrowScrollWrapper {
		width: 100%;
	}
	.reportIssueBtn {
		border-radius: 100px;
		align-self: flex-end;
		z-index: 10;
		flex-grow: 0;
		width: auto;
		white-space: nowrap;
	}
	.reportIssueBtn:hover,
	.reportIssueBtn:active {
		background-color: #333;
	}
	.fullscreenTooltip {
		background-color: #777;
		padding: 5px;
		top: calc(100% + 15px);
		position: absolute;
		right: 0px;
		border-radius: 5px 0 5px 5px;
		z-index: 11;
	}
	.fullscreenTooltip:after {
		content: '';
		position: absolute;
		top: -20px;
		right: 0px;
		border: 10px solid transparent;
		border-bottom-color: #777;
	}

	.fxActive {
		animation: 3s ease-in-out forwards fxFlair;
		background: linear-gradient(
			-45deg,
			#1a1a1a 20%,
			var(--blueCop),
			var(--megaTrucker),
			var(--megaAmbler),
			var(--phoenixFire),
			var(--shadowX),
			var(--dexter),
			var(--fletaZ),
			var(--wildGuardy),
			var(--buffaloCrush),
			var(--busterGallon),
			var(--blackHook),
			#1a1a1a 80%
		);
		background-size: 350% 200%;
		background-repeat: no-repeat;
		background-color: #1a1a1a !important;
	}
	@keyframes fxFlair {
		0% {
			background-position: -100% 0%;
		}
		100% {
			background-position: 200% 0%;
		}
	}

	@media screen and (orientation: landscape) {
		.fullscreenBtn {
			bottom: 0px;
			right: 0px;
		}
	}
	@media screen and (max-width: 900px) {
		h1 {
			display: none;
		}
		.fullscreenTooltip {
			margin: 0 10px;
			padding: 10px;
			text-align: left;
		}
		.btnrowScrollWrapper {
			position: fixed;
			bottom: var(--safe-area-inset-bottom, 0px);
			left: 0px;
			overflow-y: auto;
			z-index: 10;
			width: 100%;
			background-color: #444;
		}
		.video.fullscreen .btnrowScrollWrapper {
			display: none;
		}
		.btnrow {
			margin-top: 0;
			width: fit-content;
			padding: 5px;
		}
	}
	@media screen and (max-width: 900px) and (max-height: 500px) {
		.video:not(.fullscreen) {
			max-height: 50px;
		}
		.video:not(.fullscreen) .videoInner {
			width: 100%;
			max-width: unset;
			height: 50px;
		}
		.video:not(.fullscreen) .fullscreenBtn {
			width: 100%;
			height: 50px;
			top: 0;
			left: 0;
			bottom: unset;
			opacity: 1;
			background-color: rgba(0, 0, 0, 0.7);
			animation: none;
			border-radius: 0;
		}
		.video:not(.fullscreen) .fullscreenBtn:after {
			content: 'Enter fullscreen';
			margin-left: 1ch;
		}
	}
	@media (prefers-color-scheme: light) {
		.fullscreenTooltip {
			background-color: #333;
			color: white;
		}
		.fullscreenTooltip:after {
			border-bottom-color: #333;
		}
		.reportIssueBtn {
			border-color: #aaa;
		}
		.reportIssueBtn:hover {
			background-color: #ccc;
		}
		.fxActive {
			background: linear-gradient(
				-45deg,
				#f9f9f9 20%,
				var(--blueCop),
				var(--megaTrucker),
				var(--megaAmbler),
				var(--phoenixFire),
				var(--shadowX),
				var(--dexter),
				var(--fletaZ),
				var(--wildGuardy),
				var(--buffaloCrush),
				var(--busterGallon),
				var(--blackHook),
				#f9f9f9 80%
			);
			background-size: 350% 200%;
			background-repeat: no-repeat;
			background-color: #f9f9f9 !important;
		}
	}
</style>
