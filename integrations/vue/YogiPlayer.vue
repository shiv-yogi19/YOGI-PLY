<!--
  YogiPlayer.vue - Vue 3 Component
  Created By Shiv Yogi — One Player. Every Website.
-->

<template>
  <div ref="container" class="yogi-player-vue-wrapper" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const props = defineProps({
  source: { type: String, default: '' },
  poster: { type: String, default: '' },
  title: { type: String, default: 'Yogi_PLY Video' },
  theme: { type: String, default: 'liquid-glass' },
  layout: { type: String, default: 'cinematic' },
  aspectRatio: { type: String, default: '16:9' },
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  loop: { type: Boolean, default: false },
  subtitles: { type: Array, default: () => [] },
  chapters: { type: Array, default: () => [] },
  playlist: { type: Array, default: () => [] },
  watermark: { type: Object, default: () => ({ opacity: 0.28, animationStyle: 'fade-slide' }) },
  features: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['play', 'pause', 'ended', 'timeupdate', 'ready', 'error']);

const container = ref(null);
let player = null;

onMounted(() => {
  if (!container.value) return;

  player = new YogiPLY.Player(container.value, {
    source: props.source,
    poster: props.poster,
    title: props.title,
    theme: props.theme,
    layout: props.layout,
    aspectRatio: props.aspectRatio,
    autoplay: props.autoplay,
    muted: props.muted,
    loop: props.loop,
    subtitles: props.subtitles,
    chapters: props.chapters,
    playlist: props.playlist,
    watermark: props.watermark,
    features: props.features
  });

  player.on('ready', (d) => emit('ready', d));
  player.on('play', () => emit('play'));
  player.on('pause', () => emit('pause'));
  player.on('ended', () => emit('ended'));
  player.on('timeupdate', (t) => emit('timeupdate', t));
  player.on('error', (e) => emit('error', e));
});

watch(() => props.source, (newSrc) => {
  if (player && newSrc) player.setSource(newSrc);
});

watch(() => props.theme, (newTheme) => {
  if (player && newTheme) player.setTheme(newTheme);
});

onBeforeUnmount(() => {
  if (player) {
    player.destroy();
    player = null;
  }
});

defineExpose({
  getPlayer: () => player,
  play: () => player?.play(),
  pause: () => player?.pause(),
  seek: (t) => player?.seek(t),
  setVolume: (v) => player?.setVolume(v)
});
</script>

<style scoped>
.yogi-player-vue-wrapper {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}
</style>
