/**
 * useYogiPlayer.js - React Custom Hook for Yogi_PLY
 * Created By Shiv Yogi
 */

import { useRef, useEffect, useState } from 'react';
import YogiPLY from 'yogi-ply';

export function useYogiPlayer(targetRef, options = {}) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!targetRef.current) return;

    const player = new YogiPLY.Player(targetRef.current, options);
    playerRef.current = player;

    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('timeupdate', (time) => setCurrentTime(time));
    player.on('loadedmetadata', (dur) => setDuration(dur));

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  return {
    player: playerRef.current,
    isPlaying,
    currentTime,
    duration,
    play: () => playerRef.current?.play(),
    pause: () => playerRef.current?.pause(),
    seek: (sec) => playerRef.current?.seek(sec),
    setVolume: (v) => playerRef.current?.setVolume(v)
  };
}
