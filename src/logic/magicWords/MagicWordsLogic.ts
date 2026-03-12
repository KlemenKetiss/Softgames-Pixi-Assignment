export interface MagicWordsDialogueEntry {
  name: string;
  text: string;
}

export interface MagicWordsEmoji {
  name: string;
  url: string;
}

export interface MagicWordsAvatar {
  name: string;
  url: string;
  position: 'left' | 'right';
}

export interface MagicWordsData {
  dialogue: MagicWordsDialogueEntry[];
  emojies: MagicWordsEmoji[];
  avatars: MagicWordsAvatar[];
}

export class MagicWordsLogic {
  private currentIndex = 0;

  constructor(private readonly data: MagicWordsData) {}

  resetConversation(): void {
    this.currentIndex = 0;
  }

  hasNextLine(): boolean {
    return this.currentIndex < this.data.dialogue.length;
  }

  getCurrentLine(): MagicWordsDialogueEntry | null {
    if (!this.hasNextLine()) {
      return null;
    }
    return this.data.dialogue[this.currentIndex] ?? null;
  }

  /**
   * Returns info about the current dialogue line, including
   * the speaker's name, the line text with any curly-brace {emoji} code removed,
   * and the URL for a matching emoji if one is referenced, otherwise null.
   */
  getCurrentLineViewModel(): {
    speakerName: string;
    text: string;
    emojiUrl: string | null;
  } | null {
    const line = this.getCurrentLine();
    if (!line) {
      return null;
    }

    const { cleanText, emojiName } = this.extractEmojiFromText(line.text);

    let emojiUrl: string | null = null;
    if (emojiName) {
      const emoji = this.getEmojiByName(emojiName);
      emojiUrl = emoji?.url ?? null;
    }

    return {
      speakerName: line.name,
      text: cleanText,
      emojiUrl,
    };
  }

  advance(): MagicWordsDialogueEntry | null {
    if (!this.hasNextLine()) {
      return null;
    }
    this.currentIndex += 1;
    return this.getCurrentLine();
  }

  getAvatarForSpeaker(name: string): MagicWordsAvatar | undefined {
    return this.data.avatars.find((avatar) => avatar.name === name);
  }

  getEmojiByName(name: string): MagicWordsEmoji | undefined {
    return this.data.emojies.find((emoji) => emoji.name === name);
  }

  private extractEmojiFromText(text: string): {
    cleanText: string;
    emojiName: string | null;
  } {
    const match = text.match(/\s*\{([^}]+)\}/);
    const emojiName = match ? match[1].trim() : null;
    // Also remove the possible space before the bracket
    const cleanText = text.replace(/\s*\{[^}]*\}/g, '').trim();
    return { cleanText, emojiName };
  }
}

