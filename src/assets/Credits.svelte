<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Source } from '../subtitles';

	export let credits: Source['credits'] = [];
</script>

<div class="credits" transition:fade={{ duration: 200 }}>
	<h2>This subtitle was brought to you by:</h2>
	<div class="authors">
		{#each credits as author}
			<a class="author" target="_blank" rel="noopener noreferrer" href={author.link}>
				<p>{author.name}</p>
			</a>
		{/each}
	</div>
	<h3>Thank you for watching!</h3>
</div>

<style>
	.credits {
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
		z-index: 1;
	}
	.credits > h2 {
		margin-top: 0;
	}
	.authors {
		display: flex;
		width: 100%;
		gap: 8px;
		flex-wrap: wrap;
	}
	.author {
		width: calc(50% - 30px);
		display: block;
		background-color: #111;
		color: white;
		padding: 10px;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}
	.author:hover {
		background-color: #222;
	}

	@media screen and (max-width: 1000px) {
		.credits {
			width: 30vw;
		}
		.credits h2,
		.credits h3 {
			margin: 0px;
		}
	}
	@media screen and (max-width: 900px) {
		.credits {
			width: calc(100% - 5vw);
			padding: 1vw;
			border-radius: 2vw;
		}
		.credits h2 {
			font-size: 4vw;
			margin-bottom: 1vw;
		}
		.credits h3 {
			font-size: 3vw;
			margin-top: 1vw;
		}
		.credits {
			font-size: 4vw;
			padding: 0.5vw;
		}
	}
</style>
