# Softgames Pixi Assignment

## Setup

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

## Project structure

- `src/main.ts`: entry point, bootstraps the Pixi application via `AppManager`.
- `src/core/AppManager.ts`: owns the Pixi `Application`, handles scene switching.
- `src/core/Scene.ts`: base scene class with a root container and lifecycle hooks.
- `src/scenes/MenuScene.ts`: in-game menu (will link to the three tasks).
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
