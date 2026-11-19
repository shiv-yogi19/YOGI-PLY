/**
 * Yogi_PLY - Universal Liquid Glass Video Player Library
 * Created By Shiv Yogi
 * Tagline: One Player. Every Website.
 */

import './themes/styles.css';
import { Player } from './core/Player.js';
import { THEMES } from './themes/themes.js';
import { icons } from './icons/svgIcons.js';
import { parseSrt, srtToVtt } from './subtitles/SrtParser.js';

export const version = '1.0.0';
export const instances = new Map();

/**
 * Programmatically initialize one or more player instances
 * @param {string|HTMLElement|NodeList} target
 * @param {Object} options
 * @returns {Player|Player[]}
 */
export function init(target, options = {}) {
  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);
    if (elements.length === 1) {
      const player = new Player(elements[0], options);
      instances.set(player.id, player);
      return player;
    }
    return Array.from(elements).map((el) => {
      const player = new Player(el, options);
      instances.set(player.id, player);
      return player;
    });
  } else if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target).map((el) => {
      const player = new Player(el, options);
      instances.set(player.id, player);
      return player;
    });
  } else if (target instanceof HTMLElement) {
    const player = new Player(target, options);
    instances.set(player.id, player);
    return player;
  }
  return null;
}

/**
 * Automatically find elements with .yogi-ply and initialize with data-* attributes
 */
export function autoInit() {
  const elements = document.querySelectorAll('.yogi-ply:not([data-yogi-initialized])');
  elements.forEach((el) => {
    // Avoid re-initialization
    el.setAttribute('data-yogi-initialized', 'true');

    const source = el.getAttribute('data-video') || el.getAttribute('data-src') || '';
    const poster = el.getAttribute('data-poster') || '';
    const theme = el.getAttribute('data-theme') || 'liquid-glass';
    const autoplay = el.hasAttribute('data-autoplay');
    const loop = el.hasAttribute('data-loop');
    const watermarkAttr = el.getAttribute('data-watermark');
    const watermark = watermarkAttr !== null ? watermarkAttr !== 'false' : true;

    // Parse subtitle data attribute if present
    const subSrc = el.getAttribute('data-subtitles');
    const subtitles = subSrc ? [{ src: subSrc, label: 'Default', srclang: 'en', default: true }] : [];

    const player = new Player(el, {
      source,
      poster,
      theme,
      autoplay,
      loop,
      watermark,
      subtitles
    });

    instances.set(player.id, player);
  });
}

// Auto-run autoInit when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

import { inspectMediaCompatibility, FORMAT_DEFINITIONS } from './core/MediaCompatibility.js';
import { ChapterManager } from './chapters/ChapterManager.js';

// Global library object
const YogiPLY = {
  Player,
  init,
  autoInit,
  instances,
  version,
  THEMES,
  icons,
  ChapterManager,
  parseSrt,
  srtToVtt,
  inspectMediaCompatibility,
  FORMAT_DEFINITIONS
};

if (typeof window !== 'undefined') {
  window.YogiPLY = YogiPLY;
}

export { Player, ChapterManager, THEMES, icons, parseSrt, srtToVtt, inspectMediaCompatibility, FORMAT_DEFINITIONS };
export default YogiPLY;
