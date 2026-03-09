import { Application } from 'pixi.js';
import { Scene } from './Scene';
import { MenuScene } from '../scenes/MenuScene';

export class AppManager {
  private app: Application;

  private currentScene: Scene | null = null;

  constructor() {
    this.app = new Application();
    this.init();
  }

  private async init(): Promise<void> {
    await this.app.init({
      width: 1280,
      height: 720,
      backgroundColor: 0x101525,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    document.body.appendChild(this.app.canvas);

    this.changeScene(new MenuScene(this.app));

    this.app.ticker.add((ticker) => {
      const delta = ticker.deltaTime;
      this.currentScene?.update(delta);
    });
  }

  changeScene(next: Scene): void {
    if (this.currentScene) {
      this.currentScene.exit();
      this.app.stage.removeChild(this.currentScene.root);
    }

    this.currentScene = next;
    this.currentScene.enter();
    this.app.stage.addChild(this.currentScene.root);
  }
}

