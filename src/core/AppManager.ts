import { Application, Container, Text } from 'pixi.js';
import { Scene } from './Scene';
import { MenuScene } from '../scenes/MenuScene';

const LANDSCAPE_WIDTH = 1920;
const LANDSCAPE_HEIGHT = 1080;
const PORTRAIT_WIDTH = 1080;
const PORTRAIT_HEIGHT = 1920;
const BACKGROUND_COLOR = 0x101525;
const FPS_FONT_SIZE = 16;
const FPS_UPDATE_INTERVAL_MS = 250;
const FPS_PADDING = 8;

export class AppManager {
  private readonly app: Application;

  private readonly sceneRoot: Container;

  private readonly fpsText: Text;

  private fpsAccumulatedMs = 0;

  private fpsFrameCount = 0;

  private designWidth!: number;

  private designHeight!: number;

  private currentScene: Scene | null = null;

  constructor() {
    this.app = new Application();
    this.sceneRoot = new Container();
    this.fpsText = new Text({
      text: 'FPS: 0',
      style: {
        fill: 0xffffff,
        fontSize: FPS_FONT_SIZE,
      },
    });

    this.updateDesignSize();
    this.init();
  }

  private updateDesignSize(): void {
    if (window.innerWidth >= window.innerHeight) {
      this.designWidth = LANDSCAPE_WIDTH;
      this.designHeight = LANDSCAPE_HEIGHT;
    } else {
      this.designWidth = PORTRAIT_WIDTH;
      this.designHeight = PORTRAIT_HEIGHT;
    }
  }

  getDesignSize(): { width: number; height: number } {
    return { width: this.designWidth, height: this.designHeight };
  }

  private async init(): Promise<void> {
    await this.app.init({
      width: this.designWidth,
      height: this.designHeight,
      backgroundColor: BACKGROUND_COLOR,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      resizeTo: window,
    });

    this.exposeForDevtools();

    document.body.appendChild(this.app.canvas);

    this.app.stage.addChild(this.sceneRoot);
    this.app.stage.addChild(this.fpsText);

    this.changeScene(new MenuScene(this.app, this));

    this.initResizeHandlers();
    this.initFullscreenOnce();
    this.initTicker();

    this.onResize();
  }

  private exposeForDevtools(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__PIXI_APP__ = this.app;
  }

  private initResizeHandlers(): void {
    const handleResize = () => this.onResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleResize();
      }
    });
  }

  private initFullscreenOnce(): void {
    const requestFullscreenOnce = () => {
      const canvas = this.app.canvas as HTMLCanvasElement;
      if (!document.fullscreenElement && canvas.requestFullscreen) {
        canvas
          .requestFullscreen()
          .catch(() => {})
          .finally(() => {
            canvas.removeEventListener('pointerdown', requestFullscreenOnce);
          });
      } else {
        canvas.removeEventListener('pointerdown', requestFullscreenOnce);
      }
    };

    this.app.canvas.addEventListener('pointerdown', requestFullscreenOnce);
  }

  private initTicker(): void {
    this.app.ticker.add((ticker) => {
      const delta = ticker.deltaTime;
      this.currentScene?.update(delta);

      this.updateFps(ticker.elapsedMS);
    });
  }

  private updateFps(elapsedMs: number): void {
    this.fpsAccumulatedMs += elapsedMs;
    this.fpsFrameCount += 1;

    if (this.fpsAccumulatedMs >= FPS_UPDATE_INTERVAL_MS) {
      const fps = (this.fpsFrameCount * 1000) / this.fpsAccumulatedMs;
      this.fpsText.text = `FPS: ${fps.toFixed(1)}`;
      this.fpsAccumulatedMs = 0;
      this.fpsFrameCount = 0;
    }
  }

  private onResize(): void {
    this.updateDesignSize();

    const rendererWidth = this.app.renderer.width;
    const rendererHeight = this.app.renderer.height;

    const scale = Math.min(
      rendererWidth / this.designWidth,
      rendererHeight / this.designHeight,
    );

    this.sceneRoot.scale.set(scale);

    const contentWidth = this.designWidth * scale;
    const contentHeight = this.designHeight * scale;

    this.sceneRoot.x = (rendererWidth - contentWidth) / 2;
    this.sceneRoot.y = (rendererHeight - contentHeight) / 2;

    this.fpsText.x = FPS_PADDING;
    this.fpsText.y = FPS_PADDING;

    if (this.currentScene) {
      this.currentScene.onResize(this.designWidth, this.designHeight);
    }
  }

  changeScene(next: Scene): void {
    if (this.currentScene) {
      this.currentScene.exit();
      this.sceneRoot.removeChild(this.currentScene.root);
    }

    this.currentScene = next;
    this.currentScene.enter();
    this.sceneRoot.addChild(this.currentScene.root);
  }
}

