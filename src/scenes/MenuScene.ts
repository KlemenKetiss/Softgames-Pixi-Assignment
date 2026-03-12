import type { Application } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import type { AppManager } from '../core/AppManager';
import { AceOfShadowsScene } from './AceOfShadowsScene';
import { MagicWordsScene } from './MagicWordsScene';
import { PhoenixFlameScene } from './PhoenixFlameScene';

const MENU_BACKGROUND_COLOR = 0x050713;
const MENU_BACKGROUND_OVERLAY_COLOR = 0x0b1020;
const MENU_TITLE_TEXT = 'Softgames Pixi Assignment';
const MENU_TITLE_FONT_SIZE = 42;
const MENU_TITLE_VERTICAL_OFFSET = 160;
const MENU_RESOLUTION_FONT_SIZE = 18;
const MENU_RESOLUTION_PADDING = 24;
const MENU_RESOLUTION_COLOR = 0x7f8499;
const MENU_BUTTON_LABELS = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'] as const;
const MENU_BUTTON_VERTICAL_OFFSET = 40;
const MENU_BUTTON_VERTICAL_SPACING = 70;

const BUTTON_WIDTH = 320;
const BUTTON_HEIGHT = 54;
const BUTTON_CORNER_RADIUS = 28;
const BUTTON_BACKGROUND_COLOR = 0x171c2b;
const BUTTON_BACKGROUND_HOVER_TINT = 0x3c76f0;
const BUTTON_BORDER_COLOR = 0x3c76f0;
const BUTTON_BORDER_WIDTH = 3;
const BUTTON_LABEL_FONT_SIZE = 22;

export class MenuScene extends Scene {
  private readonly uiLayer: Container;

  constructor(app: Application, private readonly appManager: AppManager) {
    super(app);

    this.uiLayer = new Container();
    this.root.addChild(this.uiLayer);

    this.buildMenu();
  }

  override onResize(): void {
    this.uiLayer.removeChildren();
    this.buildMenu();
  }

  private buildMenu(): void {
    const { width, height } = this.appManager.getDesignSize();

    this.buildBackground(width, height);
    this.buildTitle(width, height);
    this.buildResolutionLabel(width, height);
    this.buildButtons(width, height);
  }

  private buildBackground(width: number, height: number): void {
    const background = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: MENU_BACKGROUND_COLOR });

    const overlay = new Graphics()
      .rect(0, 0, width, height)
      .fill({ color: MENU_BACKGROUND_OVERLAY_COLOR, alpha: 0.85 });

    const panelWidth = Math.min(720, width - 200);
    const panelHeight = Math.min(420, height - 260);
    const panel = new Graphics()
      .roundRect(
        (width - panelWidth) / 2,
        (height - panelHeight) / 2,
        panelWidth,
        panelHeight,
        32,
      )
      .fill({ color: 0x111827, alpha: 0.95 })
      .stroke({ color: 0x2f3650, width: 2 });

    this.uiLayer.addChild(background, overlay, panel);
  }

  private buildTitle(width: number, height: number): void {
    const title = new Text({
      text: MENU_TITLE_TEXT,
      style: {
        fill: 0xffffff,
        fontSize: MENU_TITLE_FONT_SIZE,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = height / 2 - MENU_TITLE_VERTICAL_OFFSET;

    this.uiLayer.addChild(title);
  }

  private buildResolutionLabel(width: number, height: number): void {
    const resolutionLabel = new Text({
      text: 'Klemen Ketiš',
      style: {
        fill: MENU_RESOLUTION_COLOR,
        fontSize: MENU_RESOLUTION_FONT_SIZE,
      },
    });
    resolutionLabel.anchor.set(1, 1);
    resolutionLabel.x = width - MENU_RESOLUTION_PADDING;
    resolutionLabel.y = height - MENU_RESOLUTION_PADDING;

    this.uiLayer.addChild(resolutionLabel);
  }

  private buildButtons(width: number, height: number): void {
    const startY = height / 2 - MENU_BUTTON_VERTICAL_OFFSET;
    const centerX = width / 2;

    MENU_BUTTON_LABELS.forEach((label, index) => {
      const buttonY = startY + index * MENU_BUTTON_VERTICAL_SPACING;
      const button = this.createButton(label, centerX, buttonY, () => {
        if (label === 'Ace of Shadows') {
          this.appManager.changeScene(
            new AceOfShadowsScene(this.app, this.appManager),
          );
        } else if (label === 'Magic Words') {
          this.appManager.changeScene(new MagicWordsScene(this.app, this.appManager));
        } else {
          this.appManager.changeScene(new PhoenixFlameScene(this.app));
        }
      });
      this.uiLayer.addChild(button);
    });
  }

  private createButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ): Container {
    const button = new Container();

    const background = new Graphics()
      .roundRect(
        -BUTTON_WIDTH / 2,
        -BUTTON_HEIGHT / 2,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        BUTTON_CORNER_RADIUS,
      )
      .fill({ color: BUTTON_BACKGROUND_COLOR })
      .stroke({ color: BUTTON_BORDER_COLOR, width: BUTTON_BORDER_WIDTH });

    const text = new Text({
      text: label,
      style: {
        fill: 0xffffff,
        fontSize: BUTTON_LABEL_FONT_SIZE,
        fontWeight: '600',
      },
    });
    text.anchor.set(0.5);

    button.addChild(background, text);
    button.x = x;
    button.y = y;

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerover', () => {
      background.tint = BUTTON_BACKGROUND_HOVER_TINT;
      button.scale.set(1.05);
    });
    button.on('pointerout', () => {
      background.tint = 0xffffff;
      button.scale.set(1);
    });
    button.on('pointertap', onClick);

    return button;
  }
}

