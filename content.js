const STYLE_ID = '__lihkg_like_dark_mode_style__';
const MAX_SAMPLE_NODES = 60;
const MIN_VISIBLE_WEIGHT = 0.2; // Keep small visible blocks from being ignored in tone estimation.
const LIGHT_TONE_SCORE_THRESHOLD = 0.15; // Average background-vs-text luminance gap indicating a light theme.
const LIGHT_BACKGROUND_RATIO_THRESHOLD = 0.55; // Majority of sampled backgrounds must be bright to classify as light.

const DARK_MODE_CSS = `
:root {
  --lihkg-bg: #151922;
  --lihkg-surface: #1d2330;
  --lihkg-surface-elevated: #252c3a;
  --lihkg-text: #d7dbe3;
  --lihkg-muted-text: #abb4c5;
  --lihkg-border: #343d4f;
  --lihkg-link: #7aa8ff;
  --lihkg-link-hover: #9cc0ff;
  color-scheme: dark !important;
}

html, body {
  background: var(--lihkg-bg) !important;
  color: var(--lihkg-text) !important;
}

main,
article,
section,
nav,
aside,
header,
footer,
form,
table,
tr,
td,
th,
ul,
ol,
li,
blockquote,
pre,
code,
fieldset {
  background-color: var(--lihkg-surface) !important;
}

*,
*::before,
*::after {
  border-color: var(--lihkg-border) !important;
}

p,
span,
label,
small,
strong,
em,
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--lihkg-text) !important;
}

small,
figcaption,
time,
summary {
  color: var(--lihkg-muted-text) !important;
}

a,
a:visited {
  color: var(--lihkg-link) !important;
}

a:hover,
a:focus {
  color: var(--lihkg-link-hover) !important;
}

input,
textarea,
select,
button {
  background: var(--lihkg-surface-elevated) !important;
  color: var(--lihkg-text) !important;
  border: 1px solid var(--lihkg-border) !important;
}

img,
picture > img,
video,
iframe,
svg,
canvas {
  filter: none !important;
  mix-blend-mode: normal !important;
  background: transparent !important;
  opacity: 1 !important;
}
`;

const GENTLE_DARK_MODE_CSS = `
:root {
  --lihkg-bg: #171d27;
  --lihkg-surface: #202836;
  --lihkg-text: #cfd6e2;
  --lihkg-link: #87b1ff;
  --lihkg-link-hover: #a5c4ff;
  color-scheme: dark !important;
}

html, body {
  background: var(--lihkg-bg) !important;
  color: var(--lihkg-text) !important;
}

a,
a:visited {
  color: var(--lihkg-link) !important;
}

a:hover,
a:focus {
  color: var(--lihkg-link-hover) !important;
}
`;

function parseRgbColor(color) {
  if (!color) {
    return null;
  }

  const normalized = color.trim().toLowerCase();
  if (normalized === 'transparent') {
    return null;
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) {
    return null;
  }

  const parts = rgbMatch[1].split(',').map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some((part) => Number.isNaN(part))) {
    return null;
  }

  const [r, g, b, alpha = 1] = parts;
  return {
    r: Math.min(255, Math.max(0, r)),
    g: Math.min(255, Math.max(0, g)),
    b: Math.min(255, Math.max(0, b)),
    a: Math.min(1, Math.max(0, alpha))
  };
}

function toLuminance(channel) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color) {
  if (!color) {
    return null;
  }

  const alpha = color.a === undefined ? 1 : color.a;
  const blend = (channel) => channel * alpha + 255 * (1 - alpha);
  const r = toLuminance(blend(color.r));
  const g = toLuminance(blend(color.g));
  const b = toLuminance(blend(color.b));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getNodeToneScore(node) {
  const style = window.getComputedStyle(node);
  if (style.visibility === 'hidden' || style.display === 'none') {
    return null;
  }

  const bg = parseRgbColor(style.backgroundColor);
  const text = parseRgbColor(style.color);
  const bgLum = getRelativeLuminance(bg);
  const textLum = getRelativeLuminance(text);
  if (bgLum === null || textLum === null) {
    return null;
  }

  const rect = node.getBoundingClientRect();
  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1);
  const area = Math.max(0, Math.min(rect.width * rect.height, viewportArea));
  const areaWeight = Math.max(MIN_VISIBLE_WEIGHT, Math.min(1, area / viewportArea));

  return {
    score: bgLum - textLum,
    bgLum,
    weight: areaWeight
  };
}

function detectPageTone() {
  const nodes = [document.documentElement, document.body].filter(Boolean);
  const candidates = document.querySelectorAll('main, article, section, div, header, footer, nav, aside');
  for (let i = 0; i < candidates.length && nodes.length < MAX_SAMPLE_NODES; i += 1) {
    nodes.push(candidates[i]);
  }

  let weightedScore = 0;
  let totalWeight = 0;
  let lightBackgroundWeight = 0;

  nodes.forEach((node) => {
    const sample = getNodeToneScore(node);
    if (!sample) {
      return;
    }

    weightedScore += sample.score * sample.weight;
    totalWeight += sample.weight;
    if (sample.bgLum > 0.55) {
      lightBackgroundWeight += sample.weight;
    }
  });

  if (!totalWeight) {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'light';
  }

  const averageScore = weightedScore / totalWeight;
  const lightBgRatio = lightBackgroundWeight / totalWeight;
  return averageScore >= LIGHT_TONE_SCORE_THRESHOLD || lightBgRatio >= LIGHT_BACKGROUND_RATIO_THRESHOLD
    ? 'light'
    : 'dark';
}

function toggleLIHKGDarkMode() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
    return;
  }

  const pageTone = detectPageTone();
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = pageTone === 'light' ? DARK_MODE_CSS : GENTLE_DARK_MODE_CSS;
  (document.head || document.documentElement).appendChild(style);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'TOGGLE_LIHKG_DARK_MODE') {
    toggleLIHKGDarkMode();
  }
});
