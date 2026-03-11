import { Assets, Sprite } from 'pixi.js';
import type { CardSprite } from './CardStackView';

class CardPool {
  private readonly pool: CardSprite[] = [];

  acquire(alias: string, scale: number): CardSprite {
    const texture = Assets.get(alias);
    const card = this.pool.pop() ?? new Sprite(texture);

    card.texture = texture;
    card.anchor.set(0.5);
    card.scale.set(scale);
    card.visible = true;
    card.alpha = 1;
    card.rotation = 0;
    card.x = 0;
    card.y = 0;

    return card;
  }

  release(card: CardSprite): void {
    card.removeFromParent();
    card.visible = false;
    this.pool.push(card);
  }
}

export const cardPool = new CardPool();

