# Korean War Tactics (한국전쟁 전략)

Browser-based Korean War strategy simulation (1945–1953): 30 historical scenarios, commander mode with situation reports, grid tactics, and illustrated scenes.

## Run locally

ES modules require a local server (do not open `index.html` via `file://`).

**Windows:** double-click `start.bat`

**Or:**

```bash
cd korean_war
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

## Features

- 30 campaign scenarios across 6 chapters
- Commander mode: issue orders, units auto-resolve movement and combat
- Capture / hold / escape / defeat missions with balanced victory conditions
- Bilingual UI (Korean / English)
- Offline PWA (`manifest.json`)

## Tech

Static HTML/CSS/JS — no build step. Assets under `assets/scenes`, `assets/maps`, `assets/portraits`.

## License

Educational / personal project. Scene art generated for this game.
