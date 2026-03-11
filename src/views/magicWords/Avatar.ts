import { Sprite, Texture } from 'pixi.js';

export class Avatar extends Sprite {
  private speakerName!: string;
  private positionSide!: 'left' | 'right';

  constructor(name: string, url: string, position: 'left' | 'right') {
    super();
    this.initialize(name, url, position);
  }

  initialize(name: string, url: string, position: 'left' | 'right'): void {
    this.speakerName = name;
    this.positionSide = position;
    this.anchor.set(0.5);
    this.scale.set(2);
    this.visible = false;
    this.loadImage(url);
  }

  private loadImage(url: string): void {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => {
      this.texture = Texture.from(image);
    };
    image.onerror = () => {
      // eslint-disable-next-line no-console
      console.error(`Failed to load avatar image from URL: ${url}`);
    };
  }

  getSpeakerName(): string {
    return this.speakerName;
  }

  getPositionSide(): 'left' | 'right' {
    return this.positionSide;
  }
}

