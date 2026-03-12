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

- `src/main.ts`: entry point, bootstraps the Pixi application via `AppManager`.
- `src/core/AppManager.ts`: owns the Pixi `Application`, handles scene switching.
- `src/core/Scene.ts`: base scene class with a root container and lifecycle hooks.
- `src/scenes/MenuScene.ts`: in-game menu (links to the three tasks).
- `src/scenes/AceOfShadowsScene.ts`: scene for the **Ace of Shadows** task.
- `src/scenes/MagicWordsScene.ts`: scene for the **Magic Words** task.
- `src/scenes/PhoenixFlameScene.ts`: scene for the **Phoenix Flame** task.
- `src/logic/aceOfShadows/CardStackLogic.ts`: pure card stack state and rules for Ace of Shadows.
- `src/logic/magicWords/MagicWordsLogic.ts`: parsing and dialogue logic for Magic Words.
- `src/logic/phoenixFlame/FireLogic.ts`: particle emission and lifetime rules for Phoenix Flame.
- `src/views/aceOfShadows/CardStackView.ts`: Pixi view for rendering card stacks.
- `src/views/magicWords/MagicWordsView.ts`: Pixi view for text + emoji dialogue.
- `src/views/phoenixFlame/FireView.ts`: Pixi view for the fire effect.
- `src/services/ApiClient.ts`: HTTP client for the Magic Words API.
- `src/assets/`: JSON/config/atlas data used by the game.
- `public/`: static assets (images, fonts, etc.).
