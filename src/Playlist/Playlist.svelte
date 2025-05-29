<script lang="ts">
	import { type Writable } from 'svelte/store';
	import playlists, { type Episode, type Source, type Season } from '../subtitles.js';
	import ChevronDown from '../assets/chevron-down.svg';
	import unknownSeason from '../assets/unknown.png';
	import { slide } from 'svelte/transition';
	import {
		deleteCustomSub,
		getCustomSubs,
		importFromFile,
		saveCustomSub,
		type CustomDraft,
		type CustomEpisode
	} from '../editor';
	import EditorModal from './EditorModal.svelte';
	import { createEventDispatcher } from 'svelte';

	export let video: Writable<Episode | CustomEpisode | null>;
	export let source: Writable<Source | CustomDraft | null>;
	export let editor: Writable<CustomDraft | null>;

	$: {
		if ($source === null && playlists[playlistIndex].sources.length > 0) {
			source.set(playlists[playlistIndex].sources[0]);
		} else if ($source && 'title' in $source) {
			playlistIndex = Math.max(
				0,
				playlists.findIndex((playlist) => playlist.title === $source.title)
			);
		}
	}

	function playVideo(v: Episode | CustomEpisode) {
		if (
			!$source ||
			('context' in v &&
				'path' in $source &&
				!v.context.sources.map((x) => x.path).includes($source.path))
		) {
			if ('context' in v) {
				source.set(v.context.sources[0]);
			} else {
				return;
			}
		}
		video.set(v);
		// @ts-ignore
		gtag('event', 'play', {
			event_category: 'video',
			event_label: v.name,
			source:
				$source && 'path' in $source ? `${$source.name} (${$source.language})` : 'Custom subtitle',
			playlist: playlists[playlistIndex].title,
			value: v.id
		});
	}

	function changeSeason(playlist: Season) {
		seasonDropdownOpen = false;
		playlistIndex = playlists.indexOf(playlist);
		if (playlists[playlistIndex].sources.length > 0) {
			source.set(playlists[playlistIndex].sources[0]);
		}
	}

	function changeSource(s: Source | CustomDraft) {
		sourceDropdownOpen = false;
		source.set(s);
	}

	function openEditor(s?: CustomDraft) {
		sourceDropdownOpen = false;
		video.set(null);
		source.set(null);
		history.pushState({}, '', './');
		if (s) {
			editor.set(s);
		} else {
			editor.set({
				version: 1,
				title: playlists[playlistIndex].title,
				subtitle: playlists[playlistIndex].subtitle,
				icon: playlists[playlistIndex].icon,
				incomplete: false,
				source: {
					path: '/' + Math.random().toString(36).slice(2),
					language: 'en',
					name: 'Custom Sub',
					credits: []
				},
				episodes: []
			});
		}
	}

	$: {
		if ($editor === null) {
			editorModalOpen = false;
		}
	}

	async function saveEditor() {
		if (!$editor) return;
		saveCustomSub($editor);
		//const url = await exportAsURL($editor);
		//window.history.replaceState({}, '', url);
		editor.set(null);
		sourceDropdownOpen = false;
	}

	async function deleteEditor() {
		if (
			!$editor ||
			!confirm('Are you sure you want to leave the sub editor? Any unsaved changes will be lost!')
		)
			return;
		window.history.replaceState({}, '', './');
		//deleteCustomSub($editor);
		editor.set(null);
		source.set(null);
		sourceDropdownOpen = false;
		localStorage.removeItem('mcb-draft');
	}

	function removeSub() {
		if (
			!$source ||
			!confirm(
				"Are you sure you want to remove this sub? You can't get it back unless you have the Sub Card!"
			)
		)
			return;
		deleteCustomSub($source);
		source.set(null);
	}

	const dispatch = createEventDispatcher();

	let playlistIndex = 0;
	if ($video !== null && !playlists[playlistIndex].episodes.includes($video)) {
		// get the correct season
		playlistIndex = playlists.findIndex((playlist) => playlist.episodes.includes($video));
	}
	let seasonDropdownOpen = false;
	let sourceDropdownOpen = false;
	let editorModalOpen = false;
</script>

<div class="playlist" class:custom={'source' in $source}>
	<button
		class="header"
		on:click={() => (seasonDropdownOpen = !seasonDropdownOpen)}
		disabled={$editor !== null}
	>
		{#key playlistIndex}
			<img
				class="poster"
				alt={playlists[playlistIndex].title}
				src={playlists[playlistIndex].icon}
			/>
		{/key}
		<div class="text">
			<h2>{playlists[playlistIndex].title}</h2>
			<p>{playlists[playlistIndex].subtitle}</p>
		</div>
		{#if !$editor}
			<img
				style={`transform: rotate(${seasonDropdownOpen ? -180 : 0}deg)`}
				src={ChevronDown}
				alt="Change season"
			/>
		{/if}
	</button>
	{#if seasonDropdownOpen}
		<div class="headerOptions" transition:slide={{ duration: 200 }}>
			{#each playlists.filter((_, i) => i !== playlistIndex) as playlist}
				<button class="headerOption" on:click={changeSeason.bind(null, playlist)}>
					<img class="poster" alt={playlist.title} src={playlist.icon} />
					<div class="text">
						<h2>{playlist.title}</h2>
						<p>{playlist.subtitle}</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}
	{#if !$editor && $source !== null}
		<button class="source" on:click={() => (sourceDropdownOpen = !sourceDropdownOpen)}>
			<div class="text">
				{#if 'source' in $source}
					📃 {$source.source.name} ({$source.source.language})
					{#if $source.source.credits.length}
						by
						{#each $source.source.credits as credit}
							<a href={credit.link} target="_blank">{credit.name}</a>
						{/each}
					{/if}
				{:else}
					📜 {$source.name} ({$source.language})
					{#if $source.credits.length}
						by
						{#each $source.credits as credit}
							<a href={credit.link} target="_blank">{credit.name}</a>
						{/each}
					{/if}
				{/if}
			</div>
			<img
				style={`transform: rotate(${sourceDropdownOpen ? -180 : 0}deg)`}
				src={ChevronDown}
				alt="Change source"
			/>
			{#if sourceDropdownOpen}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="headerOptions source"
					transition:slide={{ duration: 200 }}
					on:click={(e) => e.stopPropagation()}
				>
					{#each playlists[playlistIndex].sources.filter((s) => s.path !== $source?.path) as s}
						<button class="headerOption" on:click={changeSource.bind(null, s)}>
							<span>
								📜 {s.name} ({s.language})
								{#if s.credits.length}
									by
									{#each s.credits as credit}
										<a style="pointer-events: none" href={credit.link} target="_blank"
											>{credit.name}</a
										>
									{/each}
								{/if}
							</span>
						</button>
					{/each}
					{#each getCustomSubs().filter((s) => s.source.path !== $source?.source?.path && s.title === playlists[playlistIndex].title) as s}
						<button class="headerOption" on:click={changeSource.bind(null, s)}>
							<span>
								📃 {s.source.name} ({s.source.language})
								{#if s.source.credits.length}
									by
									{#each s.source.credits as credit}
										<a href={credit.link} target="_blank">{credit.name}</a>
									{/each}
								{/if}
							</span>
						</button>
					{/each}
					<hr />
					<button class="headerOption" on:click={() => openEditor()}>
						✏️ Create your own subtitles
					</button>
					<button
						class="headerOption"
						on:click={() => {
							dispatch('importCard');
							sourceDropdownOpen = false;
						}}
					>
						🃏 Import a Sub Card
					</button>
				</div>
			{/if}
		</button>
	{:else}
		<div class="editorInitial">
			<h3 style="text-align: center; padding-bottom: 10px">
				Select an episode to start captioning
			</h3>
			<div class="btnrow">
				<button on:click={() => (editorModalOpen = true)}> 💾 Save </button>
				<button on:click={deleteEditor}> ❌ Close </button>
			</div>
		</div>
	{/if}
	<div class="episodes">
		{#each $source && 'episodes' in $source ? $source.episodes : playlists[playlistIndex].episodes.filter((_, i) => !$source?.exclude?.includes(i)) as episode, i}
			<button
				class:active={$video?.id === episode.id}
				class="episode"
				on:click={() => playVideo(episode)}
			>
				<img alt={episode.name} src={`https://img.youtube.com/vi/${episode.id}/0.jpg`} />
				<div class="text">
					<h3>{episode.name}</h3>
					<div class="tags">
						<span class="tag">{episode.label}</span>
						{#if $editor}
							{#if $editor.episodes.map((x) => x.id).includes(episode.id)}
								<span class="tag success">CC</span>
							{:else}
								<span class="tag outline">No CC</span>
							{/if}
						{/if}
					</div>
				</div>
			</button>
		{/each}
		{#if !($source && 'episodes' in $source) && playlists[playlistIndex].incomplete && playlistIndex !== 2}
			<i style="text-align: center; width: 100%; display: block; padding: 10px 0;">
				Check back next week for new episodes!
			</i>
		{/if}
		{#if playlistIndex === 2}
			<div class="unknownSeason">
				<img
					src={unknownSeason}
					alt="A Cardbot from Season 2"
					style="max-height: min(50vh, 200px); max-width: 70%"
				/>
				<i style="text-align: center; width: 100%; display: block; padding: 10px 0;">
					We don't know when the next episode will premiere on YouTube.<br />Check back later!
				</i>
			</div>
		{/if}
		{#if ($source && 'episodes' in $source ? $source.episodes : playlists[playlistIndex].episodes).length === 0}
			<div class="unknownSeason">
				<img
					src={unknownSeason}
					alt="A Cardbot from Season 2"
					style="max-height: min(50vh, 200px); max-width: 70%"
				/>
				<i style="text-align: center; width: 100%; display: block; padding: 10px 0;">
					There's nothing here.
				</i>
			</div>
		{/if}
	</div>
	{#if !$editor && $source && 'source' in $source}
		<div class="btnrow" style="gap: 0">
			<button class="editSub" on:click={() => openEditor($source)}>✏️ Edit custom sub</button>
			<button class="editSub" on:click={() => removeSub($source)}>❌ Remove sub</button>
		</div>
	{/if}
</div>

{#if editorModalOpen}
	<EditorModal {editor} on:save={saveEditor} on:close={() => (editorModalOpen = false)} />
{/if}

<style>
	.unknownSeason {
		flex-shrink: 1;
		padding-top: 10vh;
		margin: auto;
		text-align: center;
		max-width: 70%;
	}
	.playlist {
		width: 100%;
		max-width: 400px;
		height: 100%;
		text-align: left;
		min-height: 300px;

		position: relative;
		display: flex;
		flex-direction: column;
	}
	.episodes {
		background-color: #333;
		overflow: auto;
		height: 100%;
		flex-grow: 1;
	}
	.source {
		padding: 0 10px;
		background-color: #1a1a1a;
		display: flex;
		align-items: center;
		position: relative;
		border-radius: 0;
		outline: none;
	}
	.source:hover:has(.headerOption:hover) {
		border-color: transparent;
	}
	.source a {
		color: white;
	}
	.source a:hover {
		text-decoration: underline;
	}
	.source a:not(:last-child)::after {
		content: ', ';
	}
	.source .headerOptions {
		z-index: 19;
	}
	.headerOptions hr {
		margin: 0;
		width: 100%;
		border: 1px solid #777;
	}
	.source .text,
	.headerOptions.source {
		text-align: left;
		flex-grow: 1;
	}
	.headerOptions.source a {
		pointer-events: none;
	}
	@media screen and (max-width: 900px) {
		.playlist {
			max-width: unset;
			height: 100%;
		}
		.episodes {
			height: 100%;
		}
		.playlist:not(.custom) .episodes {
			padding-bottom: 50px;
		}
	}
	button.header,
	button.headerOption {
		display: flex;
		gap: 10px;
		align-items: center;
		text-align: left;
		padding: 0 10px;
		background-color: #444;
		border-radius: 10px 10px 0 0;
		width: 100%;
		height: 75px;
		flex-shrink: 0;
	}
	button.header:focus:not(:focus-visible) {
		outline: none;
	}
	button.header img.poster,
	button.headerOption img.poster {
		width: 48px;
		height: 48px;
		border-radius: 100%;
	}
	button.header img:not(.poster),
	button.source img:not(.poster) {
		width: 36px;
		height: 36px;
		transition: transform 0.2s ease-in-out;
	}
	.header .text,
	.headerOptions .text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex-grow: 1;
	}
	.headerOptions {
		z-index: 20;
		position: absolute;
		top: 75px;
		left: 0;
		width: 100%;
		box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		border-radius: 0 0 5px 5px;
		overflow: hidden;
		max-height: 50vh;
		overflow-y: auto;
	}
	.headerOptions.source {
		top: calc(100% + 1px);
		left: -1px;
		width: calc(100% + 2px);
		padding: 0;
	}
	.headerOptions.source .headerOption {
		padding: 10px;
		height: auto;
		background-color: #444;
	}
	button.headerOption {
		border-radius: 0;
		background-color: #555;
	}
	.editorInitial {
		background-color: #111;
		padding: 10px;
	}
	h2,
	h3,
	p {
		color: white;
		line-height: 1.25em;
		margin: 0;
	}
	.episode {
		width: 100%;
		text-align: left;
		display: flex;
		align-items: center;
		border-radius: 0;
		border: 0;
		border-top: 1px solid #555;
		background-color: transparent;
		gap: 10px;
		padding: 10px;
	}
	.episode:not(:disabled):hover {
		background-color: #555;
	}
	.episode.active {
		background-color: #666;
		position: sticky;
		bottom: 0px;
		top: 0px;
	}
	.episode img {
		width: 100px;
		height: calc(100px * 9 / 16);
		flex-shrink: 0;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		overflow: hidden;
		border-radius: 5px;
	}
	.episode.active img {
		filter: brightness(0.5);
	}
	.episode.active:after {
		content: '▶️';
		position: absolute;
		top: 50%;
		left: 60px;
		font-size: 24px;
		transform: translateY(-50%) translateX(-50%);
		color: white;
		border-radius: 5px;
	}
	.tag {
		background-color: #ed4245;
		color: white;
		padding: 2px 5px;
		border-radius: 5px;
		font-size: 0.75em;
	}
	.tag.outline {
		background-color: transparent;
		border: 1px solid #aaa;
		color: #aaa;
	}
	.tag.success {
		background-color: #3ba55c;
	}
	.editSub {
		width: 100%;
		border-radius: 0;
	}
	@media (prefers-color-scheme: light) {
		.episodes {
			background-color: #ddd;
		}
		.source {
			background-color: #bbb;
		}
		.source a {
			color: black;
		}
		button.header {
			background-color: #ccc;
		}
		button.headerOption {
			background-color: #bbb;
		}
		button.header img:not(.poster),
		button.source img:not(.poster) {
			filter: invert(1);
		}
		.headerOptions.source .headerOption {
			background-color: #ccc;
		}
		.editorInitial {
			background-color: #ccc;
		}
		.episode {
			border-top: 1px solid #bbb;
		}
		.episode:hover {
			background-color: #ccc;
		}
		.episode.active {
			background-color: #bbb;
		}
		.tag.outline {
			color: #666;
			border-color: #666;
		}
		h2,
		h3,
		p {
			color: inherit;
		}
	}
</style>
