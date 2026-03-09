import type { Application } from 'pixi.js';
import { Assets, Container, Sprite } from 'pixi.js';
import { Scene } from '../core/Scene';
import type { AppManager } from '../core/AppManager';

const CARDS = [
  'ace-clubs',
  'ace-diamonds',
  'ace-hearts',
  'ace-spades',
] as const;

const CARD_SCALE = 0.25;
const CARD_GAP_PX = 30;

export class AceOfShadowsScene extends Scene {
  private readonly cardsLayer: Container;

  private readonly cardSprites: Sprite[] = [];

  constructor(app: Application, private readonly appManager: AppManager) {
    super(app);

    this.cardsLayer = new Container();
    this.root.addChild(this.cardsLayer);

    this.buildCards();
  }

  override onResize(): void {
    this.layoutCards();
  }

  private buildCards(): void {
    CARDS.forEach((card) => {
      const texture = Assets.get(card);
      const cardSprite = new Sprite(texture);
      cardSprite.anchor.set(0.5);
      cardSprite.scale.set(CARD_SCALE);

      this.cardsLayer.addChild(cardSprite);
      this.cardSprites.push(cardSprite);
    });

    this.layoutCards();
  }

  private layoutCards(): void {
    if (this.cardSprites.length === 0) return;

    const { width, height } = this.appManager.getDesignSize();

    const count = this.cardSprites.length;

    // Use the rendered card width so the visual gap between cards remains constant
    // in both landscape and portrait.
    const cardWidth = Math.max(...this.cardSprites.map((card) => card.width));
    const totalWidth = cardWidth * count + CARD_GAP_PX * (count - 1);

    // Center the whole span horizontally.
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const y = height / 2;

    for (let i = 0; i < count; i++) {
      const card = this.cardSprites[i];
      card.x = startX + i * (cardWidth + CARD_GAP_PX);
      card.y = y;
    }
  }
}

