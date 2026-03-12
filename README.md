# Softgames Pixi Assignment

Pixi.js + TypeScript assignment implementing three mini-scenes:

- **Ace of Shadows**: card–based puzzle with stacks and card movement rules.
- **Magic Words**: dialogue system backed by an HTTP API and emoji/text rendering.
- **Phoenix Flame**: particle-based fire effect using Pixi and GSAP-style timing.

### Setup

- **Install dependencies**

```bash
npm install
```

- **Run dev server**

```bash
npm run dev
```

- **Build for production**

```bash
npm run build
```

### GitHub Pages deployment (CI/CD)

This repo is configured to deploy to **GitHub Pages via GitHub Actions**, mirroring the setup from the `pixelated-slot-game` project.

- **Workflow file**: `.github/workflows/deploy-pages.yml`
- **Build output**: Vite builds into the `dist/` directory, which is uploaded as the Pages artifact.
- **Branch used for deployment**: `main`

To trigger a deployment:

1. Commit your changes on `development` (or feature branches) and push.
2. Merge your changes into `main`:

   ```bash
   git checkout development
   git pull origin development

   git checkout main
   git pull origin main
   git merge development
   git push origin main
   ```

3. Pushing to `main` starts the **Deploy to GitHub Pages** workflow, which:
   - Installs dependencies (`npm ci`)
   - Runs `npm run build`
   - Uploads `dist/` and deploys it to the `github-pages` environment using `actions/deploy-pages`.

Make sure your repository’s **Settings → Pages** is configured to use **GitHub Actions** as the source.

### Project structure

Softgames-Pixi-Assignment/
├─ package.json
├─ README.md
├─ tsconfig.json
├─ vite.config.ts
├─ public/                 # static assets (images, fonts, etc.)
│  └─ ... 
├─ assets/                 # JSON/config/atlas data used by the game
│  ├─ manifest.json
│  ├─ backgrounds/
│  │  ├─ CardsBackground.webp
│  │  └─ MagicWordsBackground.webp
│  ├─ cards/
│  ├─ fireSprites/
│  └─ magicWords/
└─ src/
   ├─ main.ts              # entry point; bootstraps AppManager
   ├─ core/
   │  ├─ AppManager.ts     # owns Pixi Application, scene switching
   │  └─ Scene.ts          # base scene class
   ├─ scenes/
   │  ├─ MenuScene.ts         # menu scene that lets you choose between the three tasks
   │  ├─ AceOfShadowsScene.ts # orchestrates Ace of Shadows card stacks, movement, and layout
   │  ├─ MagicWordsScene.ts   # runs the Magic Words dialogue flow and input handling
   │  └─ PhoenixFlameScene.ts # wraps the Phoenix Flame fire effect demo as a scene
   ├─ logic/
   │  ├─ aceOfShadows/
   │  │  └─ CardStackLogic.ts     # pure rules and state transitions for card stacks
   │  ├─ magicWords/
   │  │  └─ MagicWordsLogic.ts    # parses script data and exposes dialogue view models
   │  └─ phoenixFlame/
   │     ├─ FireLogic.ts          # handles fire particle spawning and lifetime updates
   │     └─ PhoenixFlameConfig.ts # tunable config values for the flame effect
   ├─ views/
   │  ├─ aceOfShadows/
   │  │  ├─ CardStackView.ts      # Pixi container that renders and animates card stacks
   │  │  └─ CardPool.ts           # simple object pool for reusing card sprites
   │  ├─ magicWords/
   │  │  ├─ MagicWordsView.ts     # Pixi layout for dialogue text, avatars, and emojis
   │  │  ├─ Avatar.ts             # helper view for a single speaker avatar
   │  │  ├─ Dialogue.ts           # helper view for the dialogue text bubble
   │  │  └─ Emoji.ts              # helper view for the floating emoji graphic
   │  └─ phoenixFlame/
   │     └─ FireView.ts           # Pixi view responsible for drawing the fire particles
   └─ services/
      └─ ApiClient.ts             # small HTTP client used to fetch Magic Words dialogue data
