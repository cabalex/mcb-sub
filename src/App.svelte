<script lang="ts">
  import { writable } from "svelte/store";
  import Playlist from "./lib/Playlist.svelte";
  import Video from "./lib/Video.svelte";

  let currentVideo = writable(null);
  let currentSub = writable(null);
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
