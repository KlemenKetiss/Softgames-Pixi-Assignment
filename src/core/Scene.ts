import type { Application } from 'pixi.js';
import { Container } from 'pixi.js';

export abstract class Scene {
  readonly root: Container;

  protected constructor(protected readonly app: Application) {
    this.root = new Container();
  }

  /** Called when the scene becomes active. Add display objects, start timers, etc. */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  enter(): void {}

  /** Called when the scene is removed. Clean up listeners, timers, etc. */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  exit(): void {}

  /** Per-frame update hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_delta: number): void {}
}

