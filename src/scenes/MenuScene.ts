import { Text } from 'pixi.js';
import type { Application } from 'pixi.js';
import { Scene } from '../core/Scene';

export class MenuScene extends Scene {
  constructor(app: Application) {
    super(app);

    const title = new Text({
      text: 'Softgames Pixi Assignment',
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5);
    title.x = app.renderer.width / 2;
    title.y = app.renderer.height / 2;

    this.root.addChild(title);
  }
}

