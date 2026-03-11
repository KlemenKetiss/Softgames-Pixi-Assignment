import { Container } from 'pixi.js';
import { Avatar } from './Avatar';
import { Dialogue } from './Dialogue';
import { Emoji } from './Emoji';

export class MagicWordsView extends Container {
  private readonly avatars: Avatar[] = [];
  private readonly dialogue: Dialogue;
  private readonly emoji: Emoji;

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

  clearExistingAvatars(): void {
    this.avatars.forEach((avatar) => avatar.destroy());
    this.avatars.length = 0;
  }
}

