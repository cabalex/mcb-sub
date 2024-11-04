<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    export let subtitles: Array<{start: number, end: number, text: string}>;
    export let target: any;
    export let hover: boolean;

    let currentSubtitle: typeof subtitles[number]|null = null;

    function subtitleUpdate() {
        if (!target) return;
        let time = target.getCurrentTime();

        if (currentSubtitle && time >= currentSubtitle.start && time < currentSubtitle.end) return;
        for (let sub of subtitles) {
            if (time >= sub.start && time <= sub.end) {
                currentSubtitle = sub;
                return;
            }
            if (time < sub.start) break;
        }
        currentSubtitle = null;
    }

    let interval: number;
    onMount(() => {
        interval = setInterval(subtitleUpdate, 10);
        
    })

    onDestroy(() => {
        clearInterval(interval);
    })
</script>

{#if currentSubtitle}
<div class="subtitleArea" class:hover={hover}>
    <div class="subtitle">
    {#each currentSubtitle.text.split(/[ \n]/) as word}
        <span class:newline={currentSubtitle.text.includes(word + "\n")}>{word}</span>
    {/each}
    </div>
</div>
{/if}

<style>
    .subtitleArea {
        position: absolute;
        bottom: 17px;
        left: 0;
        width: 100%;
        height: calc(100% - 20px);
        color: white;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        transition: bottom 0.1s ease-in-out;
    }
    .subtitleArea.hover {
        bottom: 70px;
    }
    .subtitle {
        max-width: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        font-size: 24px;
    }
    .subtitle span {
        background-color: rgba(0, 0, 0, 0.7);
        padding: 0 0.25ch;
    }
    .subtitle span.newline {
        flex-basis: 100%;
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