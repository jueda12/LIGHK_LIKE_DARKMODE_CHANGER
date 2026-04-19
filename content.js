const STYLE_ID = '__lihkg_like_dark_mode_style__';

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
picture,
picture *,
video,
iframe,
svg,
canvas {
  filter: none !important;
  mix-blend-mode: normal !important;
  background: transparent !important;
  opacity: 1 !important;
}

[style*="background-image"] {
  background-color: transparent !important;
}
`;

function toggleLIHKGDarkMode() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = DARK_MODE_CSS;
  (document.head || document.documentElement).appendChild(style);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'TOGGLE_LIHKG_DARK_MODE') {
    toggleLIHKGDarkMode();
  }
});
