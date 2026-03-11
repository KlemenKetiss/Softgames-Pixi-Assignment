import type { Application, Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { Scene } from '../core/Scene';
import type { AppManager } from '../core/AppManager';
import { CardStackLogic } from '../logic/aceOfShadows/CardStackLogic';
import { CardSprite, CardStackView } from '../views/aceOfShadows/CardStackView';
import { cardPool } from '../views/aceOfShadows/CardPool';

const STACK_COUNT: number = 4;
const CARDS_PER_STACK: number = 36;
const CARD_SCALE: number = 0.3;
const CARD_Y_OFFSET: number = 3;
const STACK_HORIZONTAL_MARGIN_RATIO: number = 0.2;

const LABEL_FONT_SIZE: number = 50;
const LABEL_FILL_COLOR: number = 0xffffff;
const LABEL_VERTICAL_OFFSET: number = 30;

const PORTRAIT_ROOT_SCALE: number = 0.7;
const PORTRAIT_ROOT_OFFSET_X: number = -150;
const PORTRAIT_ROOT_OFFSET_Y: number = 300;

const CARD_MOVE_DURATION_SECONDS: number = 1;
const CARD_MOVE_RESTART_DELAY_MS: number = 0;

const BASELINE_VERTICAL_POSITION_RATIO: number = 1 / 3;

const CARD_ALIASES: string[] = [
  'ace-clubs',
  'ace-diamonds',
  'ace-hearts',
  'ace-spades',
];

const SHARED_STACKS: CardStackView[] = [];

export class AceOfShadowsScene extends Scene {
  private readonly logic: CardStackLogic;
  private readonly stacks: CardStackView[] = [];

  private isAnimating = false;

  private cardAnimationTimeout: number | null = null;

  private isDisposed = false;

  constructor(app: Application, private readonly appManager: AppManager) {
    super(app);

    this.logic = new CardStackLogic(STACK_COUNT, CARDS_PER_STACK);
    this.root.sortableChildren = true;
    this.isDisposed = false;
    this.createStacks();
    this.layoutStacks();
    this.animateRandomTopCardMove();
    this.onResize();
  }

  override exit(): void {
    this.cleanup();
  }

  override onResize(): void {
    const { width, height } = this.appManager.getDesignSize();

    // Scale down the entire scene in portrait, reset in landscape.
    if (height > width) {
      this.root.scale.set(PORTRAIT_ROOT_SCALE);
      this.root.x = PORTRAIT_ROOT_OFFSET_X;
      this.root.y = PORTRAIT_ROOT_OFFSET_Y;
    } else {
      this.root.scale.set(1);
      this.root.x = 0;
      this.root.y = 0;
    } 
  }

  private createStacks(): void {
    // Lazily create shared stack views once; reuse across scene instances.
    if (SHARED_STACKS.length === 0) {
      for (let i = 0; i < STACK_COUNT; i += 1) {
        const stackView = new CardStackView({
          cardsPerStack: CARDS_PER_STACK,
          cardScale: CARD_SCALE,
          cardYOffset: CARD_Y_OFFSET,
          labelFontSize: LABEL_FONT_SIZE,
          labelFillColor: LABEL_FILL_COLOR,
          labelVerticalOffset: LABEL_VERTICAL_OFFSET,
          cardAliases: CARD_ALIASES,
        });

        stackView.zIndex = i;
        SHARED_STACKS.push(stackView);
      }
    }

    this.stacks.length = 0;
    SHARED_STACKS.forEach((stackView, index) => {
      stackView.zIndex = index;
      stackView.resetCards();
      this.stacks.push(stackView);
      this.root.addChild(stackView);
    });
  }

  private layoutStacks(): void {
    const { width, height } = { width: 1920, height: 1080 }; //Keeping it same size just scaling down the scene for portrait
    const baselineY = this.getBaselineY(height);

    this.stacks.forEach((stackView, stackIndex) => {
      const x = this.getStackCenterX(stackIndex, width);

      stackView.layout(x, baselineY);
      this.updateStackLabelForIndex(stackIndex);
    });
  }

  private animateRandomTopCardMove(): void {
    if (this.isAnimating) return;
    if (this.isDisposed) return;
    if (this.stacks.length < 2) return;

    const move = this.logic.chooseRandomMove();
    if (!move) return;

    this.animateTopCardBetweenStacks(move.sourceIndex, move.targetIndex);
  }

  private animateTopCardBetweenStacks(
    sourceIndex: number,
    targetIndex: number,
  ): void {
    const sourceStackView = this.stacks[sourceIndex];
    const targetStackView = this.stacks[targetIndex];

    if (!sourceStackView || !targetStackView) return;

    this.raiseStackToFront(sourceStackView);

    const movingCard = sourceStackView.popTopCard();
    if (!movingCard) return;

    this.isAnimating = true;

    const { width, height } = { width: 1920, height: 1080 }; //Keeping it same size just scaling down the scene for portrait
    const targetX = this.getStackCenterX(targetIndex, width);
    const targetY = this.getNextCardYForStack(targetStackView, height);

    targetStackView.pushCard(movingCard);
    this.logic.moveTopCard(sourceIndex, targetIndex);
    this.updateStackLabelForIndex(sourceIndex);

    gsap.to(movingCard, {
      x: targetX,
      y: targetY,
      duration: CARD_MOVE_DURATION_SECONDS,
      ease: 'power2.inOut',
      onComplete: () => {
        if (this.isDisposed) {
          return;
        }
        targetStackView.addChild(movingCard);
        this.bringCardToFront(movingCard);
        this.updateStackLabelForIndex(targetIndex);
        this.isAnimating = false;
        this.cardAnimationTimeout = window.setTimeout(() => {
          this.animateRandomTopCardMove();
        }, CARD_MOVE_RESTART_DELAY_MS);
      },
    });
  }

  private raiseStackToFront(stack: CardStackView): void {
    // Recompute zIndex for all stacks so they stay in the range [0, STACK_COUNT - 1].
    const ordered = [...this.stacks].sort(
      (a, b) => a.zIndex - b.zIndex,
    );

    const withoutTarget = ordered.filter((s) => s !== stack);
    const newOrder = [...withoutTarget, stack];

    newOrder.forEach((s, index) => {
      s.zIndex = index;
    });

    this.root.sortChildren();
  }

  private bringCardToFront(card: CardSprite | Sprite): void {
    const parent = card.parent;
    if (!parent) return;
    parent.setChildIndex(card, parent.children.length - 1);
  }

  private getStackCenterX(stackIndex: number, width: number): number {
    const marginX = width * STACK_HORIZONTAL_MARGIN_RATIO;
    const usableWidth = width - marginX * 2;
    const columnWidth =
      STACK_COUNT > 1 ? usableWidth / (STACK_COUNT - 1) : usableWidth / 2;

    return (
      marginX +
      (STACK_COUNT === 1 ? usableWidth / 2 : stackIndex * columnWidth)
    );
  }

  private getNextCardYForStack(stack: CardStackView, height: number): number {
    const baselineY = this.getBaselineY(height);
    const nextDepth = stack.cards.length;
    // New top card goes one step above current top (higher index)
    return baselineY + nextDepth * CARD_Y_OFFSET;
  }

  private getBaselineY(height: number): number {
    const centerY =
      height * BASELINE_VERTICAL_POSITION_RATIO -
      (CARDS_PER_STACK - 1) * CARD_Y_OFFSET;
    const maxStackHeight = (CARDS_PER_STACK - 1) * CARD_Y_OFFSET;
    return centerY + maxStackHeight / 2;
  }

  private updateStackLabelForIndex(stackIndex: number): void {
    const stackView = this.stacks[stackIndex];
    if (!stackView) return;

    const cardCount = this.logic.getCardCount(stackIndex);
    stackView.updateLabel(cardCount);
  }

  private cleanup(): void {
    this.isDisposed = true;
    this.isAnimating = false;

    if (this.cardAnimationTimeout !== null) {
      clearTimeout(this.cardAnimationTimeout);
      this.cardAnimationTimeout = null;
    }

    this.stacks.forEach((stackView) => {
      stackView.cards.forEach((card) => {
        gsap.killTweensOf(card);
        cardPool.release(card);
      });

      stackView.cards.length = 0;
      stackView.updateLabel(0);
      stackView.removeFromParent();
    });
    this.stacks.length = 0;
  }
}

