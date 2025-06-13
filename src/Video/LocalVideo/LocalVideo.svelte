<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let video: HTMLVideoElement | null = null;

	const dispatch = createEventDispatcher();
	$: {
		if (video) {
			video.addEventListener('play', () => {
				dispatch('play', {
					target: {
						getCurrentTime: () => video?.currentTime,
						getDuration: () => video?.duration,
						getPlayerState: () => (video?.paused ? 2 : 1),
						playVideo: () => video?.play(),
						pauseVideo: () => video?.pause(),
						seekTo: (seconds: number) => {
							if (video) video.currentTime = seconds;
						},
						playerInfo: {
							videoData: {
								video_id: 'local'
							}
						}
					}
				});
			});
		}
	}
</script>

<video src="./local.mp4" bind:this={video} autoplay controls />

<style>
	video {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
