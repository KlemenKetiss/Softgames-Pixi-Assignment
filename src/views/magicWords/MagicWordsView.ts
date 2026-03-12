import { Container, Graphics, Text } from 'pixi.js';
import { Avatar } from './Avatar';
import { Dialogue } from './Dialogue';
import { Emoji } from './Emoji';

export class MagicWordsView extends Container {
  private readonly avatars: Avatar[] = [];
  private readonly dialogue: Dialogue;
  private readonly emoji: Emoji;
  private restartButton?: Container;

  constructor() {
    super();
    this.dialogue = new Dialogue();
    this.dialogue.y = 200;
    this.addChild(this.dialogue);

    this.emoji = new Emoji();
    this.addChild(this.emoji);
  }

  initializeAvatars(
    avatarsData: { name: string; url: string; position: 'left' | 'right' }[],
  ): void {
    this.clearExistingAvatars();

    const centerY = 0;
    const offsetX = 400;

    avatarsData.forEach((data) => {
      const avatar = new Avatar(data.name, data.url, data.position);

      avatar.y = centerY;
      avatar.x = data.position === 'left' ? -offsetX : offsetX;

      this.avatars.push(avatar);
      this.addChild(avatar);
    });
  }

  showSpeaker(name: string): void {
    this.avatars.forEach((avatar) => {
      avatar.visible = avatar.getSpeakerName() === name;
    });
  }

  setDialogueText(text: string): void {
    this.dialogue.setText(text);
  }

  showEmojiAboveSpeaker(emojiUrl: string | null, speakerName: string): void {
    if (!emojiUrl) {
      this.emoji.visible = false;
      return;
    }

    const avatar = this.avatars.find(
      (a) => a.getSpeakerName() === speakerName,
    );

    if (!avatar) {
      this.emoji.visible = false;
      return;
    }

    this.emoji.x = avatar.x;
    this.emoji.y = avatar.y - 140;
    this.emoji.loadFromUrl(emojiUrl);
  }

  hideAllAvatars(): void {
    this.avatars.forEach((avatar) => {
      avatar.visible = false;
    });
    this.emoji.visible = false;
  }

  showRestartButton(onClick: () => void): void {
    if (!this.restartButton) {
      const button = new Container();

      const background = new Graphics()
        .roundRect(-200, -30, 400, 60, 16)
        .fill({ color: 0x252a3d })
        .stroke({ color: 0x61dafb, width: 2 });

      const label = new Text({
        text: 'Restart conversation',
        style: {
          fill: 0xffffff,
          fontSize: 20,
        },
      });
      label.anchor.set(0.5);
      label.x = 0;
      label.y = 0;

      button.addChild(background, label);

      button.y = this.dialogue.y + 140;

      button.eventMode = 'static';
      button.cursor = 'pointer';

      this.restartButton = button;
      this.addChild(this.restartButton);
    }

    this.restartButton.visible = true;
    this.restartButton.removeAllListeners();
    this.restartButton.on('pointertap', (event) => {
      // Prevent also triggering the scene's root click handler.
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      onClick();
    });
  }

  hideRestartButton(): void {
    if (this.restartButton) {
      this.restartButton.visible = false;
    }
  }

  clearExistingAvatars(): void {
    this.avatars.forEach((avatar) => avatar.destroy());
    this.avatars.length = 0;
  }
}

