import { Application, Assets, Container, Graphics, Text } from 'pixi.js';
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
const BACK_BUTTON_WIDTH = 120;
const BACK_BUTTON_HEIGHT = 40;
const BACK_BUTTON_CORNER_RADIUS = 8;
const BACK_BUTTON_PADDING = 16;
const BACK_BUTTON_FONT_SIZE = 18;
const BACK_BUTTON_BG_COLOR = 0x252a3d;
const BACK_BUTTON_BORDER_COLOR = 0x61dafb;
const BACK_BUTTON_BORDER_WIDTH = 2;
const RENDER_RESOLUTION_FALLBACK = 1;
const MS_PER_SECOND = 1000;
const BACK_BUTTON_FPS_MARGIN = 4;

export class AppManager {
  private readonly app: Application;

  private readonly sceneRoot: Container;

  private readonly overlayRoot: Container;

  private readonly fpsText: Text;

  private fpsAccumulatedMs = 0;

  private fpsFrameCount = 0;

  private designWidth!: number;

  private designHeight!: number;

  private currentScene: Scene | null = null;

  private backButton?: Container;

  constructor() {
    this.app = new Application();
    this.sceneRoot = new Container();
    this.overlayRoot = new Container();
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
      resolution: window.devicePixelRatio || RENDER_RESOLUTION_FALLBACK,
      resizeTo: window,
    });

    this.exposeForDevtools();

    document.body.appendChild(this.app.canvas);

    this.app.stage.addChild(this.sceneRoot);
    this.app.stage.addChild(this.overlayRoot);
    this.app.stage.addChild(this.fpsText);
    this.createBackButton();

    await this.loadAssets();

    this.changeScene(new MenuScene(this.app, this));

    this.initResizeHandlers();
    this.initFullscreenOnce();
    this.initTicker();

    this.onResize();
  }

  private async loadAssets(): Promise<void> {
    const baseUrl =
      window.location.origin +
      window.location.pathname.replace(/\/[^/]*$/, '') +
      '/assets/';

    try {
      await Assets.init({
        basePath: baseUrl,
        manifest: `${baseUrl}manifest.json`,
      });
      // eslint-disable-next-line no-console
      console.log('Assets manifest loaded');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to init assets manifest', error);
      return;
    }

    try {
      await Assets.loadBundle('ui-bundle');
      // eslint-disable-next-line no-console
      console.log('UI bundle loaded');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load UI bundle', error);
    }
  }

  private exposeForDevtools(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__PIXI_APP__ = this.app;
  }

  private initResizeHandlers(): void {
    const handleResize = () => {
      // Defer resize until after Pixi's own resize handling runs.
      window.requestAnimationFrame(() => this.onResize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleResize();
      }
    });
  }

  private initFullscreenOnce(): void {
    const canvas = this.app.canvas as HTMLCanvasElement;

    const requestFullscreen = () => {
      if (!document.fullscreenElement && canvas.requestFullscreen) {
        canvas.requestFullscreen().catch(() => {});
      }
    };

    canvas.addEventListener('pointerdown', requestFullscreen);
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
      const fps = (this.fpsFrameCount * MS_PER_SECOND) / this.fpsAccumulatedMs;
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

    this.layoutBackButton();
  }

  changeScene(next: Scene): void {
    if (this.currentScene) {
      this.currentScene.exit();
      this.sceneRoot.removeChild(this.currentScene.root);
    }

    this.currentScene = next;
    this.currentScene.enter();
    this.sceneRoot.addChild(this.currentScene.root);
    this.updateBackButtonVisibility();
  }

  private createBackButton(): void {
    const button = new Container();

    const background = new Graphics()
      .roundRect(
        0,
        0,
        BACK_BUTTON_WIDTH,
        BACK_BUTTON_HEIGHT,
        BACK_BUTTON_CORNER_RADIUS,
      )
      .fill({ color: BACK_BUTTON_BG_COLOR })
      .stroke({
        color: BACK_BUTTON_BORDER_COLOR,
        width: BACK_BUTTON_BORDER_WIDTH,
      });

    const label = new Text({
      text: 'Back',
      style: {
        fill: 0xffffff,
        fontSize: BACK_BUTTON_FONT_SIZE,
      },
    });
    label.anchor.set(0.5);
    label.x = BACK_BUTTON_WIDTH / 2;
    label.y = BACK_BUTTON_HEIGHT / 2;

    button.addChild(background, label);

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointertap', () => {
      this.changeScene(new MenuScene(this.app, this));
    });

    this.overlayRoot.addChild(button);
    this.backButton = button;

    this.updateBackButtonVisibility();
    this.layoutBackButton();
  }

  private updateBackButtonVisibility(): void {
    if (!this.backButton) return;

    // Hide back button on menu; show on all other scenes.
    this.backButton.visible =
      this.currentScene !== null && !(this.currentScene instanceof MenuScene);
  }

  private layoutBackButton(): void {
    if (!this.backButton) return;

    this.backButton.x = BACK_BUTTON_PADDING;
    this.backButton.y =
      BACK_BUTTON_PADDING + this.fpsText.height + BACK_BUTTON_FPS_MARGIN;
  }
}

