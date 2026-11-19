/**
 * Yogi_PLY - Playlist and Chapters Manager
 * Created By Shiv Yogi
 */

import { createElement, ListenerTracker } from '../utils/dom.js';
import { escapeHtml } from '../utils/sanitize.js';
import { icons } from '../icons/svgIcons.js';

export class PlaylistManager {
  /**
   * @param {HTMLElement} container
   * @param {Player} player
   * @param {Array} items
   * @param {boolean} autoNext
   */
  constructor(container, player, items = [], autoNext = true) {
    this.container = container;
    this.player = player;
    this.state = player.state;
    this.items = Array.isArray(items) ? [...items] : [];
    this.currentIndex = 0;
    this.autoNext = autoNext;
    this.drawer = null;
    this.isOpen = false;
    this.tracker = new ListenerTracker();

    this.init();
  }

  init() {
    this.state.set('playlist', this.items);
    this.state.set('playlistIndex', this.currentIndex);

    // Auto next on video ended
    this.state.on('ended', () => {
      if (this.autoNext && this.hasNext()) {
        this.next();
      }
    });

    this.renderDrawer();
  }

  renderDrawer() {
    this.drawer = createElement('div', {
      className: 'yogi-ply-playlist-drawer',
      'aria-label': 'Video Playlist',
      role: 'dialog'
    });

    const header = createElement('div', {
      className: 'yogi-ply-playlist-header',
      innerHTML: `
        <span class="yogi-ply-playlist-title">${icons.playlist} Playlist (${this.items.length})</span>
        <button class="yogi-ply-btn yogi-ply-btn-close" aria-label="Close Playlist">${icons.close}</button>
      `
    });

    const closeBtn = header.querySelector('.yogi-ply-btn-close');
    this.tracker.add(closeBtn, 'click', () => this.close());

    const list = createElement('div', { className: 'yogi-ply-playlist-list' });

    this.items.forEach((item, index) => {
      const card = createElement('button', {
        className: `yogi-ply-playlist-item ${index === this.currentIndex ? 'yogi-ply-item-active' : ''}`,
        innerHTML: `
          <div class="yogi-ply-playlist-thumb">
            ${item.poster ? `<img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title || '')}" />` : '<div class="yogi-ply-thumb-placeholder"></div>'}
            <span class="yogi-ply-thumb-index">${index + 1}</span>
          </div>
          <div class="yogi-ply-playlist-meta">
            <span class="yogi-ply-item-title">${escapeHtml(item.title || `Video ${index + 1}`)}</span>
            ${item.duration ? `<span class="yogi-ply-item-duration">${escapeHtml(item.duration)}</span>` : ''}
          </div>
        `
      });

      this.tracker.add(card, 'click', () => {
        this.playIndex(index);
        this.close();
      });

      list.appendChild(card);
    });

    this.drawer.appendChild(header);
    this.drawer.appendChild(list);
    this.container.appendChild(this.drawer);
  }

  updateActiveCard() {
    if (!this.drawer) return;
    const cards = this.drawer.querySelectorAll('.yogi-ply-playlist-item');
    cards.forEach((card, idx) => {
      if (idx === this.currentIndex) {
        card.classList.add('yogi-ply-item-active');
      } else {
        card.classList.remove('yogi-ply-item-active');
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.drawer.classList.add('yogi-ply-playlist-open');
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('yogi-ply-playlist-open');
  }

  hasNext() {
    return this.currentIndex < this.items.length - 1;
  }

  hasPrev() {
    return this.currentIndex > 0;
  }

  next() {
    if (this.hasNext()) {
      this.playIndex(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.hasPrev()) {
      this.playIndex(this.currentIndex - 1);
    }
  }

  playIndex(index) {
    if (index < 0 || index >= this.items.length) return;
    this.currentIndex = index;
    const item = this.items[index];

    this.state.set('playlistIndex', index);
    this.updateActiveCard();

    this.player.setSource(item.src);
    if (item.poster) {
      this.player.setPoster(item.poster);
    }

    if (item.subtitles && Array.isArray(item.subtitles)) {
      item.subtitles.forEach((s) => this.player.subtitles.addTrack(s));
    }

    if (item.chapters && Array.isArray(item.chapters)) {
      this.player.setChapters(item.chapters);
    }

    this.player.play().catch(() => {});
    this.player.emit('playlistitemchange', { index, item });
  }

  destroy() {
    this.tracker.destroy();
    if (this.drawer && this.drawer.parentNode) {
      this.drawer.parentNode.removeChild(this.drawer);
    }
    this.items = [];
  }
}
