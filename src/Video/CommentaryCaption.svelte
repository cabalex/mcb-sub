<script lang="ts">
	import { onMount } from "svelte";

    export let text: string;
    export let name: string;
    export let subtitleStyles = '';

    const SPEAKER_COLORS: {[name: string]: string} = {
        "Jun": "#4571C1",
        "Blue Cop": "#467BEB",
        "Mega Trucker": "#EF9F5F",
        "Mega Ambler": "#EB000B",
        "Phoenix Fire": "#FA5D5F",
        "Shadow X": "#934CD5",
    }
    $: speakerColor = SPEAKER_COLORS[name] || SPEAKER_COLORS["Jun"];

    let width = 0;
    function getWidth() {
        width = document.getElementsByClassName('videoInner')[0]?.clientWidth || 0;
    }
    getWidth();

    onMount(() => {
        window.addEventListener('resize', getWidth);
        window.addEventListener('fullscreenchange', getWidth);
        return () => {
            window.removeEventListener('resize', getWidth);
            window.removeEventListener('fullscreenchange', getWidth);
        };
    });

</script>

<div
    class="subtitle commentary-subtitle"
	style={`--random-length: ${Math.random()}s; --speaker-color: ${speakerColor}; --width: ${width}px; ${subtitleStyles}`}
>
	<div class="author">{name}</div>
    <div class="body">{text}</div>
</div>

<style>
	.subtitle {
		max-width: 81%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}
    .author, .body {
        font-size: calc(var(--width, 100vw) * 0.024);
    }
	.commentary-subtitle {
		color: black !important;
        background-color: #C0C0C0;
        padding: calc(var(--width, 100vw) * 0.006);
        width: 100%;
        margin-bottom: 2.25%;
        position: relative;
        border-radius: calc(var(--width, 100vw) * 0.015);
        border-top-left-radius: 0;
	}
    .commentary-subtitle .author {
        position: absolute;
        background-color: #C0C0C0;
        padding: 0 0.5em;
        padding-right: 1em;
        border-bottom: 0;
        bottom: 100%;
        left: 0;
        min-width: 18%;
        font-weight: 900;
        clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
    }
    .commentary-subtitle .body {
        background-color: #FFFFFF;
        border: calc(var(--width, 100vw) * 0.0022) solid var(--speaker-color);
        width: 100%;
        padding: calc(var(--width, 100vw) * 0.01);
        border-radius: calc(var(--width, 100vw) * 0.01);
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
