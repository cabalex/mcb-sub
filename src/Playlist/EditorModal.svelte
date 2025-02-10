<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	import type { CustomDraft } from '../editor';
	import { encode, encodeString } from './steganography';

	export let editor: Writable<CustomDraft | null>;

	const dispatch = createEventDispatcher();

	const close = () => dispatch('close');

	const COLORS = [
		'blueCop',
		'megaTrucker',
		'phoenixFire',
		'megaAmbler',
		'shadowX',
		'wildGuardy',
		'dexter',
		'fletaZ',
		'buffaloCrush',
		'busterGallon',
		'blackHook'
		// 'heavyIron' // but I haven't made a color for him
		// maybe add the s2 characters...
	];

	let color = '#1E90FF';
	let image = $editor?.icon || '';

	function hexToHSL(hex: string) {
		let r = parseInt(hex.slice(1, 3), 16);
		let g = parseInt(hex.slice(3, 5), 16);
		let b = parseInt(hex.slice(5, 7), 16);
		(r /= 255), (g /= 255), (b /= 255);
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let h = 0;
		let s = 0;
		let l = (max + min) / 2;
		if (max == min) {
			h = s = 0; // achromatic
		} else {
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}
		return { h, s, l };
	}

	function uploadImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				image = reader.result as string;
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}

	const hslToString = (hsl: { h: number; s: number; l: number }) =>
		`hsl(${hsl.h * 360}deg ${hsl.s * 100}% ${hsl.l * 100}%)`;

	let encodeTimeout = -1;
	let spaceLeft: number | null = null;
	async function createCard(
		editor: CustomDraft,
		canvas: HTMLCanvasElement,
		calculateSpace = false
	) {
		const perf = performance.now();
		const hsl = hexToHSL(color);
		let light = { h: hsl.h, s: 0.6, l: 0.6 };
		let lighter = { h: hsl.h, s: 1, l: 0.8 };
		let dark = { h: hsl.h, s: hsl.s, l: 0.2 };
		const f = await fetch('./metalcard.svg');
		const text = (await f.text())
			.replaceAll('var(--primary)', color)
			.replaceAll('var(--secondary)', hslToString(light))
			.replaceAll('var(--bg)', hslToString(dark));

		const img = new Image();
		img.src = 'data:image/svg+xml;base64,' + btoa(text);
		await img.decode();

		const bgImg = new Image();
		bgImg.src = image;
		await bgImg.decode();

		const cropCanvas = document.createElement('canvas');
		cropCanvas.width = canvas.width - 120;
		cropCanvas.height = canvas.height - 120;
		const cropCtx = cropCanvas.getContext('2d');
		if (!cropCtx) return;
		cropCtx.fillStyle = '#111';
		cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
		const w = (cropCanvas.width / cropCanvas.height) * bgImg.width;
		const offsetX = bgImg.width / 2 - w / 2;
		cropCtx.drawImage(
			bgImg,
			offsetX,
			0,
			w,
			bgImg.height,
			0,
			0,
			cropCanvas.width,
			cropCanvas.height
		);

		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const scale = Math.min(canvas.width / img.width, canvas.height / img.height);

		// draw bg
		ctx.drawImage(cropCanvas, 60, 60, canvas.width - 120, canvas.height - 120);

		ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

		// draw text
		ctx.fillStyle = hslToString(dark);
		ctx.textAlign = 'center';
		ctx.font = 'bold 64px sans-serif';
		ctx.setTransform(1, -0.125, 0, 1, 0, 0);
		ctx.fillText(editor.source.name, 280, 583, 300);
		// drop shadow
		let gradient = ctx.createLinearGradient(0, 540, 0, 580);
		gradient.addColorStop(0, hslToString(lighter));
		gradient.addColorStop(1.0, color);
		ctx.fillStyle = gradient;
		ctx.fillText(editor.source.name, 282, 580, 300);

		// drag language
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.font = 'bold 96px sans-serif';
		ctx.fillStyle = hslToString(light);
		ctx.fillText(editor.source.language.toUpperCase(), 350, 740);

		// draw watermark
		ctx.font = 'bold 24px sans-serif';
		ctx.fillText('cabalex.github.io/mcb-sub', canvas.width / 2, 65);

		if (calculateSpace) {
			// create a copy of the canvas data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			spaceLeft = await encodeString(imageData.data.buffer, JSON.stringify(editor));
		}
	}

	async function saveCardWithMetadata() {
		if (!$editor || !canvasElem) return;

		const ctx = canvasElem.getContext('2d');
		if (!ctx) return;
		spaceLeft = await encodeString(ctx, JSON.stringify($editor)).catch(() => null);

		if (spaceLeft === null) {
			alert('An error occurred while trying to save your card. Try again.');
			return;
		}

		const blob = await new Promise<Blob | null>((resolve) =>
			canvasElem.toBlob(resolve, 'image/png')
		);

		if (!blob) return;
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `${$editor.source.name} - ${$editor.source.language.toUpperCase()}.png`;
		link.click();
		URL.revokeObjectURL(link.href);

		dispatch('save');
	}

	function changeId() {
		if ($editor) {
			$editor.source.path = '/' + Math.random().toString(36).slice(2);
		}
	}

	let canvasElem: HTMLCanvasElement;
	onMount(() => {
		if (canvasElem && $editor) {
			createCard($editor, canvasElem, true);
		}
	});

	$: {
		if (color && image && $editor && canvasElem) {
			createCard($editor, canvasElem);
		}
	}
</script>

{#if $editor !== null}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal desktop" on:click={close} transition:fade|global={{ duration: 100 }}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="modalContent"
			on:click={(e) => e.stopPropagation()}
			transition:fly|global={{ duration: 100, y: 50 }}
		>
			<div class="twoPane">
				<div class="preview">
					<canvas bind:this={canvasElem} width="500" height="800"></canvas>
				</div>
				<div class="settings">
					<h2>Subtitle details</h2>
					<div class="setting">
						<label for="title">Name</label>
						<input type="text" id="title" bind:value={$editor.source.name} on:change={changeId} />
					</div>
					<div class="setting">
						<label for="lang">Language code (e.g. EN)</label>
						<input
							type="text"
							style="width: 2ch; flex: 0; margin-left: auto"
							id="lang"
							maxlength="2"
							bind:value={$editor.source.language}
						/>
					</div>
					<h3>Authors</h3>
					{#each $editor.source.credits as credit, i}
						<div class="setting">
							<label for="credit-{i}">Author {i + 1}</label>
							<button
								class="delete"
								on:click={() =>
									($editor.source.credits = $editor.source.credits.filter((_, j) => i !== j))}
							>
								✖️
							</button>
							<input type="text" id="credit-{i}" placeholder="@myname" bind:value={credit.name} />
						</div>
						<div class="setting">
							<label for="link-{i}">Link</label>
							<input
								type="text"
								id="link-{i}"
								placeholder="https://twitter.com/myname"
								bind:value={credit.link}
							/>
						</div>
					{/each}
					{#if $editor.source.credits.length < 3}
						<button
							style="width: 100%;"
							on:click={() =>
								($editor.source.credits = [...$editor.source.credits, { name: '', link: '' }])}
						>
							Add author
						</button>
					{/if}
					<h2>Create a Sub Card</h2>
					<div class="setting">
						<span>Photo</span>
						<button style="width: 100%;" on:click={uploadImage}>Upload image</button>
					</div>
					<h3>Color</h3>
					<div class="colors">
						{#each COLORS as c}
							{@const hex = window.getComputedStyle(document.body).getPropertyValue('--' + c)}
							<button
								class="color"
								style="background-color: {hex}"
								on:click={() => (color = hex)}
								class:active={color === hex}
							/>
						{/each}
					</div>
					<button
						class="primary"
						on:click={saveCardWithMetadata}
						disabled={spaceLeft === null || spaceLeft > 1}>Download your Sub Card</button
					>
					<div class="spaceLeft">
						{#if spaceLeft !== null}
							<div class="spaceBar">
								<div class="spaceBarInner" style="width: {spaceLeft * 100}%"></div>
							</div>
							{#if spaceLeft > 1}
								<span class="small">
									<b>⚠️ Out of space.</b> Make your sub smaller to save your Sub Card.
								</span>
							{:else}
								<span class="small">Space used on Card: {(spaceLeft * 100).toFixed(2)}%</span>
							{/if}
						{:else}
							<span class="small">Computing space...</span>
						{/if}
					</div>
					<hr />
					<span style="text-align: center">Don't need to share your subtitles?</span>
					<button on:click={() => dispatch('save')}>Save to website local storage</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modalContent {
		max-width: unset !important;
		padding: 0;
	}
	.twoPane {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.small {
		font-size: 0.8em;
		color: #eee;
	}
	.preview {
		flex: 1;
		margin-left: 20px;
		height: 100%;
	}
	.preview canvas {
		pointer-events: none;
		max-height: 500px;
		filter: drop-shadow(0 0 5px black);
	}
	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-height: calc(80vh - 20px);
		overflow-y: auto;
		padding: 10px;
		max-width: 50%;
	}
	.settings h2 {
		margin-top: 10px;
	}
	.setting {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.setting label,
	.setting span {
		width: 50%;
	}
	.setting input {
		flex: 1;
		font-size: unset;
		background-color: #222;
		border: 1px solid #333;
		padding: 10px;
		border-radius: 5px;
	}
	.setting input:focus {
		outline: none;
		border-color: #666;
	}
	h3 {
		margin: 0;
	}
	.colors {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.color {
		width: 2em;
		height: 2em;
		border: none;
		padding: 0;
		border-radius: 100px;
	}
	.color.active {
		outline: 2px solid white;
		outline-offset: -2px;
	}
	hr {
		border: none;
		border-top: 1px solid #333;
		margin: 0;
	}
	.spaceBar {
		background-color: #333;
		border-radius: 5px;
		overflow: hidden;
	}
	.spaceBarInner {
		background-color: var(--blueCop);
		height: 10px;
	}
	@media screen and (max-width: 800px) {
		.modal {
			background-color: rgba(0, 0, 0, 0.5);
		}
		.modalContent {
			border-radius: 5px;
		}
		.twoPane {
			flex-direction: column;
		}
		.settings {
			width: calc(100% - 20px);
			max-width: unset;
		}
		.preview {
			margin-left: 0;
		}
	}
	@media (prefers-color-scheme: light) {
		.setting input {
			background-color: #f0f0f0;
			color: #000;
		}
		.setting input:focus {
			border-color: #777;
		}
		button:not(:hover):not(:focus) {
			border-color: #999;
		}
		.color.active {
			outline: 2px solid black;
			outline-offset: -2px;
		}
		.small {
			color: #333;
		}
		.spaceBar {
			background-color: #ddd;
		}
	}
</style>
