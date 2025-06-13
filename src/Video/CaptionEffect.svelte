<script lang="ts">
	import './captionEffects.css';
	export let text: string;
	export let effect: string;
	export let disabled = false;
	export let subtitleStyles = '';
	export let wordStyles = '';

	const nonBgEffects = [
		'bold',
		'italic',
		'xl',
		'xxl',
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
		'blackHook',
		'heavyIron',
		'mukara',
		'redBlitz',
		'cielo',
		'musclehyde',
		'gigantrex'
	];
	function useBackground(effect: string) {
		for (const fx of effect.split(' ')) {
			if (!nonBgEffects.includes(fx)) {
				return true;
			}
		}
		return false;
	}
	$: background = useBackground(effect);

	$: parts = text.split(/[ \n]/);
</script>

<div
	class={'subtitle ' + (disabled ? '' : effect)}
	class:useBackground={background}
	style={`--random-length: ${Math.random()}s; ${subtitleStyles}; ${background ? wordStyles : ''}`}
>
	{#each parts as word, i}
		{@const wordOffset = parts.slice(0, i).join(' ').length}
		<div
			class="word"
			data-text={word}
			style={`--offset: ${wordOffset * 0.52}s; animation-delay: -${wordOffset * 0.52}s; ${!background ? wordStyles : ''}`}
		>
			{#each word.split('') as letter, j}
				<span
					data-text={letter}
					style={`--random-length: ${Math.random()}s; --offset: ${((wordOffset + j) * 0.52) % 5}s; animation-delay: -${((wordOffset + j) * 0.52) % 5}s`}
					>{letter}</span
				>
			{/each}
		</div>
	{/each}
</div>

<style>
	.subtitle {
		max-width: 80%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		font-size: 24px;
	}
	.subtitle .word {
		display: inline-block;
		padding: 0 0.25ch;
	}
	.subtitle span {
		display: inline-block;
	}
	.useBackground,
	.subtitle:not(.useBackground) .word {
		background-color: rgba(0, 0, 0, 0.7);
	}
	@media screen and (max-width: 700px) {
		.subtitle {
			font-size: 18px;
		}
	}
	@media screen and (min-width: 1200px) {
		.subtitle {
			font-size: 36px;
		}
	}
</style>
