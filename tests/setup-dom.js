/**
 * Yogi_PLY - Shared Mock DOM Test Setup
 * Created By Shiv Yogi
 */

export class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this._classes = new Set();
    this._attributes = {};
    this._listeners = {};

    this.style = {
      _styles: {},
      setProperty: (k, v) => { this.style._styles[k] = String(v); },
      getPropertyValue: (k) => this.style._styles[k] || '',
      removeProperty: (k) => { delete this.style._styles[k]; }
    };

    this.currentTime = 0;
    this.duration = 100;
    this.volume = 1;
    this.muted = false;
    this.paused = true;
    this.playbackRate = 1;
    this.src = '';
    this.currentSrc = '';
    this.poster = '';
    this.innerHTML = '';
    this.textContent = '';
  }

  get classList() {
    return {
      add: (...classes) => classes.forEach((c) => this._classes.add(c)),
      remove: (...classes) => classes.forEach((c) => this._classes.delete(c)),
      contains: (c) => this._classes.has(c),
      toggle: (c) => (this._classes.has(c) ? this._classes.delete(c) : this._classes.add(c))
    };
  }

  get className() {
    return Array.from(this._classes).join(' ');
  }

  set className(val) {
    this._classes.clear();
    if (val) val.split(/\s+/).forEach((c) => this._classes.add(c));
  }

  setAttribute(name, value) {
    this._attributes[name] = String(value);
  }

  getAttribute(name) {
    return this._attributes[name] || null;
  }

  hasAttribute(name) {
    return name in this._attributes;
  }

  removeAttribute(name) {
    delete this._attributes[name];
  }

  appendChild(child) {
    if (!child) return child;
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    if (child) child.parentNode = null;
    return child;
  }

  insertBefore(newNode, refNode) {
    const idx = this.children.indexOf(refNode);
    if (idx !== -1) {
      this.children.splice(idx, 0, newNode);
    } else {
      this.children.push(newNode);
    }
    if (newNode) newNode.parentNode = this;
    return newNode;
  }

  querySelector(selector) {
    if (selector === 'video') {
      return this.children.find((c) => c.tagName === 'VIDEO') || null;
    }
    return new MockDOMElement('div');
  }

  querySelectorAll() {
    return [];
  }

  closest() {
    return null;
  }

  contains(node) {
    if (node === this) return true;
    return this.children.some((c) => c === node || (c.contains && c.contains(node)));
  }

  matches() {
    return false;
  }

  getBoundingClientRect() {
    return { top: 0, left: 0, width: 800, height: 450, bottom: 450, right: 800 };
  }

  addEventListener(type, handler) {
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(handler);
  }

  removeEventListener(type, handler) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter((fn) => fn !== handler);
    }
  }

  dispatchEvent(event) {
    const handlers = this._listeners[event.type] || [];
    handlers.forEach((h) => h(event));
  }

  canPlayType(mime) {
    if (typeof mime !== 'string') return '';
    if (mime.includes('mp4') || mime.includes('webm') || mime.includes('ogg') || mime.includes('quicktime')) return 'probably';
    return '';
  }

  play() {
    this.paused = false;
    this.dispatchEvent({ type: 'play' });
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent({ type: 'pause' });
  }

  load() {
    this.dispatchEvent({ type: 'loadstart' });
    this.dispatchEvent({ type: 'loadedmetadata' });
  }
}

export function setupMockDOM() {
  globalThis.HTMLElement = MockDOMElement;
  globalThis.HTMLVideoElement = MockDOMElement;
  globalThis.NodeList = Array;

  globalThis.document = {
    createElement: (tag) => new MockDOMElement(tag),
    querySelector: (sel) => {
      if (sel === '#non-existent') return null;
      return new MockDOMElement('div');
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    pictureInPictureEnabled: true,
    fullscreenElement: null,
    body: new MockDOMElement('body'),
    head: new MockDOMElement('head')
  };

  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { origin: 'http://localhost' },
    document: globalThis.document
  };

  globalThis.localStorage = {
    _data: {},
    getItem: (k) => globalThis.localStorage._data[k] || null,
    setItem: (k, v) => { globalThis.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete globalThis.localStorage._data[k]; }
  };
}
