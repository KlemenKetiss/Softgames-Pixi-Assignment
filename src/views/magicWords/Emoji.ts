import { Sprite, Texture } from 'pixi.js';

export class Emoji extends Sprite {
  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    this.anchor.set(0.5);
    this.scale.set(0.5);
    // random between -20° and +20°
    this.rotation = (Math.random() * 40 - 20) * (Math.PI / 180);
    this.visible = false;
  }

  loadFromUrl(url: string): void {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => {
      this.texture = Texture.from(image);
      this.visible = true;
    };
    image.onerror = () => {
      // eslint-disable-next-line no-console
      console.error(`Failed to load emoji image from URL: ${url}`);
      this.visible = false;
    };
  }
}

