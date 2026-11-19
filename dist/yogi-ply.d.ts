/**
 * Yogi_PLY - TypeScript Definitions
 * Created By Shiv Yogi
 */

export interface WatermarkOptions {
  opacity?: number;
  interval?: number;
  movement?: boolean;
  animationStyle?: 'fade' | 'slide' | 'fade-slide' | 'glow';
  transitionDuration?: number;
  easing?: string;
  color?: string;
  fontSize?: string;
}

export interface SubtitleTrack {
  id?: string;
  label?: string;
  src?: string;
  srclang?: string;
  default?: boolean;
}

export interface Chapter {
  start: number;
  end: number;
  title: string;
}

export interface PlaylistItem {
  title: string;
  src: string;
  poster?: string;
  duration?: string;
  chapters?: Chapter[];
  subtitles?: SubtitleTrack[];
}

export interface PlayerOptions {
  source?: string;
  sources?: Array<{ src: string; label?: string; type?: string }>;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  volume?: number;
  theme?: 'liquid-glass' | 'dark' | 'light' | 'cinematic-oled';
  layout?: 'cinematic' | 'standard' | 'compact' | 'mobile';
  aspectRatio?: string;
  controls?: boolean;
  watermark?: WatermarkOptions;
  features?: Record<string, boolean>;
  subtitles?: SubtitleTrack[];
  chapters?: Chapter[];
  playlist?: PlaylistItem[];
  autoNext?: boolean;
  autoResume?: boolean;
  skipIntro?: { start: number; end: number };
  skipOutro?: { start: number; end: number };
}

export class Player {
  constructor(target: string | HTMLElement, options?: PlayerOptions);
  id: string;
  play(): Promise<void>;
  pause(): void;
  togglePlay(): void;
  toggle(): void;
  restart(): Promise<void>;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  setPlaybackRate(rate: number): void;
  setLoop(loop: boolean): void;
  toggleLoop(): void;
  isLoop(): boolean;
  setQuality(quality: string | number): Promise<void>;
  setSource(source: string): Promise<void>;
  setPoster(url: string): void;
  setTitle(title: string): void;
  setAspectRatio(ratio: string): void;
  setSleepTimer(minutesOrType: number | 'off' | 'end'): void;
  getSleepTimer(): number | 'off' | 'end';
  setRepeatPointA(time?: number): void;
  setRepeatPointB(time?: number): void;
  clearRepeat(): void;
  stepFrame(direction?: number): void;
  setSubtitleDelay(seconds: number): void;
  setAudioDelay(seconds: number): void;
  getDiagnostics(): Record<string, any>;
  requestFullscreen(): Promise<void>;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  toggleFullscreen(): void;
  toggleTheatre(): void;
  togglePip(): Promise<void>;
  setWatermark(options: WatermarkOptions): void;
  setTheme(theme: string): void;
  setChapters(chapters: Chapter[]): Chapter[];
  getChapters(): Chapter[];
  getCurrentChapter(): { chapter: Chapter; index: number } | null;
  nextChapter(): Chapter | null;
  prevChapter(): Chapter | null;
  seekToChapter(index: number): Chapter | null;
  toggleControls(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  getPlaybackRate(): number;
  getQuality(): string | number;
  getQualities(): Array<{ label: string; value: any }>;
  getSubtitle(): string;
  getSubtitles(): SubtitleTrack[];
  isMuted(): boolean;
  isPaused(): boolean;
  isFullscreen(): boolean;
  captureScreenshot(filename?: string): Promise<{ dataUrl: string; blob: Blob; filename: string }>;
  destroy(): void;
  on(event: string, handler: Function): this;
  off(event: string, handler: Function): this;
  once(event: string, handler: Function): this;
  emit(event: string, ...args: any[]): boolean;
}

export class ChapterManager {
  constructor(player: Player, initialChapters?: Chapter[]);
  setChapters(chapters: Chapter[]): Chapter[];
  getChapters(): Chapter[];
  getCurrentChapter(time?: number): { chapter: Chapter; index: number } | null;
  nextChapter(): Chapter | null;
  prevChapter(): Chapter | null;
  seekToChapter(index: number): Chapter | null;
  destroy(): void;
}

export function init(target: string | HTMLElement | NodeList, options?: PlayerOptions): Player | Player[];
export function autoInit(): void;
export const version: string;
export const instances: Map<string, Player>;

declare const YogiPLY: {
  Player: typeof Player;
  init: typeof init;
  autoInit: typeof autoInit;
  instances: Map<string, Player>;
  version: string;
};

export default YogiPLY;
