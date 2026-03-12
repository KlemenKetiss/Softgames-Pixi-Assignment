import type { Application } from 'pixi.js';
import { Assets } from 'pixi.js';
import { Scene } from '../core/Scene';
import type { AppManager } from '../core/AppManager';
import { MagicWordsView } from '../views/magicWords/MagicWordsView';
import {
  MagicWordsLogic,
  type MagicWordsData,
} from '../logic/magicWords/MagicWordsLogic';

export class MagicWordsScene extends Scene {
  private view!: MagicWordsView;
  private logic!: MagicWordsLogic;
  private isAtEnd = false;
  constructor(app: Application, private readonly appManager: AppManager) {
    super(app);
    this.initialize();
    this.onResize();
  }

  protected initialize(): void {
    if (this.view == null) {
      this.view = new MagicWordsView();
      this.root.addChild(this.view);

      const data = Assets.get('magicwords') as MagicWordsData;
      this.logic = new MagicWordsLogic(data);
      this.view.initializeAvatars(data.avatars);
    }
    this.resetConversation();

    this.root.eventMode = 'static';
    this.root.cursor = 'pointer';
    this.root.on('pointertap', () => {
      this.advanceConversation();
    });
  }

  private resetConversation(): void {
    this.isAtEnd = false;
    this.view.hideRestartButton();
    this.logic.resetConversation();
    const vm = this.logic.getCurrentLineViewModel();
    if (vm) {
      this.view.showSpeaker(vm.speakerName);
      this.view.setDialogueText(vm.text);
      this.view.showEmojiAboveSpeaker(vm.emojiUrl, vm.speakerName);
    }
  }

  private advanceConversation(): void {
    const next = this.logic.advance();
    if (!next) {
      this.isAtEnd = true;
      this.view.hideAllAvatars();
      this.view.setDialogueText(
        'THE END - Tap the button below to restart conversation or Back to return to the menu',
      );
      this.view.showEmojiAboveSpeaker(null, '');
      this.view.showRestartButton(() => {
        this.resetConversation();
      });
      return;
    }

    const vm = this.logic.getCurrentLineViewModel();
    if (!vm) {
      return;
    }

    this.view.showSpeaker(vm.speakerName);
    this.view.setDialogueText(vm.text);
    this.view.showEmojiAboveSpeaker(vm.emojiUrl, vm.speakerName);
  }

  override onResize(): void {
    const { width, height } = this.appManager.getDesignSize();
    if (this.view) {
      this.view.x = width / 2;
      this.view.y = height / 2 + 100;
    }
  }
}
