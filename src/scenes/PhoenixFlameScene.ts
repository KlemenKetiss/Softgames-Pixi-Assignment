import type { Application } from 'pixi.js';
import { Scene } from '../core/Scene';
import { FireView } from '../views/phoenixFlame/FireView';

export class PhoenixFlameScene extends Scene {
  private readonly fireView: FireView;

  constructor(app: Application) {
    super(app);

    this.fireView = new FireView();
    this.root.addChild(this.fireView);
  }

  override enter(): void {
    this.fireView.initialize();
  }

  override exit(): void {
    // Detach sprites but keep them and their particle data for reuse.
    this.fireView.detachSprites();
  }

  override update(delta: number): void {
    this.fireView.tick(delta);
  }

  override onResize(designWidth: number, designHeight: number): void {
    this.fireView.centerIn(designWidth, designHeight);
  }
}

