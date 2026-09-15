# PPW Homepage Loader — Known-Good Reference

This folder contains the known-good Paw Prints Weekly homepage opening animation.

## Source
- Original working version: commit `b9d2e25598cba7b4f4f84fc200e61a42026884ba`
- Homepage: `index.html`
- Loader behavior: `script.js`

## Contents
- `homepage-loader.html` — loader markup
- `homepage-loader.css` — loader styling and animation keyframes
- `README.md` — reference notes

## Important
Do not redesign or patch this loader casually. If the homepage opening animation breaks, use these files as the canonical reference and restore the original structure/animation rather than layering additional overrides on top.

## Animation
The known-good version includes:
- Three staggered paw-print entrances
- Background rings
- Tiger logo reveal
- PAW PRINTS / WEEKLY text reveal
- Gold progress rule animation
- Glen A. Wilson High School text reveal

The original `script.js` loader lifecycle used a 2600ms startup timeout.
