<script lang="ts">
    import SvelteYouTube from "../assets/SvelteYouTube.svelte";
    import { type Episode } from "../subtitles.ts";
    import CaptionEditor from "./CaptionEditor.svelte";
    import SubtitleParser from "./SubtitleParser.svelte";
    import FullscreenIcon from "../assets/fullscreen.svg";
    import FullscreenExitIcon from "../assets/fullscreen-exit.svg";
    
    export let video: Episode|null;
    
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

    function parseTimestamp(timestamp: string) {
        let [hours, minutes, seconds] = timestamp.replace(",", ".").split(":").map(parseFloat);
        return hours * 3600 + minutes * 60 + seconds;
    }

    let subs = [];
    async function fetchSubtitle(url) {
        subs = [];
        let response = await fetch(url);
        if (!response.ok) return console.error("Failed to fetch subtitle");
        let data = await response.text();
        let lines = data.split("\n");

        subs = [];
        let sub = {start: -1, end: 1, text: ''};
        let i = 0;
        while (i < lines.length) {
            if (lines[i].includes("-->")) {
                let [start, end] = lines[i].split(" --> ").map(parseTimestamp);
                sub.start = start;
                sub.end = end;
                i++;
                while (lines[i].trim() !== "") {
                    sub.text += lines[i] + "\n";
                    i++;
                }
                subs.push(sub);
                sub = {start: -1, end: 1, text: ''};
            }
            i++;
        }
        console.log(subs)
    }

    $: {
        if (video) {
            fetchSubtitle(`./sub/${video.id}.srt`);
        } else {
            subs = [];
        }
    }

    let videoElem;
    function toggleFullscreen() {
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

</script>
<div class="video" bind:this={videoElem} on:focus={hovered} on:mouseover={hovered} on:mousemove={hovered} on:mouseout={clearHover} on:blur={clearHover}>
    <div class="videoInner">
        {#if video}
            <SvelteYouTube
                videoId={video.id}
                on:play={onPlay}
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
                {#if process.env.NODE_ENV === 'development'}
                <CaptionEditor subtitles={subs} target={target} />
                {/if}
                <SubtitleParser subtitles={subs} target={target} {hover} />
            {/if}
        {/if}
    </div>
    {#if video}
    <button class="fullscreenBtn" on:click={toggleFullscreen} class:visible={hover}>
        {#if fullscreen}
            <img width="24px" height="24px" src={FullscreenExitIcon} alt="Exit Fullscreen" />
        {:else}
            <img width="24px" height="24px" src={FullscreenIcon} alt="Enter Fullscreen" />
        {/if}
    </button>
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
        bottom: 10px;
        right: 10px;
        z-index: 100;
        width: 48px;
        height: 48px;
        background-color: #333;
        color: white;
        border: none;
        padding: 5px 10px;
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
    @media screen and (orientation:landscape) {
        .fullscreenBtn {
            bottom: 0px;
            right: 0px;
            border-radius: 0;
        }
    }
    @media screen and (max-width: 900px) {
        h1 {
            display: none;
        }
    }
</style>