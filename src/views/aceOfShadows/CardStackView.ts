import { Container, Sprite, Text } from 'pixi.js';
import { cardPool } from './CardPool';

export type CardSprite = Sprite;

export interface CardStackViewConfig {
  cardsPerStack: number;
  cardScale: number;
  cardYOffset: number;
  labelFontSize: number;
  labelFillColor: number;
  labelVerticalOffset: number;
  cardAliases: string[];
}

export class CardStackView extends Container {
  readonly cards: CardSprite[] = [];
  protected countLabel!: Text;

  constructor(private readonly config: CardStackViewConfig) {
    super();

    this.resetCards();
    this.createLabel();
  }

  createLabel(): void {
    this.countLabel = new Text({
      text: String(this.cards.length),
      style: {
        fill: this.config.labelFillColor,
        fontSize: this.config.labelFontSize,
        fontWeight: 'bold',
      },
    });
    
    this.countLabel.anchor.set(0.5, 1);
    this.addChild(this.countLabel);
  }

  resetCards(): void {
    // Return existing cards to the pool
    this.cards.forEach((card) => {
      cardPool.release(card);
    });
    this.cards.length = 0;

    // Repopulate with new/randomized cards
    for (let i = 0; i < this.config.cardsPerStack; i += 1) {
      const alias =
        this.config.cardAliases[
          Math.floor(Math.random() * this.config.cardAliases.length)
        ];
      const card = cardPool.acquire(alias, this.config.cardScale);

      this.addChild(card);
      this.cards.push(card);
    }

  }

  layout(centerX: number, baselineY: number): void {
    this.cards.forEach((card, depth) => {
      card.x = centerX;
      card.y = baselineY + depth * this.config.cardYOffset;
    });

    if (this.cards.length === 0) {
      return;
    }

    const bottomCard = this.cards[0];
    this.countLabel.x = centerX;
    this.countLabel.y =
      bottomCard.y - bottomCard.height / 2 - this.config.labelVerticalOffset;
  }

  popTopCard(): CardSprite | null {
    if (this.cards.length === 0) {
      return null;
    }

    const card = this.cards.pop() ?? null;
    if (!card) {
      return null;
    }

    return card;
  }

  pushCard(card: CardSprite): void {
    this.cards.push(card);
  }

  updateLabel(cardCount: number): void {
    this.countLabel.text = String(cardCount);
  }
}
