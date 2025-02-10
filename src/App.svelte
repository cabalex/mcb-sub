<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import Playlist from './Playlist/Playlist.svelte';
	import Video from './Video/Video.svelte';
	import subtitles, { type Episode, type Source } from './subtitles';
	import { onMount } from 'svelte';
	import { importFromFile, saveCustomSub, type CustomDraft, type CustomEpisode } from './editor';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let currentVideo: Writable<Episode | null> = writable(null);
	let currentSub: Writable<Source | CustomDraft | null> = writable(null);
	let editor: Writable<CustomDraft | null> = writable(null);

	function setMediaDetails(video: Episode | CustomEpisode) {
		const pageTitle = `${video.name} - Metal Cardbot SUB`;
		const description =
			'context' in video
				? `Watch ${video.context.title}: ${video.name} with English subtitles`
				: `Watch ${video.name} with subtitles`;
		document.title = pageTitle;
		document.querySelector("meta[property='og:title']")?.setAttribute('content', pageTitle);
		document.querySelector("meta[property='og:description']")?.setAttribute('content', description);
		document
			.querySelector("meta[property='og:image']")
			?.setAttribute('content', `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);
	}

	function resetMediaDetails() {
		document.title = 'Metal Cardbot SUB';
		document
			.querySelector("meta[property='og:title']")
			?.setAttribute('content', 'Metal Cardbot SUB');
		document
			.querySelector("meta[property='og:description']")
			?.setAttribute('content', 'Watch Metal Cardbot with English subtitles');
		document
			.querySelector("meta[property='og:image']")
			?.setAttribute('content', 'https://i.ytimg.com/vi/1Q3m1V59Lfg/maxresdefault.jpg');
	}

	let urlParams = new URLSearchParams(window.location.search);
	let videoId = urlParams.get('v');
	let subId = urlParams.get('s');
	if (videoId) {
		// find video
		for (let season of subtitles) {
			if (season.sources.length === 0) continue;
			for (let episode of season.episodes) {
				if (episode.id === videoId) {
					const sub = season.sources.find((x) => x.path === subId) || season.sources[0];
					currentVideo.set(episode);
					currentSub.set(sub);
					setMediaDetails(episode);
					break;
				}
			}
		}
	}

	if (localStorage.getItem('mcb-draft')) {
		editor.set(JSON.parse(localStorage.getItem('mcb-draft') || 'null'));
	}

	let isGoingBack = false;
	onMount(() => {
		currentVideo.subscribe((value) => {
			if (!isGoingBack && value !== null && $currentSub !== null) {
				const query = `?v=${value.id}&s=${'path' in $currentSub ? $currentSub.path : '/custom'}`;
				if (location.search === query) {
					window.history.replaceState({ video: value, sub: $currentSub }, '', query);
				} else {
					window.history.pushState({ video: value, sub: $currentSub }, '', query);
				}
				setMediaDetails(value);
			}
		});
		currentSub.subscribe((value) => {
			if (!isGoingBack && value !== null && $currentVideo !== null) {
				const query = `?v=${$currentVideo.id}&s=${'path' in value ? value.path : '/custom'}`;
				if (location.search === query) {
					window.history.replaceState({ video: $currentVideo, sub: value }, '', query);
				} else {
					window.history.pushState({ video: $currentVideo, sub: value }, '', query);
				}
				setMediaDetails($currentVideo);
			}
		});
	});

	window.addEventListener('popstate', (state) => {
		const poppedState = state.state;

		isGoingBack = true;
		if (poppedState) {
			if (poppedState.video) {
				currentVideo.set(poppedState.video);
			} else {
				resetMediaDetails();
				currentVideo.set(null);
			}
			if (poppedState.sub) {
				currentSub.set(poppedState.sub);
			} else {
				resetMediaDetails();
				currentSub.set(null);
			}
		} else {
			currentVideo.set(null);
			currentSub.set(null);
			window.history.replaceState(null, '', './');
			resetMediaDetails();
		}
		isGoingBack = false;
	});

	window.addEventListener('beforeunload', (event) => {
		if ($editor) {
			localStorage.setItem('mcb-draft', JSON.stringify($editor));
			event.preventDefault();
			return true;
		} else {
			localStorage.removeItem('mcb-draft');
		}
	});

	// Expose editor to global scope (for scripting)
	// @ts-ignore
	window.getEditor = () => $editor;
	// @ts-ignore
	window.setEditor = (data: CustomDraft) => editor.set(data);

	let isDraggingOver = false;
	let dragError: null | string = null;
	let draggedOverCard: null | string = null;
	let lastTarget: null | EventTarget = null;
	window.addEventListener('dragenter', (e) => {
		lastTarget = e.target;
		isDraggingOver = true;
	});
	window.addEventListener('dragleave', (e) => {
		if (e.target === lastTarget || e.target === document) {
			isDraggingOver = false;
		}
	});

	async function drop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files.length) {
			const url = URL.createObjectURL(e.dataTransfer.files[0]);
			try {
				const sub = await importFromFile(e.dataTransfer.files[0]);
				if (sub) {
					saveCustomSub(sub);
					draggedOverCard = url;
					setTimeout(() => {
						editor.set(null);
						currentSub.set(sub);
					}, 500);
					setTimeout(() => {
						draggedOverCard = null;
						URL.revokeObjectURL(url);
						isDraggingOver = false;
					}, 1000);
				} else {
					dragError = 'Invalid Sub Card';
					console.log(e);
					URL.revokeObjectURL(url);
					setTimeout(() => {
						dragError = null;
						isDraggingOver = false;
					}, 1000);
				}
			} catch (e) {
				dragError = 'Invalid Sub Card';
				console.log(e);
				URL.revokeObjectURL(url);
				setTimeout(() => {
					dragError = null;
					isDraggingOver = false;
				}, 1000);
			}
		} else if (e.dataTransfer?.getData('URL')) {
			// Can't do this due to CORS issues
			dragError = 'Download the Card first';
			setTimeout(() => {
				dragError = null;
				isDraggingOver = false;
			}, 1000);
		} else {
			isDraggingOver = false;
		}
	}

	async function openFilePicker() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.png';
		isDraggingOver = true;
		input.onchange = async (e) => {
			if (input.files?.length) {
				const url = URL.createObjectURL(input.files[0]);
				try {
					const sub = await importFromFile(input.files[0]);
					if (sub) {
						saveCustomSub(sub);
						draggedOverCard = url;
						setTimeout(() => {
							editor.set(null);
							currentSub.set(sub);
						}, 500);
						setTimeout(() => {
							draggedOverCard = null;
							URL.revokeObjectURL(url);
							isDraggingOver = false;
						}, 1000);
					} else {
						dragError = 'Invalid Sub Card';
						console.log(e);
						URL.revokeObjectURL(url);
						setTimeout(() => {
							dragError = null;
							isDraggingOver = false;
						}, 1000);
					}
				} catch (e) {
					dragError = 'Invalid Sub Card';
					console.log(e);
					URL.revokeObjectURL(url);
					setTimeout(() => {
						dragError = null;
						isDraggingOver = false;
					}, 1000);
				}
			} else {
				isDraggingOver = false;
			}
		};
		input.oncancel = () => {
			isDraggingOver = false;
		};
		input.click();
	}
</script>

<main>
	<Video video={currentVideo} source={currentSub} {editor} />
	<Playlist on:importCard={openFilePicker} video={currentVideo} source={currentSub} {editor} />
</main>
{#if isDraggingOver}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="dropper"
		class:success={draggedOverCard}
		on:drop={drop}
		on:dragover={(e) => e.preventDefault()}
		transition:fade={{ duration: 100 }}
	>
		<img src={draggedOverCard || './metalcard.svg'} alt="Metal Card" />
		<svg
			width="1152"
			height="554"
			viewBox="0 0 1152 554"
			fill="none"
			in:fly|global={{ duration: 200, y: 100, easing: cubicOut }}
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<radialGradient id="active">
					<stop offset="60%" stop-color="#97ffd1" />
					<stop offset="100%" stop-color="#0D7610" />
				</radialGradient>
			</defs>
			<rect x="327" y="54" width="497" height="89" fill="#D9D9D9" />
			<rect x="144" y="197" width="864" height="861" fill="#1FAFD9" />
			<rect x="193" y="143" width="766" height="62" fill="#1FAFD9" />
			<circle cx="576" cy="595.5" r="432" fill="#47403D" />
			<path d="M193.5 143L243 197L193.5 251L144 197L193.5 143Z" fill="#1FAFD9" />
			<path d="M958.5 143L1008 197L958.5 251L909 197L958.5 143Z" fill="#1FAFD9" />
			<path d="M284.077 0L233 143H330V0H284.077Z" fill="#D9D9D9" />
			<path d="M866.923 0L918 143H821V0H866.923Z" fill="#D9D9D9" />
			<path
				d="M544.974 590.763C549.507 592.294 549.507 598.706 544.974 600.237L146.35 734.866C143.109 735.961 139.75 733.55 139.75 730.129L139.75 460.871C139.75 457.45 143.109 455.039 146.35 456.134L544.974 590.763Z"
				fill="#F7D859"
			/>
			<path
				d="M607.026 600.237C602.493 598.706 602.493 592.294 607.026 590.763L1005.65 456.134C1008.89 455.039 1012.25 457.45 1012.25 460.871L1012.25 730.129C1012.25 733.55 1008.89 735.961 1005.65 734.866L607.026 600.237Z"
				fill="#F7D859"
			/>
			<path
				d="M362 221L502.5 372.5H650L790.5 220.5C739.053 192.034 708.139 180.853 650 168.5L620 90H530.5L502.5 165C439.511 178.176 407.853 189.486 362 221Z"
				fill="#E50323"
			/>
			<path
				d="M790.5 970.499L650 818.999L502.5 818.999L362 970.999C413.447 999.465 444.361 1010.65 502.5 1023L532.5 1057.5L622 1057.5L650 1026.5C712.989 1013.32 744.647 1002.01 790.5 970.499Z"
				fill="#E50323"
			/>
			<circle cx="576" cy="595.5" r="279" fill="#F7D859" />
			<circle cx="576" cy="595.5" r="197" class="circle" fill="#0D7610" />
			<path
				d="M358.514 318.31L293.607 383.217L204 335.104L310.103 229L358.514 318.31Z"
				fill="#D9D9D9"
			/>
			<path
				d="M859.492 383.713L794.585 318.806L842.699 229.199L948.803 335.303L859.492 383.713Z"
				fill="#D9D9D9"
			/>
			<path
				d="M794.289 876.853L859.196 811.946L948.803 860.06L842.699 966.163L794.289 876.853Z"
				fill="#D9D9D9"
			/>
			<path
				d="M293.31 811.45L358.217 876.357L310.103 965.964L204 859.86L293.31 811.45Z"
				fill="#D9D9D9"
			/>
		</svg>
		<div class="band" in:fly|global={{ duration: 200, y: 100, easing: cubicOut }} />

		<span class:error={dragError}>{dragError ?? 'Insert a Sub Card'}</span>
	</div>
{/if}

<style>
	main {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		height: calc(100% - 20px);
		width: calc(100% - 20px);
		padding: 10px;
	}
	.dropper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background-color: rgba(0, 0, 0, 0.5);
	}
	.dropper span {
		color: white;
		font-size: 2rem;
		margin-top: 20px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: opacity 0.5s;
		z-index: 1;
	}
	.dropper span.error {
		color: red;
		animation: shake 0.5s;
	}
	@keyframes shake {
		0% {
			transform: translate(calc(-50% - 10px), -50%);
		}
		10% {
			transform: translate(calc(-50% + 10px), -50%);
		}
		20% {
			transform: translate(calc(-50% - 10px), -50%);
		}
		30% {
			transform: translate(calc(-50% + 8px), -50%);
		}
		40% {
			transform: translate(calc(-50% - 8px), -50%);
		}
		50% {
			transform: translate(calc(-50% + 4px), -50%);
		}
		60% {
			transform: translate(calc(-50% - 4px), -50%);
		}
		70% {
			transform: translate(calc(-50% + 4px), -50%);
		}
		80% {
			transform: translate(calc(-50% - 2px), -50%);
		}
		90% {
			transform: translate(calc(-50% + 2px), -50%);
		}
		100% {
			transform: translate(-50%, -50%);
		}
	}
	.dropper.success span {
		z-index: 0;
		opacity: 0;
	}
	.dropper img {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-height: 50%;
		max-width: 50%;
		z-index: 1;
	}
	.dropper.success img {
		animation: slideIn 1s forwards cubic-bezier(0.165, 0.84, 0.44, 1);
	}

	@keyframes slideIn {
		0% {
			top: 50%;
			transform: translateY(-50%) translateX(-50%) scale(0) rotate(-30deg);
		}
		50% {
			top: 50%;
			transform: translateY(-50%) translateX(-50%);
		}
		to {
			top: 100%;
			transform: translateY(-50%) translateX(-50%) scale(0.9);
		}
	}

	.dropper svg {
		position: absolute;
		height: 200px;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
	}
	.dropper .band {
		display: block;
		position: absolute;
		bottom: 0;
		left: 0;
		height: 100px;
		width: 100%;
		background: #333;
		z-index: -1;
	}
	.dropper.success svg .circle {
		fill: url(#active) !important;
		animation: activate 0.5s forwards;
	}
	@keyframes activate {
		from {
			fill: green;
		}
		to {
			fill: url(#active) !important;
		}
	}
	@media screen and (max-width: 900px) {
		main {
			background: black;
			flex-direction: column;
			padding: 0;
			gap: 0;
			height: 100%;
			width: 100%;
		}
	}
</style>
