<script lang="ts">
    import { onDestroy, tick } from "svelte";
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
        if (step === "text") {
            if (text.includes("\n\n")) {
                // read srt
                let lines = text.split("\n\n");
                textLines = [];
                starts = [];
                ends = [];
                try {
                    lines.map(x => x.split("\n")).filter(x => x.length > 0).forEach(([num, startEnd, ...text]) => {
                        if (num === undefined || startEnd === undefined) return;
                        starts.push(fromTime(startEnd.split(" --> ")[0].replace(",", ".")));
                        ends.push(fromTime(startEnd.split(" --> ")[1].replace(",", ".")));
                        textLines.push(text.join("\n"));
                    });
                } catch (e) {
                    console.error(e);
                    textLines = text.split("\n");
                    starts = [];
                    ends = [];
                }
            } else {
                textLines = text.split("\n");
                starts = [];
                ends = [];
            }
        }
    }
    let starts: number[] = [];
    let ends: number[] = [];

    $: {
        if (step === 'end' && ends.length < textLines.length) {
            target.seekTo(starts[ends.length]);
            target.playVideo()
        }
    }

    let step: 'text' | 'start' | 'end' | 'review' = 'text';

    function setEnd(i: number, time: number) {
        if (time < starts[i]) {
            setStart(i, time);
        } else if (i < starts.length - 1 && time > starts[i + 1]) {
            time = starts[i + 1];
        }
        ends[i] = time;
        ends = [...ends];
    }

    function setStart(i: number, time: number) {
        if (i > 0 && i <= ends.length && time < ends[i - 1]) {
            setEnd(i - 1, time);
        } else if (time > ends[i] - 0.1) {
            time = ends[i] - 0.1;
        }
        starts[i] = time;
        starts = [...starts];
    }

    const toTime = (time: number) => `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`

    const fromTime = (time: string) => {
        let [hours, minutes, seconds] = time.split(":").map(x => parseFloat(x));
        return hours * 3600 + minutes * 60 + seconds;
    }

    function downloadSRT() {
        // create srt
        const toSrtTime = (time: number) => {
            let hours = Math.floor(time / 3600).toString().padStart(2, '0');
            let minutes = (Math.floor(time / 60) % 60).toString().padStart(2, '0');
            let seconds = (Math.floor(time) % 60).toString().padStart(2, '0');
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

    let currentTime = 0;
    let interval = setInterval(() => currentTime = target?.getCurrentTime(), 100);

    onDestroy(() => clearInterval(interval));

    const getTime = () => target.getCurrentTime() - 0.1;
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
            Choose end positions ({ends.length}/{textLines.length})
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
            <button class="primary" on:click={() => starts = [...starts, getTime()]}>Now</button>
        </div>
        {/if}
        <div class="lines">
            <span class="reversed">
                {#each starts as start, i}
                <div class="line" class:active={start < currentTime && (i === starts.length - 1 ? true : starts[i + 1] > currentTime)}>
                    <span>{textLines[i]}</span>
                    <button on:click={() => { starts[i] = getTime(); starts = [...starts]}}>{toTime(start)}</button>
                </div>
                {/each}
            </span>
        </div>
        <div class="btnrow">
            <button on:click={() => step = 'text'}>Back</button>
            <button class="primary" on:click={() => step = 'end'} disabled={starts.length < textLines.length}>Next</button>
        </div>
        {/if}
        {#if step === 'end'}
        {#if textLines.length > ends.length}
        <div class="line">
            <button class="outline" style="padding: 10px 5px" on:click={() => target.seekTo(starts[ends.length])}>{toTime(starts[ends.length])}</button>                    
            <span>{textLines[ends.length]}</span>
            <button class="primary" on:click={() => setEnd(ends.length, getTime())}>Now</button>
            {#if ends.length < starts.length - 1}
            <button class="primary toNext" on:click={() => ends = [...ends, starts[ends.length + 1]]}>➡️</button>
            {/if}
        </div>
        {/if}
        <div class="lines">
            <span class="reversed">
                {#each ends as end, i}
                <div class="line" class:active={currentTime > starts[i] && currentTime < ends[i]}>
                    <div class="timeLayout">
                        <button class="outline" on:click={() => target.seekTo(starts[i])}>{toTime(starts[i])}</button>
                        <div class="btnrow">
                            <button class="backTime" on:click={() => setStart(i, starts[i] - 0.1)}>-.1s</button>
                            <button class="fwdTime" on:click={() => setStart(i, starts[i] + 0.1)}>+.1s</button>
                        </div>
                    </div>
                    <span>{textLines[i]}</span>
                    <button on:click={() => setEnd(i, getTime())}>{toTime(end)}</button>
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
                <div class="line" class:active={currentTime > starts[i] && currentTime < ends[i]}>
                    <div class="timeLayout">
                        <button class="outline" on:click={() => target.seekTo(starts[i])}>{toTime(starts[i])}</button>
                        <div class="btnrow">
                            <button class="backTime" on:click={() => setStart(i, starts[i] - 0.1)}>-.1s</button>
                            <button class="fwdTime" on:click={() => setStart(i, starts[i] + 0.1)}>+.1s</button>
                        </div>
                    </div>
                    <span style="font-size: 9px">{line}</span>
                    <div class="timeLayout">
                        <button class="outline" on:click={() => target.seekTo(ends[i])}>{toTime(ends[i])}</button>
                        <div class="btnrow">
                            <button class="backTime" on:click={() => setEnd(i, ends[i] - 0.1)}>-.1s</button>
                            <button class="fwdTime" on:click={() => setEnd(i, ends[i] + 0.1)}>+.1s</button>
                        </div>
                    </div>
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
        z-index: 9;
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
        background-color: #222;
        border-radius: 5px;
        align-items: center;
        margin-bottom: 5px;
        height: 50px;
        overflow: hidden;
    }
    .line.active {
        background-color: #444;
    }
    .line span {
        flex-grow: 1;
        flex-shrink: 1;
        width: 100%;
        overflow-wrap: break-word;
        text-align: left;
    }
    button {
        padding: 10px 5px;
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
    .timeLayout {
        display: flex;
        flex-direction: column;
        gap: 0px;
        background-color: #1a1a1a;
        border-radius: 10px;
    }
    .timeLayout .outline {
        padding: 5px 2px;
        border-radius: 10px 10px 0 0;
    }
    .timeLayout button {
        padding: 5px 2px;
        margin: 0;
    }
    .timeLayout .btnrow {
        display: flex;
        gap: 0px;
        justify-content: flex-end;
        border-radius: 10px;
    }
    .timeLayout .btnrow button {
        width: 100%;
        border-radius: 0;
    }
    .timeLayout .btnrow button:first-child {
        border-radius: 0 0 0 10px;
    }
    .timeLayout .btnrow button:last-child {
        border-radius: 0 0 10px 0;
    }
    @media screen and (max-width: 700px) {
        .captionEditor {
            display: none;
        }
    }
</style>