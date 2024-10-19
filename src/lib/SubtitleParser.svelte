<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    export let subtitles: Array<{start: number, end: number, text: string}>;
    export let target: any;
    export let hover: boolean;

    let subtitle = null;

    let currentSubtitle = null;

    function subtitleUpdate() {
        if (!target) return;
        let time = target.getCurrentTime();

        if (currentSubtitle === time) return;

        for (let sub of subtitles) {
            if (time >= sub.start && time <= sub.end) {
                currentSubtitle = time;
                subtitle = sub.text;
                return;
            }
        }
        subtitle = null;
    }

    let interval;
    onMount(() => {
        interval = setInterval(subtitleUpdate, 100);
        
    })

    onDestroy(() => {
        clearInterval(interval);
    })
</script>

{#if subtitle}
<div class="subtitleArea" class:hover={hover}>
    <div class="subtitle">{subtitle}</div>
</div>
{/if}

<style>
    .subtitleArea {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        color: white;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: bottom 0.1s ease-in-out;
    }
    .subtitleArea.hover {
        bottom: 40px;
    }
    .subtitle {
        background-color: rgba(0, 0, 0, 0.5);
        padding: 0 5px;
        font-size: 24px;
        border-radius: 5px;
        max-width: 80%;
    }
    @media screen and (min-width: 1200px) {
        .subtitle {
            font-size: 32px;
        }
    }
</style>