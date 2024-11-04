<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    export let subtitles: Array<{start: number, end: number, text: string}>;
    export let target: any;
    export let hover: boolean;

    let currentSubtitle: typeof subtitles[number]|null = null;

    let mounted = true;
    function subtitleUpdate() {
        if (mounted) requestAnimationFrame(subtitleUpdate);
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

    onMount(() => {
        requestAnimationFrame(subtitleUpdate);
        mounted = true;
    })

    onDestroy(() => {
        mounted = false;
    })
</script>

{#if currentSubtitle}
<div class="subtitleArea" class:hover={hover}>
    <div class="subtitle" class:needsFixing={currentSubtitle.text.includes("FIX_THIS")}>
    {#each currentSubtitle.text.replace(" (FIX_THIS)", "").split(/[ \n]/) as word}
        <span>{word}</span>
        {#if currentSubtitle.text.includes(word + "\n")}
            <span class="newline"></span>
        {/if}
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
    .subtitle.needsFixing {
        color: orange;
    }
    .subtitle.needsFixing:after {
        content: '⚠️';
        font-size: 0.5em;
        background-color: rgba(0, 0, 0, 0.7);
        align-self: flex-start;
        height: 3em;
    }
    .subtitle span {
        background-color: rgba(0, 0, 0, 0.7);
        padding: 0 0.25ch;
    }
    .subtitle span.newline {
        width: 0;
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