import { Container, Graphics, Text } from 'pixi.js';

export class Dialogue extends Container {
  private background!: Graphics;
  private textField!: Text;

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    this.createBackground();
    this.createTextField();
  }

  private createBackground(): void {
    this.background = new Graphics()
      .roundRect(-450, -80, 900, 160, 24)
      .fill({ color: 0x151824, alpha: 0.9 });
    this.addChild(this.background);
  }

  private createTextField(): void {
    this.textField = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: 24,
        wordWrap: true,
        wordWrapWidth: 820,
      },
    });
    this.textField.anchor.set(0.5);
    this.textField.x = 0;
    this.textField.y = 0;
    this.addChild(this.textField);
  }

  setText(text: string): void {
    this.textField.text = text;
  }
}

