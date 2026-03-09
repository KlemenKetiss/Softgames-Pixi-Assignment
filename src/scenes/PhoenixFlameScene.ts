import type { Application } from 'pixi.js';
import { Scene } from '../core/Scene';

export class PhoenixFlameScene extends Scene {
  constructor(app: Application) {
    super(app);
    this.initialize();
  }

  protected initialize(): void {
    //const background = new Sprite(Assets.get('background'));
    //this.root.addChild(background);
  }
}

