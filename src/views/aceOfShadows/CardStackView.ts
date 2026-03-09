import { Assets, Container, Sprite, Text } from 'pixi.js';

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
  readonly countLabel: Text;

  constructor(private readonly config: CardStackViewConfig) {
    super();

    for (let i = 0; i < config.cardsPerStack; i += 1) {
      const alias =
        config.cardAliases[
          Math.floor(Math.random() * config.cardAliases.length)
        ];
      const texture = Assets.get(alias);
      const card = new Sprite(texture);
      card.anchor.set(0.5);
      card.scale.set(config.cardScale);

      this.addChild(card);
      this.cards.push(card);
    }

    this.countLabel = new Text({
      text: String(this.cards.length),
      style: {
        fill: config.labelFillColor,
        fontSize: config.labelFontSize,
        fontWeight: 'bold',
      },
    });
    this.countLabel.anchor.set(0.5, 1);
    this.addChild(this.countLabel);
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
