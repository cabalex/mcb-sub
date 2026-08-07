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
		if (e.detail.target.getCurrentTime() < 1) {
			detectSkipIntro(e.detail.target);
		}
		if (target === e.detail.target) return;
		target = e.detail.target;
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
		if (!timings || !target) {
			screenspaceEffect = '';
			return;
		}
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

	let showSkipIntro = false;
	function skipIntro(target: any) {
		if (target && $video && typeof $video.intro === 'number') {
			target.seekTo($video.intro);
			showSkipIntro = false;
		}
	}

	function detectSkipIntro(target: any) {
		if (!target || typeof $video?.intro !== 'number') {
			showSkipIntro = false;
			return;
		}

		let currentTime = target.getCurrentTime();
		if (currentTime <= 10 && currentTime < $video.intro - 0.5) {
			showSkipIntro = true;
			requestAnimationFrame(detectSkipIntro.bind(null, target));
		} else {
			showSkipIntro = false;
		}
	}

	$: if ($video) {
		getScreenspaceEffect(target);
	}

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
			{#if showSkipIntro}
				<button class="skipIntroBtn" on:click={() => skipIntro(target)}>
					{#if $source?.language !== 'en'}
						⏩
					{:else}
						Skip Intro
					{/if}
				</button>
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
		<main class="noVideo">
			<h1>Metal Cardbot SUB</h1>
			<p>This site allows you to watch full episodes of Metal Cardbot, Metal Cardbot S, and Metal Cardbot W with subtitles in English and other languages. More episodes will be added as they are released on the official Korean Metal Cardbot YouTube channel.</p>
			<p><b>What is Metal Cardbot?</b></p>
			<p>Metal Cardbot is a 2023 animated Korean mecha series created and animated by SAMG Entertainment under the direction of OSROCTION. A boy named Jun discovers the Metal Breath, a mysterious device that allows him to capture and command a species of transforming robots known as Metal Cardbots, who take refuge on Earth after their home planet Machina was destroyed. Can he work with the Metal Cardbot Blue Cop to ensure their peaceful coexistence with humans?</p>
			<p><b>How does the site work?</b></p>
			<p>Click an episode on the sidebar to start watching, or click the season name to change seasons. You can also change or create your own subtitles by clicking the 📜 menu. Metal Cardbot SUB simply overlays subtitles on top of official Metal Cardbot YouTube videos - no piracy or reuploading of content is involved.</p>
			<p>Metal Cardbot is property of SAMG/EBS/OSRO, and this site is not affiliated with nor endorsed by its creators. While we work to ensure our subtitles follow the production team's intent as closely as possible, these subtitles are unofficial.</p>
			<p><b>Where are the missing episodes of Metal Cardbot W?</b></p>
			<p>We are currently waiting for the official Metal Cardbot YouTube channel to upload full episodes of Metal Cardbot W. Unfortunately, we don't have an estimated date of when this may happen, but it is likely to be in Fall 2026. Once they appear on YouTube, we will have subtitles here shortly after.</p>
			<p><b>Who created this site?</b></p>
			<p>This site was created by cabalex, who also assisted <a href="https://x.com/staro_sphere">@staro_sphere</a> and <a href="https://x.com/PalmtreePanic">@PalmtreePanic</a> with the English fan subtitles. While the website is open-source under MIT license, all fan subtitles are the work of their respective contributors - please do not rehost them on other sites without the permission or credit of their creators.</p>
		</main>
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
	.noVideo {
		overflow: auto;
		max-height: calc(100dvh - 1rem);
		max-width: 800px;
		padding: 0 1em;
		text-align: left;
	}
	.noVideo h1 {
		font-size: 2em;
		margin-bottom: 0.5em;
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
		background-color: #000;
	}
	.fullscreenBtn {
		position: absolute;
		bottom: 0px;
		right: 0px;
		border-radius: 5px 0 0 0;
		z-index: 100;
		width: 48px;
		height: 48px;
		padding: 0;
		background-color: rgba(0, 0, 0, 0.7);
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
	.skipIntroBtn {
		position: absolute;
		bottom: max(10%, 50px);
		right: 10px;
		z-index: 10;
		padding: 8px 24px;
		border-radius: 5px;
		background-color: rgba(50, 50, 50, 0.7);
		color: white;
		font-size: min(2em, max(1em, 2vw));
		border: none;
		cursor: pointer;
	}
	.skipIntroBtn:hover {
		background-color: rgba(50, 50, 50, 1);
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
		.noVideo {
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
