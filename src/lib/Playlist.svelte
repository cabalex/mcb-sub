<script lang="ts">
    import { type Writable } from "svelte/store";
    import playlists, { type Episode } from "../subtitles.ts";

    export let video: Writable<Episode|null>;

    let playlistIndex = 0;
</script>

<div class="playlist">
    <header>
        <img src={playlists[playlistIndex].icon} />
        <div class="text">
            <h2>{playlists[playlistIndex].title}</h2>
            <p>{playlists[playlistIndex].subtitle}</p>
        </div>
    </header>
    <div class="episodes">
    {#each playlists[playlistIndex].openings as opening, i}
        <button class:active={$video === opening} class="episode" on:click={() => video.set(opening)}>
            <img src={`https://img.youtube.com/vi/${opening.id}/0.jpg`} />
            <div class="text">
                <h3>{opening.name}</h3>
                <div class="tags">
                    <span class="tag">OP</span>
                    <span class="tag" style="background-color: #777">CC: {opening.source}</span>
                </div>
            </div>
        </button>
    {/each}
    {#each playlists[playlistIndex].episodes as episode, i}
        <button class:active={$video === episode} class="episode" on:click={() => video.set(episode)}>
            <img src={`https://img.youtube.com/vi/${episode.id}/0.jpg`} />
            <div class="text">
                <h3>{episode.name}</h3>
                <div class="tags">
                    <span class="tag">Episode {i + 1}</span>
                    <span class="tag" style="background-color: #777">CC: {episode.source}</span>
                </div>
            </div>
        </button>
    {/each}
    {#if playlists[playlistIndex].incomplete}
    <i style="text-align: center; width: 100%; display: block; padding: 10px 0;">Check back next week for new episodes!</i>
    {/if}
    </div>
</div>

<style>
    .playlist {
        background-color: #333;
        width: 100%;
        max-width: 400px;
        height: 100%;
        text-align: left;
        min-height: 300px;

        display: flex;
        flex-direction: column;
    }
    .episodes {
        overflow: auto;
        height: 100%;
        flex-grow: 1;
    }
    @media screen and (max-width: 900px) {
        .playlist {
            max-width: unset;
            height: 100%;
        }
        .episodes {
            height: 100%;
        }
    }
    header {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background-color: #444;
    }
    header img {
        width: 48px;
        height: 48px;
        border-radius: 100%;
    }
    .text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    h2, h3, p {
        color: white;
        line-height: 1.25em;
        margin: 0;
    }
    .episode {
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        border-radius: 0;
        border: 0;
        border-top: 1px solid #555;
        background-color: transparent;
        gap: 10px;
        padding: 10px;
    }
    .episode:hover {
        background-color: #555;
    }
    .episode.active {
        background-color: #666;
    }
    .episode img {
        width: 100px;
        height: calc(100px * 9 / 16);
        flex-shrink: 0;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        overflow: hidden;
        border-radius: 5px;
    }
    .tag {
        background-color: #ED4245;
        color: white;
        padding: 2px 5px;
        border-radius: 5px;
        font-size: 0.75em;
    }
</style>