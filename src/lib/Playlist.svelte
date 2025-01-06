<script lang="ts">
    import { type Writable } from "svelte/store";
    import playlists, { type Episode, type Source, type Season } from "../subtitles.ts";
    import ChevronDown from "../assets/chevron-down.svg";
    import unknownSeason from "../assets/unknown.png";
    import { slide } from "svelte/transition";

    export let video: Writable<Episode|null>;
    export let source: Writable<Source|null>;

    $: {
        if ($source === null && playlists[playlistIndex].sources.length > 0) {
            source.set(playlists[playlistIndex].sources[0]);
        }
    }

    function playVideo(v: Episode) {
        video.set(v);
        // @ts-ignore
        gtag('event', 'play', {
            'event_category': 'video',
            'event_label': v.name,
            'source': $source ? `${$source.name} (${$source.language})` : 'Unknown',
            'playlist': playlists[playlistIndex].title,
            'value': v.id
        });
    }

    function changeSeason(playlist: Season) {
        seasonDropdownOpen = false;
        playlistIndex = playlists.indexOf(playlist);
        if (playlists[playlistIndex].sources.length > 0) {
            source.set(playlists[playlistIndex].sources[0]);
        }
    }

    let playlistIndex = 0;
    if ($video !== null && !playlists[playlistIndex].episodes.includes($video) && !playlists[playlistIndex].openings.includes($video)) {
        // get the correct season
        playlistIndex = playlists.findIndex(playlist => playlist.episodes.includes($video) || playlist.openings.includes($video));
    }
    let seasonDropdownOpen = false;
</script>

<div class="playlist">
    <button class="header" on:click={() => seasonDropdownOpen = !seasonDropdownOpen}>
        {#key playlistIndex}
        <img class="poster" alt={playlists[playlistIndex].title} src={playlists[playlistIndex].icon} />
        {/key}
        <div class="text">
            <h2>{playlists[playlistIndex].title}</h2>
            <p>{playlists[playlistIndex].subtitle}</p>
        </div>
        <img style={`transform: rotate(${seasonDropdownOpen ? -180 : 0}deg)`} src={ChevronDown} alt="Change season" />
    </button>
    {#if seasonDropdownOpen}
    <div class="headerOptions" transition:slide={{duration: 200}}>
        {#each playlists.filter((_, i) => i !== playlistIndex) as playlist}
            <button class="headerOption" on:click={changeSeason.bind(null, playlist)}>
                <img class="poster" alt={playlist.title} src={playlist.icon} />
                <div class="text">
                    <h2>{playlist.title}</h2>
                    <p>{playlist.subtitle}</p>
                </div>
            </button>
        {/each}
    </div>
    {/if}
    {#if playlists[playlistIndex].sources.length > 1}
    <select bind:value={$source} placeholder="Select a dub">
        {#each playlists[playlistIndex].sources as source}
            <option value={source}>{source.name} ({source.language})</option>
        {/each}
    </select>
    {:else if playlists[playlistIndex].sources.length === 1}
    <p class="dub">📜 {playlists[playlistIndex].sources[0].name} ({playlists[playlistIndex].sources[0].language})
        {#if playlists[playlistIndex].sources[0].credits}
        by
        {#each playlists[playlistIndex].sources[0].credits as credit}
            <a href={credit.link} target="_blank">{credit.name}</a>
        {/each}
        {/if}
    </p>
    {/if}
    <div class="episodes">
    {#each playlists[playlistIndex].openings as opening, i}
        <button class:active={$video === opening} class="episode" on:click={() => playVideo(opening)}>
            <img alt={opening.name} src={`https://img.youtube.com/vi/${opening.id}/0.jpg`} />
            <div class="text">
                <h3>{opening.name}</h3>
                <div class="tags">
                    <span class="tag">OP</span>
                </div>
            </div>
        </button>
    {/each}
    {#each playlists[playlistIndex].episodes as episode, i}
        <button class:active={$video === episode} class="episode" on:click={() => playVideo(episode)}>
            <img alt={episode.name} src={`https://img.youtube.com/vi/${episode.id}/0.jpg`} />
            <div class="text">
                <h3>{episode.name}</h3>
                <div class="tags">
                    <span class="tag">Episode {i + 1}</span>
                </div>
            </div>
        </button>
    {/each}
    {#if playlists[playlistIndex].incomplete && playlistIndex !== 2}
    <i style="text-align: center; width: 100%; display: block; padding: 10px 0;">Check back next week for new episodes!</i>
    {/if}
    {#if playlistIndex === 2}
    <div class="unknownSeason">
        <img src={unknownSeason} alt="A Cardbot from Season 2" style="max-height: min(50vh, 200px); max-width: 70%" />
        <i style="text-align: center; width: 100%; display: block; padding: 10px 0;">We don't know when the next episode will premiere on YouTube.<br>Check back later!</i>
    </div>
    {/if}
    </div>
</div>

<style>
    .unknownSeason {
        flex-shrink: 1;
        padding-top: 10vh;
        margin: auto;
        text-align: center;
        max-width: 70%;
    }
    .playlist {
        width: 100%;
        max-width: 400px;
        height: 100%;
        text-align: left;
        min-height: 300px;

        position: relative;
        display: flex;
        flex-direction: column;
    }
    .episodes {
        background-color: #333;
        overflow: auto;
        height: 100%;
        flex-grow: 1;
    }
    .dub {
        padding: 10px;
        background-color: #1a1a1a;
    }
    .dub a {
        color: white;
    }
    .dub a:not(:last-child)::after {
        content: ', ';
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
    button.header, button.headerOption {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 0 10px;
        background-color: #444;
        border-radius: 10px 10px 0 0;
        width: 100%;
        height: 75px;
        flex-shrink: 0;
    }
    button.header:focus:not(:focus-visible) {
        outline: none;
    }
    button.header img.poster, button.headerOption img.poster {
        width: 48px;
        height: 48px;
        border-radius: 100%;
    }
    button.header img:not(.poster) {
        width: 36px;
        height: 36px;
        transition: transform 0.2s ease-in-out;
    }
    .text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-grow: 1;
    }
    .headerOptions {
        z-index: 20;
        position: absolute;
        top: 75px;
        left: 0;
        width: 100%;
        box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
    }
    button.headerOption {
        border-radius: 0;
        background-color: #555;
    }
    h2, h3, p {
        color: white;
        line-height: 1.25em;
        margin: 0;
    }
    select {
        padding: 5px;
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
        position: sticky;
        bottom: 0px;
        top: 0px;
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
    .episode.active img {
        filter: brightness(0.5);
    }
    .episode.active:after {
        content: '▶️';
        position: absolute;
        top: 50%;
        left: 60px;
        font-size: 24px;
        transform: translateY(-50%) translateX(-50%);
        color: white;
        border-radius: 5px;
    }
    .tag {
        background-color: #ED4245;
        color: white;
        padding: 2px 5px;
        border-radius: 5px;
        font-size: 0.75em;
    }
    @media (prefers-color-scheme: light) {
        .episodes {
            background-color: #ddd;
        }
        .dub {
            background-color: #bbb;
        }
        button.header {
            background-color: #ccc;
        }
        button.headerOption {
            background-color: #bbb;
        }
        button.header img:not(.poster) {
            filter: invert(1);
        }
        .episode {
            border-top: 1px solid #bbb;
        }
        .episode:hover {
            background-color: #ccc;
        }
        .episode.active {
            background-color: #bbb;
        }
        h2, h3, p {
            color: inherit;
        }
    }
</style>
