<script lang="ts">
    import SvelteYouTube from "../assets/SvelteYouTube.svelte";
    import { type Episode, type Source } from "../subtitles.ts";
    import CaptionEditor from "./CaptionEditor.svelte";
    import SubtitleParser from "./SubtitleParser.svelte";
    import FullscreenIcon from "../assets/fullscreen.svg";
    import FullscreenExitIcon from "../assets/fullscreen-exit.svg";
    import { slide } from "svelte/transition";
  import type { Writable } from "svelte/store";
    
    export let video: Writable<Episode|null>;
    export let source: Writable<Source|null>;
    
    let fullscreen = false;

    let hover = false;
    let target = null;
    function onPlay(e) {
        if (target === e.detail.target) return;
        target = e.detail.target;
        console.log("Playing", e.detail.target);
        hover = true;
        timeout = setTimeout(() => hover = false, 3000);
    }

    function onEnd(e) {
        // get next video
        console.log("Ended", e.detail.target);
        if ($video !== null) {
            const episodes = $video.context.episodes;
            let index = episodes.indexOf($video);
            if (index < episodes.length - 1) {
                video.set(episodes[index + 1]);
            }
        }

    }

    function parseTimestamp(timestamp: string) {
        let [hours, minutes, seconds] = timestamp.replace(",", ".").split(":").map(parseFloat);
        return hours * 3600 + minutes * 60 + seconds;
    }

    let subs: Array<{start: number, end: number, text: string}> = [];
    async function fetchSubtitle(url: string) {
        subs = [];
        let response = await fetch(url);
        if (!response.ok) return console.error("Failed to fetch subtitle");
        let data = await response.text();
        let lines = data.split("\n\n");

        subs = [];
        let i = 0;
        for (let line of lines) {
            if (line.startsWith((i + 1).toString() + "\n")) {
                i++;
                const sublines = line.split("\n");
                const sub = {start: -1, end: 1, text: ''};
                [sub.start, sub.end] = sublines[1].split(" --> ").map(parseTimestamp);
                sub.text = sublines.slice(2).join("\n");
                subs.push(sub);
            }
        }
    }

    $: {
        if ($video && $source) {
            fetchSubtitle(`./sub${$source.path}/${$video.id}.srt`);
        } else {
            subs = [];
        }
    }

    let videoElem: HTMLDivElement;
    function toggleFullscreen() {
        shownFullscreenTooltip();
        if (fullscreen) {
            document.exitFullscreen();
            fullscreen = false;
        } else {
            videoElem.requestFullscreen();
            fullscreen = true;
        }
    }

    let timeout: number;
    function hovered(e) {
        hover = true;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => hover = false, 3000);
    }

    function clearHover() {
        hover = false;
        if (timeout) clearTimeout(timeout);
    }

    $: issueReportAvailable = !!$video && !!target && subs.length > 0 && !fullscreen;

    const toTime = (time: number) => `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`


    function openIssueReporter() {
        if (!target || !$video) return;
        // construct github issue request with context
        let currentTime = target.getCurrentTime();
        let currentCaptionIndex = subs.findIndex(sub => currentTime >= sub.start && currentTime <= sub.end);
        console.log(currentCaptionIndex);
        let previousCaption, currentCaption, nextCaption;
        if (currentCaptionIndex > 0) {
            previousCaption = `(${toTime(subs[currentCaptionIndex - 1].start)} - ${toTime(subs[currentCaptionIndex - 1].end)}) ` + subs[currentCaptionIndex - 1].text;
        }
        if (currentCaptionIndex !== -1 && currentCaptionIndex < subs.length - 1) {
            nextCaption = `(${toTime(subs[currentCaptionIndex + 1].start)} - ${toTime(subs[currentCaptionIndex + 1].end)}) ` + subs[currentCaptionIndex + 1].text;
        }
        if (currentCaptionIndex !== -1) {
            currentCaption = `(${toTime(subs[currentCaptionIndex].start)} - ${toTime(subs[currentCaptionIndex].end)}) ` + subs[currentCaptionIndex].text;
        }
        let title = `CC issue | ${$video.name}, ${toTime(currentTime)}`;
        let body = `## Issue template (do not remove)\n**Video**: ${$video.name} <https://youtu.be/${$video.id}>\n⏱️ ${toTime(currentTime)}`
        
        if (previousCaption) body += `\n⏮️CC: ${previousCaption}`;
        if (currentCaption) body += `\n🟦CC: ${currentCaption}`;
        if (nextCaption) body += `\n⏭️CC: ${nextCaption}`;

        body += '\n\n## Describe the problem';
        
        window.open(`https://github.com/cabalex/mcb-sub/issues/new?title=${title}&body=${encodeURIComponent(body)}`);
    }
    
    let fullscreenTooltipShown = localStorage.getItem("mcb-fullscreenTooltipShown") === "true";
    function shownFullscreenTooltip() {
        localStorage.setItem("mcb-fullscreenTooltipShown", "true");
        fullscreenTooltipShown = true;
    }

</script>
<div class="video" bind:this={videoElem}>
    {#if $video}
    <div class="videoInner" transition:slide={{duration: 100, axis: 'y'}} on:focus={hovered} on:mouseover={hovered} on:mousemove={hovered} on:mouseout={clearHover} on:blur={clearHover}>
            <SvelteYouTube
                videoId={$video.id}
                on:play={onPlay}
                on:end={onEnd}
                responsive={true}
                options={{
                    playerVars: {
                        autoplay: 1,
                        fs: 0,
                        playsinline: 1
                    }
                }}
            />
            {#if target}
                {#if process.env.NODE_ENV === 'development' && false}
                <CaptionEditor subtitles={subs} target={target} />
                {/if}
                <SubtitleParser subtitles={subs} target={target} {hover} />
            {/if}
        <button class="fullscreenBtn" on:click={toggleFullscreen} class:visible={hover}>
            {#if fullscreen}
                <img width="24px" height="24px" src={FullscreenExitIcon} alt="Exit Fullscreen" />
            {:else}
                <img width="24px" height="24px" src={FullscreenIcon} alt="Enter Fullscreen" />
            {/if}
        </button>
        {#if !fullscreenTooltipShown}
        <div class="fullscreenTooltip" on:click={shownFullscreenTooltip} transition:slide={{duration: 300, axis: 'y'}}>
            Tap the bottom right of the video to toggle fullscreen
        </div>
        {/if}
    </div>
    {#if issueReportAvailable}
    <button class="reportIssueBtn" on:click={openIssueReporter}>
        ⚠️ Report an issue
    </button>
    {/if}
    {:else}
    <h1>Choose an episode! ➡️</h1>
    {/if}
</div>

<style>
    .video {
        position: relative;
        width: 100%;
        margin: 0 auto;
        max-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .videoInner {
        max-width: calc(16 / 9 * 100vh);
        position: relative;
        width: 100%;
        margin: 0 auto;
        max-height: 100vh;
    }
    .fullscreenBtn {
        position: absolute;
        bottom: 0px;
        right: 0px;
        border-radius: 5px 0 0 0;
        z-index: 100;
        width: 48px;
        height: 48px;
        background-color: #333;
        color: white;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        line-height: 0;
        outline: none !important;
        animation: hide 0.5s forwards;
        transition: opacity 0.2s ease-in-out;
    }
    @keyframes hide {
        0% {
            opacity: 1;
        }
        100% {
            background-color: transparent;
            opacity: 0;
        }
    }
    .fullscreenBtn.visible, .fullscreenBtn:hover {
        opacity: 1;
        animation: none;
    }
    .reportIssueBtn {
        border-radius: 100px;
        align-self: flex-end;
        margin-top: 5px;
    }
    .reportIssueBtn:hover, .reportIssueBtn:active {
        background-color: #333;
    }
    .fullscreenTooltip {
        background-color: #777;
        padding: 5px;
        top: calc(100% + 15px);
        position: absolute;
        right: 0px;
        border-radius: 5px 0 5px 5px;
    }
    .fullscreenTooltip:after {
        content: "";
        position: absolute;
        top: -20px;
        right: 0px;
        border: 10px solid transparent;
        border-bottom-color: #777;
    }
    @media screen and (orientation:landscape) {
        .fullscreenBtn {
            bottom: 0px;
            right: 0px;
        }
    }
    @media screen and (max-width: 900px) {
        h1 {
            display: none;
        }
        .fullscreenTooltip {
            margin: 0 10px;
        }
        .reportIssueBtn {
            position: fixed;
            bottom: calc(10px + var(--safe-area-inset-bottom, 0px));
            right: 10px;
        }
    }
    @media (prefers-color-scheme: light) {
        .fullscreenTooltip {
            background-color: #333;
            color: white;
        }
        .fullscreenTooltip:after {
            border-bottom-color: #333;
        }
        .reportIssueBtn {
            border-color: #aaa;
        }
        .reportIssueBtn:hover {
            background-color: #ccc;
        }
    }
</style>