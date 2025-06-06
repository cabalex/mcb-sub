<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import unknown from './unknown.png';
	let timerElem: HTMLDivElement | null = null;
	let dayElem: HTMLHeadingElement | null = null;
	let hourElem: HTMLHeadingElement | null = null;
	let minElem: HTMLHeadingElement | null = null;
	let secElem: HTMLHeadingElement | null = null;

	export let finalDate = new Date('2025-06-13T10:00:00Z');
	let past = false;
	let episodeId: string | null = null;

	function updateTimer() {
		if (!timerElem) return;

		const now = new Date();
		const distance = finalDate.getTime() - now.getTime();

		if (distance < 0) {
			// don't fetch twice
			clearInterval(fetchInterval);
			checkEpisode(true).then((found) => {
				if (!found && distance < -10) {
					past = true;
				}
			});

			return;
		}

		let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
		let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
		let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();

		if (days.length < 2) days = '0' + days;
		if (hours.length < 2) hours = '0' + hours;
		if (minutes.length < 2) minutes = '0' + minutes;
		if (seconds.length < 2) seconds = '0' + seconds;

		days = '<span>' + days + '</span>';
		hours = '<span>' + hours + '</span>';
		minutes = '<span>' + minutes + '</span>';
		seconds = '<span>' + seconds + '</span>';

		if (dayElem && dayElem.innerHTML !== days) dayElem.innerHTML = days;
		if (hourElem && hourElem.innerHTML !== hours) hourElem.innerHTML = hours;
		if (minElem && minElem.innerHTML !== minutes) minElem.innerHTML = minutes;
		if (secElem && secElem.innerHTML !== seconds) secElem.innerHTML = seconds;
	}

	async function checkEpisode(late = false) {
		if (episodeId) {
			if (late) {
				location.search = `?v=${episodeId}&s=/fansub`;
				return true;
			} else {
				return false;
			}
		}
		const resp = await fetch('./finalEpisode.txt', { cache: 'no-cache' });
		if (!resp.ok) return;
		const text = await resp.text();
		const episode = text.trim();
		if (episode && late) {
			location.search = `?v=${episode}&s=/fansub`;
			return true;
		} else if (episode) {
			episodeId = episode;
			console.log('Found episode, but not late');
		}
		return false;
	}

	let interval: number;
	let fetchInterval: number;
	onMount(() => {
		interval = setInterval(updateTimer, 1000);
		fetchInterval = setInterval(checkEpisode, 10000);
		updateTimer();
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
		if (fetchInterval) clearInterval(fetchInterval);
	});
</script>

<div class="finalCountdown" in:fade|local={{ duration: 200 }}>
	<h2>The final showdown begins...</h2>
	<div class="timer" bind:this={timerElem}>
		<div>
			<h1 bind:this={dayElem}>00</h1>
			<span>DAYS</span>
		</div>
		<div>
			<h1 bind:this={hourElem}>00</h1>
			<span>HOURS</span>
		</div>
		<div>
			<h1 bind:this={minElem}>00</h1>
			<span>MINUTES</span>
		</div>
		<div>
			<h1 bind:this={secElem}>00</h1>
			<span>SECONDS</span>
		</div>
	</div>
	{#if past}
		<div class="past" transition:slide={{ duration: 200 }}>
			<img width="48px" src={unknown} alt="Unknown" />
			<div>
				<h2>Well, that's anticlimactic...</h2>
				<p>This page will refresh automagically once the subtitles are out.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.finalCountdown {
		position: absolute;
		left: 50%;
		top: 50%;
		display: flex;
		max-width: 100vw;
		overflow: hidden;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		transform: translate(-50%, -50%);
		text-align: center;
		color: white;
		background-color: black;
		padding: 20px;
		border-radius: 1cqw;
	}
	.past {
		display: flex;
		gap: 10px;
		align-items: center;
		padding-top: 10px;
	}
	.past h2,
	.past p {
		text-align: left;
		margin: 0;
	}
	.finalCountdown > h2 {
		margin-top: 0;
	}
	.finalCountdown .timer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1vw;
		font-family: monospace;
	}
	.finalCountdown .timer > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		border-radius: 10px;
		color: white;
		font-size: 2em;
		min-width: 80px;
		background-color: var(--bg-color, #111);
	}
	.finalCountdown .timer h1 {
		margin: 0;
	}
	:global(.finalCountdown .timer > div > h1 > *) {
		animation:
			0.5s ease-in-out forwards fxFlair,
			fadeIn 0.2s ease-in-out forwards;
	}
	.finalCountdown .timer > div:nth-child(1) {
		--bg-color: var(--blueCop);
	}
	.finalCountdown .timer > div:nth-child(2) {
		--bg-color: var(--cielo);
	}
	.finalCountdown .timer > div:nth-child(3) {
		--bg-color: var(--mukara);
	}
	.finalCountdown .timer > div:nth-child(4) {
		--bg-color: var(--redBlitz);
	}
	@keyframes fxFlair {
		0% {
			background-position: 0% 0%;
		}
		100% {
			background-position: 200% 50%;
		}
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.finalCountdown .timer span {
		font-size: 1em;
	}

	@media screen and (max-width: 1000px) {
		.finalCountdown .timer > div {
			font-size: 1.25em;
		}
		.finalCountdown h2 {
			margin: 0px;
		}
	}
	@media screen and (max-width: 900px) {
		h1 {
			display: unset !important;
		}
		.finalCountdown {
			padding: 1vw;
			border-radius: 2vw;
		}
		.finalCountdown h2 {
			font-size: 4vw;
			margin-bottom: 1vw;
		}
		.finalCountdown .timer > div {
			font-size: 4vw;
			padding: 0.5vw;
		}
	}
</style>
