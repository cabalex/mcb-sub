<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import Playlist from "./lib/Playlist.svelte";
  import Video from "./lib/Video.svelte";
  import subtitles, { type Episode, type Source } from "./subtitles";
  import { onMount } from "svelte";

  let currentVideo: Writable<Episode|null> = writable(null);
  let currentSub: Writable<Source|null> = writable(null);

  function setMediaDetails(video: Episode, sub?: Source) {
    const pageTitle = `${video.name} - Metal Cardbot SUB`;
    const description = `Watch ${video.context.title}: ${video.name} with English subtitles`;
    document.title = pageTitle;
    document.querySelector("meta[property='og:title']")?.setAttribute("content", pageTitle);
    document.querySelector("meta[property='og:description']")?.setAttribute("content", description);
    document.querySelector("meta[property='og:image']")?.setAttribute("content", `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);
  }

  function resetMediaDetails() {
    document.title = "Metal Cardbot SUB";
    document.querySelector("meta[property='og:title']")?.setAttribute("content", "Metal Cardbot SUB");
    document.querySelector("meta[property='og:description']")?.setAttribute("content", "Watch Metal Cardbot with English subtitles");
    document.querySelector("meta[property='og:image']")?.setAttribute("content", "https://i.ytimg.com/vi/1Q3m1V59Lfg/maxresdefault.jpg");
  }

  let urlParams = new URLSearchParams(window.location.search);
  let videoId = urlParams.get("v");
  let subId = urlParams.get("s");
  if (videoId) {
    // find video
    for (let season of subtitles) {
      if (season.sources.length === 0) continue;
      for (let episode of season.episodes) {
        if (episode.id === videoId) {
          const sub = season.sources.find(x => x.path === subId) || season.sources[0];
          currentVideo.set(episode);
          currentSub.set(sub);
          setMediaDetails(episode, sub);
          break;
        }
      }
    }
  }

  let isGoingBack = false;
  onMount(() => {
    currentVideo.subscribe(value => {
      if (!isGoingBack && value !== null && $currentSub !== null) {
        const query = `?v=${value.id}&s=${$currentSub.path}`;
        if (location.search === query) {
          window.history.replaceState({video: value, sub: $currentSub}, "", query);
        } else {
          window.history.pushState({video: value, sub: $currentSub}, "", query);
        }
        setMediaDetails(value, $currentSub);
      }
    });
    currentSub.subscribe(value => {
      if (!isGoingBack && value !== null && $currentVideo !== null) {
        const query = `?v=${$currentVideo.id}&s=${value.path}`;
        if (location.search === query) {
          window.history.replaceState({video: $currentVideo, sub: value}, "", query);
        } else {
          window.history.pushState({video: $currentVideo, sub: value}, "", query);
        }
        setMediaDetails($currentVideo, value);
      }
    });
  });

  window.addEventListener("popstate", (state) => {
    const poppedState = state.state;

    isGoingBack = true;
    if (poppedState) {
      if (poppedState.video) {
        currentVideo.set(poppedState.video);
      } else {
        resetMediaDetails();
        currentVideo.set(null);
      }
      if (poppedState.sub) {
        currentSub.set(poppedState.sub);
      } else {
        resetMediaDetails();
        currentSub.set(null);
      }
    } else {
      currentVideo.set(null);
      currentSub.set(null);
      window.history.replaceState(null, "", "/");
      resetMediaDetails();
    }
    isGoingBack = false;
  })

</script>

<main>
  <Video video={currentVideo} source={currentSub} />
  <Playlist video={currentVideo} source={currentSub} />
</main>

<style>
  main {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    height: calc(100% - 20px);
    width: calc(100% - 20px);
    padding: 10px;
  }
  @media screen and (max-width: 900px) {
    main {
      background: black;
      flex-direction: column;
      padding: 0;
      gap: 0;
      height: 100%;
      width: 100%;
    }
  }
</style>
