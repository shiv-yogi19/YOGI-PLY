/**
 * YogiPlayer.jsx - Production React Component for Yogi_PLY
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import YogiPLY from 'yogi-ply';
import 'yogi-ply/dist/yogi-ply.min.css';

const YogiPlayer = forwardRef(function YogiPlayer(
  {
    source = '',
    poster = '',
    title = 'Yogi_PLY Video',
    theme = 'liquid-glass',
    layout = 'cinematic',
    autoplay = false,
    muted = false,
    loop = false,
    subtitles = [],
    chapters = [],
    playlist = [],
    watermark = { opacity: 0.28, animationStyle: 'fade-slide' },
    features = {},
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
    className = '',
    style = {}
  },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // Expose player instance methods to parent ref
  useImperativeHandle(ref, () => ({
    getPlayer: () => playerRef.current,
    play: () => playerRef.current?.play(),
    pause: () => playerRef.current?.pause(),
    seek: (sec) => playerRef.current?.seek(sec),
    setVolume: (v) => playerRef.current?.setVolume(v),
    setSource: (s) => playerRef.current?.setSource(s)
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize player
    const player = new YogiPLY.Player(containerRef.current, {
      source,
      poster,
      title,
      theme,
      layout,
      autoplay,
      muted,
      loop,
      subtitles,
      chapters,
      playlist,
      watermark,
      features
    });

    playerRef.current = player;

    // Attach callbacks
    if (onPlay) player.on('play', onPlay);
    if (onPause) player.on('pause', onPause);
    if (onEnded) player.on('ended', onEnded);
    if (onTimeUpdate) player.on('timeupdate', onTimeUpdate);
    if (onError) player.on('error', onError);

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  // Update dynamic properties
  useEffect(() => {
    if (playerRef.current && source) {
      playerRef.current.setSource(source);
    }
  }, [source]);

  useEffect(() => {
    if (playerRef.current && theme) {
      playerRef.current.setTheme(theme);
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={`yogi-player-react-container ${className}`}
      style={{ width: '100%', maxWidth: '960px', margin: '0 auto', ...style }}
    />
  );
});

export default YogiPlayer;
