const STYLE_ID = '__lihkg_like_dark_mode_style__';

const DARK_MODE_CSS = `
:root {
  color-scheme: dark !important;
}

html, body {
  background: #1a1d21 !important;
  color: #d7dce3 !important;
}

body *,
body *::before,
body *::after {
  background-color: transparent !important;
  color: inherit;
  border-color: #39414d !important;
}

a,
a:visited {
  color: #77a8ff !important;
}

a:hover,
a:focus {
  color: #9bc0ff !important;
}

input,
textarea,
select,
button {
  background: #262b31 !important;
  color: #d7dce3 !important;
  border: 1px solid #39414d !important;
}

img,
video,
iframe,
svg,
canvas {
  filter: brightness(0.92) contrast(1.05);
}
`;

function toggleLihkgLikeDarkMode() {
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
    toggleLihkgLikeDarkMode();
  }
});
