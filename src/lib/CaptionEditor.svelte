<script lang="ts">
  import { tick } from "svelte";
    import { slide } from "svelte/transition";

    export let subtitles: Array<{start: number, end: number, text: string}>;
    export let target: any;

    async function loadFromSubtitles() {
        text = subtitles.map(sub => sub.text.trim()).join("\n");
        await tick();
        starts = subtitles.map(sub => sub.start);
        ends = subtitles.map(sub => sub.end);
    }

    let text = "";
    let textLines = text.split("\n");
    $: {
        textLines = text.split("\n");
        starts = [];
        ends = [];
    }
    let starts = [];
    let ends = [];

    $: {
        if (step === 'end' && ends.length < textLines.length) {
            target.seekTo(starts[ends.length]);
            target.playVideo()
        }
    }

    let step: 'text' | 'start' | 'end' | 'review' = 'text';

    function setEnd(i: number, time: number) {
        if (time < starts[i]) {
            time = starts[i];
        } else if (i < starts.length - 1 && time > starts[i + 1]) {
            time = starts[i + 1];
        }
        ends[i] = time;
        ends = [...ends];
    }

    const toTime = (time: number) => `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`

    function downloadSRT() {
        // create srt
        const toSrtTime = (time: number) => {
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor(time / 60) % 60;
            let seconds = time % 60;
            let milliseconds = Math.floor((time % 1) * 1000);
            return `${hours}:${minutes}:${seconds},${milliseconds}`;
        }
        let srt = "";
        for (let i = 0; i < textLines.length; i++) {
            srt += `${i + 1}\n`;
            srt += `${toSrtTime(starts[i])} --> ${toSrtTime(ends[i])}\n`;
            srt += textLines[i] + "\n\n";
        }

        // download
        let blob = new Blob([srt], {type: "text/plain"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = target.playerInfo.videoData.video_id + ".srt";
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="captionEditor" transition:slide={{axis: 'x', duration: 100}}>
    <header>
        <h2>
            {#if step === 'text'}
            Write your lines
            {/if}
            {#if step === 'start'}
            Choose start positions ({starts.length}/{textLines.length})
            {/if}
            {#if step === 'end'}
            Choose end positions
            {/if}
            {#if step === 'review'}
            Review your captions
            {/if}
        </h2>
    </header>
    <main>
        {#if step === 'text'}
        <textarea bind:value={text} />
        <div class="btnrow">
            <button on:click={loadFromSubtitles}>
                Load from subtitles
            </button>
            <button class="primary" on:click={() => step = 'start'}>Next</button>
        </div>
        {/if}
        {#if step === 'start'}
        {#if textLines.length > starts.length}
        <div class="line">
            <span>{textLines[starts.length]}</span>
            <button class="primary" on:click={() => starts = [...starts, target.getCurrentTime()]}>Now</button>
        </div>
        {/if}
        <div class="lines">
            {#each starts as start, i}
            <div class="line">
                <span>{textLines[i]}</span>
                <button on:click={() => { starts[i] = target.getCurrentTime(); starts = [...starts]}}>{toTime(start)}</button>
            </div>
            {/each}
        </div>
        <div class="btnrow">
            <button on:click={() => step = 'text'}>Back</button>
            <button class="primary" on:click={() => step = 'end'} disabled={starts.length < textLines.length}>Next</button>
        </div>
        {/if}
        {#if step === 'end'}
        {#if textLines.length > ends.length}
        <div class="line">
            <span>{textLines[ends.length]}</span>
            <button disabled>{toTime(starts[ends.length])}</button>
            <button class="primary" on:click={() => setEnd(ends.length, target.getCurrentTime())}>Now</button>
            {#if ends.length < starts.length - 1}
            <button class="primary toNext" on:click={() => ends = [...ends, starts[ends.length + 1]]}>➡️</button>
            {/if}
        </div>
        {/if}
        <div class="lines">
            <span class="reversed">
                {#each ends as end, i}
                <div class="line">
                    <button class="outline" style="padding: 10px 5px" on:click={() => target.seekTo(starts[i])}>{toTime(starts[i])}</button>                    
                    <span>{textLines[i]}</span>
                    <button on:click={() => setEnd(i, target.getCurrentTime())}>{toTime(end)}</button>
                    {#if i < starts.length - 1}
                    <button disabled={ends[i] === starts[i + 1]} class="primary toNext" on:click={() => { ends[i] = starts[i + 1]; ends = [...ends]}}>➡️</button>
                    {/if}
                </div>
                {/each}
            </span>
        </div>
        <div class="btnrow">
            <button on:click={() => step = 'start'}>Back</button>
            <button class="primary" on:click={() => step = 'review'} disabled={starts.length < textLines.length}>Next</button>
        </div>
        {/if}
        {#if step === 'review'}
        <div class="lines">
            <span class="reversed">
                {#each textLines as line, i}
                <div class="line">
                    <span>{line}</span>
                    <button on:click={() => target.seekTo(starts[i])}>{toTime(starts[i])}</button>
                    <button on:click={() => target.seekTo(ends[i])}>{toTime(ends[i])}</button>
                </div>
                {/each}
            </span>
        </div>
        <div class="btnrow">
            <button on:click={() => step = 'end'}>Back</button>
            <button class="primary" on:click={downloadSRT}>Done</button>
        </div>
        {/if}
    </main>
</div>

<style>
    .captionEditor {
        position: fixed;
        right: 0;
        top: 0;
        height: 100%;
        overflow: auto;
        width: 400px;
        background-color: #111;
        border-left: 1px solid #777;
        display: flex;
        flex-direction: column;
    }
    header {
        height: 75px;
    }
    main {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 10px;
        padding-bottom: 10px;
        height: calc(100% - 85px);
        flex-grow: 1;
    }
    main textarea {
        height: 100%;
        line-height: 1.25em;
    }
    .line {
        display: flex;
        gap: 10px;
        padding: 10px 5px;
        border: 1px solid #333;
        border-radius: 5px;
        align-items: center;
        margin-bottom: 5px;
    }
    .line span {
        flex-grow: 1;
        text-align: left;
    }
    .lines {
        border-top: 1px solid #333;
        overflow: auto;
        height: 100%;
    }
    .lines .reversed {
        display: flex;
        flex-direction: column-reverse;
        gap: 5px;
    }
    .toNext {
        padding: 10px 5px;
    }
</style>