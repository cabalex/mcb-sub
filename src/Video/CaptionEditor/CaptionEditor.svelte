<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { CustomDraft, CustomEpisode } from '../../editor';
	import type { Writable } from 'svelte/store';
	import type { Episode } from '../../subtitles';

	export let subtitles: Array<{ start: number; end: number; text: string }>;
	export let target: any;
	export let editor: Writable<CustomDraft | null>;
	export let video: Writable<Episode | CustomEpisode | null>;

	let customLines: Array<{ text: string; start: number | null; end: number | null }> = [];
	let step: 'text' | 'start' | 'end' | 'review' = 'text';

	if ($editor !== null) {
		const episodeIndex = $editor?.episodes.findIndex((x) => x.id === $video?.id);
		if (episodeIndex !== -1) {
			customLines = $editor.episodes[episodeIndex].timings.map((x) => ({
				start: x[0],
				end: x[1],
				text: x[2]
			}));
			step = 'review';
		}
	}

	async function loadFromSubtitles() {
		customLines = [];
		for (let sub of subtitles) {
			customLines.push({
				text: sub.text,
				start: sub.start,
				end: sub.end
			});
		}
		step = 'review';
	}

	function close() {
		const episode = $editor?.episodes.find((x) => x.id === $video?.id);
		if (episode) {
			const same =
				JSON.stringify(customLines.map((x) => [x.start ?? 0, x.end ?? 0, x.text])) ===
				JSON.stringify(episode.timings);
			if (same) {
				video.set(null);
				return;
			}
		}

		if (customLines.length > 0) {
			if (confirm("Are you sure you want to delete this draft episode? It can't be undone!")) {
				video.set(null);
			}
		} else {
			video.set(null);
		}
	}

	function updateText(text: string) {
		if (text.includes('\n\n')) {
			// read srt
			let lines = text.split('\n\n');
			customLines = [];
			try {
				lines
					.map((x) => x.split('\n'))
					.filter((x) => x.length > 0)
					.forEach(([num, startEnd, ...text]) => {
						if (num === undefined || startEnd === undefined) return;
						customLines.push({
							text: text.join('\n'),
							start: fromTime(startEnd.split(' --> ')[0].replace(',', '.')),
							end: fromTime(startEnd.split(' --> ')[1].replace(',', '.'))
						});
					});
				step = 'review';
			} catch (e) {
				console.error(e);
				customLines = text.split('\n').map((x) => ({ text: x, start: null, end: null }));
			}
		} else {
			customLines = text
				.split('\n')
				.map((x) => ({ text: x.replace('\\n', '\n'), start: null, end: null }));
		}
	}

	function setEnd(i: number, time: number, seek = true) {
		const start = customLines[i].start;
		const nextStart = customLines[i + 1]?.start ?? null;
		if (time < 0) return;
		if (start !== null && time < start) {
			setStart(i, time, false);
		} else if (i + 1 < customLines.length && nextStart !== null && time > nextStart) {
			time = nextStart;
		}
		customLines[i].end = time;
		target.seekTo(time);
		customLines = [...customLines];
	}

	function setStart(i: number, time: number, seek = true) {
		const end = customLines[i].end;
		const prevEnd = customLines[i - 1]?.end ?? null;
		if (time < 0) return;
		if (i > 0 && prevEnd !== null && time < prevEnd) {
			setEnd(i - 1, time, false);
		} else if (end !== null && time > end - 0.1) {
			time = end - 0.1;
		}
		customLines[i].start = time;
		target.seekTo(time);
		customLines = [...customLines];
	}

	const toTime = (time: number | null) =>
		time === null ? '' : `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`;

	const fromTime = (time: string) => {
		let [hours, minutes, seconds] = time.split(':').map((x) => parseFloat(x));
		return hours * 3600 + minutes * 60 + seconds;
	};

	function downloadSRT(save = false) {
		// sanity check: set all endings to before the next start
		for (let i = 0; i < customLines.length - 1; i++) {
			const nextStart = customLines[i + 1]?.start ?? null;
			if (nextStart !== null) {
				let end = customLines[i].end;
				if (end !== null && end > nextStart) {
					customLines[i].end = nextStart;
				}
			}
		}

		const vid = $video;
		if (!save && vid) {
			const timings: [number, number, string][] = customLines.map((x) => [
				x.start || 0,
				x.end || 0,
				x.text
			]);
			// save to draft
			editor.update((draft) => {
				if (!draft) return draft;
				// check in episodes
				const index = draft.episodes.findIndex((x) => x.id === vid.id);
				if (index !== -1) {
					// update episode
					const episode = draft.episodes[index];
					episode.timings = timings;
				} else {
					// add episode
					draft.episodes.push({
						id: vid.id,
						name: vid.name,
						label: vid.label,
						timings
					});
				}
				// sort episodes
				if ('context' in $video && $video.context.sources.length > 0) {
					draft.episodes.sort(
						(a, b) =>
							$video.context.sources[0].episodes.findIndex((x) => x.id === a.id) -
							$video.context.sources[0].episodes.findIndex((x) => x.id === b.id)
					);
				}
				return draft;
			});
			video.set(null);
		} else {
			// create srt
			const toSrtTime = (time: number) => {
				let hours = Math.floor(time / 3600)
					.toString()
					.padStart(2, '0');
				let minutes = (Math.floor(time / 60) % 60).toString().padStart(2, '0');
				let seconds = (Math.floor(time) % 60).toString().padStart(2, '0');
				let milliseconds = Math.floor((time % 1) * 1000);
				return `${hours}:${minutes}:${seconds},${milliseconds}`;
			};
			let srt = '';
			for (let i = 0; i < customLines.length; i++) {
				srt += `${i + 1}\n`;
				const start = customLines[i].start;
				const end = customLines[i].end;
				if (start === null || end === null) {
					srt += '00:00:00,000 --> 00:00:00,000\n';
				} else {
					srt += `${toSrtTime(start)} --> ${toSrtTime(end)}\n`;
				}
				srt += customLines[i].text + '\n\n';
			}
			// download
			let blob = new Blob([srt], { type: 'text/plain' });
			let url = URL.createObjectURL(blob);
			let a = document.createElement('a');
			a.href = url;
			a.download = target.playerInfo.videoData.video_id + '.srt';
			a.click();
			URL.revokeObjectURL(url);
		}
	}

	let currentTime = 0;
	let interval;

	function keyboardShortcuts(e: KeyboardEvent) {
		if ((e.target as Element).tagName === 'INPUT' || (e.target as Element).tagName === 'TEXTAREA')
			return;
		if (e.key === 'ArrowLeft') {
			target.seekTo(currentTime - 5);
		} else if (e.key === 'ArrowRight') {
			target.seekTo(currentTime + 5);
		}
	}

	onMount(() => {
		setInterval(() => (currentTime = target?.getCurrentTime()), 100);
		document.body.addEventListener('keydown', keyboardShortcuts);
	});

	onDestroy(() => {
		clearInterval(interval);
		document.body.removeEventListener('keydown', keyboardShortcuts);
	});

	const getTime = () => {
		const time = target.getCurrentTime();
		if (time < 0) {
			// YouTube can sometimes return -1 for time >:(
			return null;
		} else {
			return time;
		}
	};

	$: lenStarts = customLines.filter((x) => x.start !== null).length;
	$: lenEnds = customLines.filter((x) => x.end !== null).length;

	function seekToLatestEnd() {
		const index = customLines.findIndex((x) => x.end === null);
		if (step === 'end' && index !== -1) {
			target.seekTo(customLines[index].start);
			target.playVideo();
		}
	}

	function lengthWarning(duration: number, text: string) {
		const rate = (150 / 60) * 4.7 * duration;
		const ratio = (text.length / rate) * (text.length < 10 ? 1.5 : 1);
		if (ratio < 0.2) {
			return 'verylong';
		} else if (ratio < 0.4) {
			return 'long';
		} else {
			return '';
		}
	}

	function addLineBelow(i: number) {
		if (customLines[i].start === null || customLines[i].end === null) {
			return;
		}
		const oldEnd = customLines[i].end;
		const prevDuration = customLines[i].end - customLines[i].start;
		customLines[i].end = prevDuration / 2 + customLines[i].start;
		customLines.splice(i + 1, 0, {
			text: '',
			start: customLines[i].end,
			end: oldEnd
		});
		customLines = [...customLines];
	}

	// Only refresh if ends is updated, i.e. the user has inputted an end
	$: if (step === 'end' && lenEnds >= 0) {
		seekToLatestEnd();
	}
</script>

<div class="captionEditor" transition:fly|global={{ y: 200, duration: 100 }}>
	<header>
		<h2>
			{#if step === 'text'}
				Write your lines
			{/if}
			{#if step === 'start'}
				Choose start positions ({lenStarts}/{customLines.length})
			{/if}
			{#if step === 'end'}
				Choose end positions ({lenEnds}/{customLines.length})
			{/if}
			{#if step === 'review'}
				Review your captions
			{/if}
		</h2>
	</header>
	<main>
		{#if step === 'text'}
			{#if lenStarts > 0 || lenEnds > 0}
				<span>⚠️ Making changes here will reset all of your timings.</span>
			{/if}
			<textarea
				value={customLines.map((x) => x.text.replace('\n', '\\n')).join('\n')}
				on:change={(e) => updateText(e.target.value)}
				placeholder={'Mystery of the Police Car Robot!\nI was so close...'}
			/>
			<button on:click={loadFromSubtitles}> Load from default subtitles </button>
			<div class="btnrow">
				<button on:click={close}> Close </button>
				<button class="primary" on:click={() => (step = 'start')}>Next</button>
			</div>
		{/if}
		{#if step === 'start'}
			{#if customLines.length > lenStarts}
				<div class="line">
					<textarea bind:value={customLines[lenStarts].text} />
					<button class="primary" on:click={() => (customLines[lenStarts].start = getTime())}>
						Now
					</button>
				</div>
			{/if}
			<div class="lines">
				<span class="reversed">
					{#each customLines.slice(0, lenStarts) as line, i}
						{@const nextStart = i + 1 < customLines.length ? customLines[i + 1].start : null}
						<div
							class="line"
							class:active={line.start &&
								line.start < currentTime &&
								(nextStart !== null ? nextStart > currentTime : true)}
						>
							<textarea bind:value={line.text} />
							<button
								on:click={() => {
									customLines[i].start = getTime();
									customLines = [...customLines];
								}}>{toTime(line.start)}</button
							>
						</div>
					{/each}
				</span>
			</div>
			<div class="btnrow">
				<button on:click={() => (step = 'text')}>Back</button>
				<button
					class="primary"
					on:click={() => (step = 'end')}
					disabled={lenStarts < customLines.length}>Next</button
				>
			</div>
		{/if}
		{#if step === 'end'}
			{#if customLines.length > lenEnds}
				<div class="line">
					<button
						class="outline"
						style="padding: 10px 5px"
						on:click={() => target.seekTo(customLines[lenEnds].start)}
						>{toTime(customLines[lenEnds].start)}</button
					>
					<textarea bind:value={customLines[lenEnds].text} />
					<button class="primary" on:click={() => setEnd(lenEnds, getTime())}>Now</button>
					{#if lenEnds < lenStarts - 1}
						<button
							class="primary toNext"
							on:click={() => (customLines[lenEnds].end = customLines[lenEnds + 1].start)}
							>➡️</button
						>
					{/if}
				</div>
			{/if}
			<div class="lines">
				<span class="reversed">
					{#each customLines.slice(0, lenEnds) as line, i}
						{@const start = line.start}
						{@const end = line.end}
						<div
							class="line"
							class:active={currentTime > (line.start ?? 0) && currentTime < (line.end ?? Infinity)}
						>
							{#if start !== null}
								<div class="timeLayout">
									<button class="outline" on:click={() => target.seekTo(start)}
										>{toTime(start)}</button
									>
									<div class="btnrow">
										<button class="backTime" on:click={() => setStart(i, start - 0.1)}>-.1s</button>
										<button class="fwdTime" on:click={() => setStart(i, start + 0.1)}>+.1s</button>
									</div>
								</div>
							{/if}
							<textarea bind:value={line.text} />
							{#if end !== null}
								<div class="timeLayout">
									<button
										class={'setEnd ' +
											lengthWarning((line.end ?? 0) - (line.start ?? 0), line.text)}
										style="border-radius: 5px 0 0 0"
										on:click={() => setEnd(i, getTime())}>{toTime(line.end)}</button
									>
									<div class="btnrow">
										<button class="backTime" on:click={() => setEnd(i, end - 0.1)}>-.1s</button>
										<button
											class="fwdTime"
											style="border-radius: 0px"
											on:click={() => setEnd(i, end + 0.1)}>+.1s</button
										>
									</div>
								</div>
								{#if i < lenStarts - 1}
									<button
										disabled={line.end === customLines[i + 1].start}
										class="primary toNext"
										on:click={() => {
											customLines[i].end = customLines[i + 1].start;
											customLines = [...customLines];
										}}
									>
										➡️
									</button>
								{/if}
							{/if}
						</div>
					{/each}
				</span>
			</div>
			<div class="btnrow">
				<button on:click={() => (step = 'start')}>Back</button>
				<button
					class="primary"
					on:click={() => (step = 'review')}
					disabled={lenEnds < customLines.length}>Next</button
				>
			</div>
		{/if}
		{#if step === 'review'}
			<div class="lines">
				<span class="reversed">
					{#each customLines as line, i}
						{@const start = line.start}
						{@const end = line.end}
						<div
							class="line addAbove"
							class:active={start !== null &&
								currentTime > start &&
								end !== null &&
								currentTime < end}
						>
							{#if start !== null}
								<div class="timeLayout">
									<button class="outline" on:click={() => target.seekTo(start)}
										>{toTime(start)}</button
									>
									<div class="btnrow">
										<button class="backTime" on:click={() => setStart(i, start - 0.1)}>-.1s</button>
										<button class="fwdTime" on:click={() => setStart(i, start + 0.1)}>+.1s</button>
									</div>
								</div>
							{/if}
							<textarea bind:value={line.text} />
							{#if end !== null}
								<div class="timeLayout">
									<button class="outline" on:click={() => target.seekTo(end)}>{toTime(end)}</button>
									<div class="btnrow">
										<button class="backTime" on:click={() => setEnd(i, end - 0.1)}>-.1s</button>
										<button class="fwdTime" on:click={() => setEnd(i, end + 0.1)}>+.1s</button>
									</div>
								</div>
							{/if}
							{#if i < lenStarts - 1}
								<button
									disabled={line.end === customLines[i + 1].start}
									class="primary toNext"
									on:click={() => {
										customLines[i].end = customLines[i + 1].start;
										customLines = [...customLines];
									}}
								>
									➡️
								</button>
							{/if}
							<button class="addAbove" on:click={() => addLineBelow(i)}>+ Add line</button>
						</div>
					{/each}
				</span>
			</div>
			<div class="btnrow">
				<button on:click={() => (step = 'end')}>Back</button>
				<button class="primary" on:click={() => downloadSRT()}>Done</button>
				<button class="primary" style="width: 100px; padding: 0" on:click={() => downloadSRT(true)}
					>📥</button
				>
			</div>
		{/if}
	</main>
</div>

<style>
	.captionEditor {
		position: fixed;
		right: 10px;
		top: 10px;
		border-radius: 10px 10px 0 0;
		z-index: 9;
		height: calc(100% - 20px);
		overflow: auto;
		width: 400px;
		background-color: #111;
		display: flex;
		flex-direction: column;
	}
	header {
		height: 75px;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 10px;
	}
	header h2 {
		flex-grow: 1;
	}
	main {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 10px;
		padding-bottom: 10px;
		height: calc(100% - 85px);
		flex-grow: 1;
	}
	main textarea {
		height: 100%;
		line-height: 1.25em;
	}
	.line {
		display: flex;
		padding: 5px;
		border: 1px solid #333;
		background-color: #222;
		border-radius: 5px;
		align-items: center;
		margin-bottom: 5px;
		height: 60px;
		overflow: hidden;
	}
	.line.active {
		background-color: #444;
		border-color: #aaa;
		position: sticky;
		top: 0;
		bottom: 0;
	}
	.line textarea {
		flex-grow: 1;
		flex-shrink: 1;
		width: calc(100% - 10px);
		height: calc(100% - 10px);
		text-align: left;
		margin: 0 5px;
		background-color: #333;
		padding: 5px;
		border-radius: 5px;
		border: none;
		resize: none;
		outline: none;
	}
	.line button {
		padding: 10px 5px;
		height: 100%;
	}
	.line button.setEnd {
		border-radius: 5px 0 0 5px;
	}
	.line.addAbove {
		margin-bottom: 16px;
		position: relative;
		overflow: unset;
		border-radius: 0 0 5px 5px;
	}
	.line.addAbove button.addAbove {
		position: absolute;
		bottom: 100%;
		left: -1px;
		width: calc(100% + 2px);
		height: 16px;
		font-size: 10px;
		padding: 0;
		border-radius: 5px 5px 0 0;
		z-index: 1;
	}
	.lines {
		border-top: 1px solid #333;
		overflow: auto;
		height: 100%;
	}
	.lines .reversed {
		display: flex;
		flex-direction: column-reverse;
		gap: 5px;
	}
	.toNext {
		padding: 10px 5px;
		border-radius: 0 5px 5px 0;
		height: 100%;
	}
	.timeLayout {
		display: flex;
		flex-direction: column;
		gap: 0px;
		background-color: #1a1a1a;
		border-radius: 10px;
	}
	.timeLayout .outline {
		padding: 5px 2px;
		border-radius: 10px 10px 0 0;
	}
	.timeLayout button {
		padding: 5px 2px;
		margin: 0;
	}
	.timeLayout .btnrow {
		display: flex;
		gap: 0px;
		justify-content: flex-end;
		border-radius: 10px;
	}
	.timeLayout .btnrow button {
		width: 100%;
		border-radius: 0;
	}
	.timeLayout .btnrow button:first-child {
		border-radius: 0 0 0 10px;
	}
	.timeLayout .btnrow button:last-child {
		border-radius: 0 0 10px 0;
	}
	.addLineBtn {
		margin-bottom: 5px;
		height: 20px;
		padding: 0;
	}
	@media screen and (max-width: 900px) {
		.captionEditor {
			position: absolute;
			top: calc(100vw / calc(16 / 9));
			left: 0;
			width: 100%;
			height: auto;
			bottom: 0;
			margin: 0;
			border-radius: 10px 10px 0 0;
		}
	}
	:global(button.long) {
		border-color: red;
		color: white;
	}
	:global(button.verylong) {
		border-color: darkred;
		color: white;
	}
	@media (prefers-color-scheme: light) {
		.captionEditor {
			background-color: #ddd;
		}
		.line {
			background-color: #eee;
			border-color: #aaa;
		}
		.line.active {
			background-color: #ccc;
			border-color: #222;
		}
		.line textarea {
			background-color: #fff;
		}
		.lines {
			background-color: #eee;
		}
		.timeLayout {
			background-color: #ccc;
		}
		.line button {
			background-color: #ccc;
		}
		button:disabled {
			opacity: 0.2;
		}

		:global(button.long) {
			border-color: red;
			color: black;
		}
		:global(button.verylong) {
			border-color: darkred;
			color: black;
		}
	}
</style>
