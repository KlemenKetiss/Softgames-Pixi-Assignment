import type { Application } from 'pixi.js';
import { Assets, Container, Sprite, Text } from 'pixi.js';
import { gsap } from 'gsap';
import { Scene } from '../core/Scene';
import type { AppManager } from '../core/AppManager';

const STACK_COUNT: number = 4;
const CARDS_PER_STACK: number = 36;
const CARD_SCALE: number = 0.3;
const CARD_Y_OFFSET: number = 3;
const STACK_HORIZONTAL_MARGIN_RATIO: number = 0.2;

const LABEL_FONT_SIZE: number = 18;
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

type CardSprite = Sprite;

interface CardStack {
  container: Container;
  cards: CardSprite[];
  label: Text;
}

export class AceOfShadowsScene extends Scene {
  private readonly stacks: CardStack[] = [];

  private isAnimating = false;

  constructor(app: Application, private readonly appManager: AppManager) {
    super(app);

    this.root.sortableChildren = true;
    this.createStacks();
    this.layoutStacks();
    this.animateRandomTopCardMove();
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
    for (let i = 0; i < STACK_COUNT; i += 1) {
      const stackContainer = new Container();
      stackContainer.zIndex = i;
      const cards: CardSprite[] = [];

      for (let j = 0; j < CARDS_PER_STACK; j += 1) {
        const alias =
          CARD_ALIASES[Math.floor(Math.random() * CARD_ALIASES.length)];
        const texture = Assets.get(alias);
        const card = new Sprite(texture);
        card.anchor.set(0.5);
        card.scale.set(CARD_SCALE);

        stackContainer.addChild(card);
        cards.push(card);
      }

      const label = new Text({
        text: String(cards.length),
        style: {
          fill: LABEL_FILL_COLOR,
          fontSize: LABEL_FONT_SIZE,
          fontWeight: 'bold',
        },
      });
      label.anchor.set(0.5, 1);
      stackContainer.addChild(label);
      label.y = cards[0].y;////-cards[0].height/2 - cards.length * CARD_Y_OFFSET;
      console.log('label.y', label.y);

      this.stacks.push({ container: stackContainer, cards, label });
      // SO CARDS[0] is the bottom most card in the stack, and CARDS[CARDS.length - 1] is the top most card in the stack
      this.root.addChild(stackContainer);
    }
  }

  private layoutStacks(): void {
    const { width, height } = { width: 1920, height: 1080 };
    const baselineY = this.getBaselineY(height);

    this.stacks.forEach((stack, stackIndex) => {
      const x = this.getStackCenterX(stackIndex, width);

      // cards[0] is bottom-most at baseline, higher indices stack upwards
      stack.cards.forEach((card, depth) => {
        card.x = x;
        card.y = baselineY + depth * CARD_Y_OFFSET;
      });

      stack.label.x = x;
      stack.label.y = stack.cards[0].y - stack.cards[0].height/2 - LABEL_VERTICAL_OFFSET;

      this.updateStackLabel(stack);
    });
  }

  private animateRandomTopCardMove(): void {
    if (this.isAnimating) return;
    if (this.stacks.length < 2) return;

    const nonEmptySourceIndices = this.stacks
      .map((stack, index) => ({ stack, index }))
      .filter(({ stack }) => stack.cards.length > 0)
      .map(({ index }) => index);

    if (nonEmptySourceIndices.length < 1) return;

    const sourceIndex =
      nonEmptySourceIndices[
        Math.floor(Math.random() * nonEmptySourceIndices.length)
      ];

    let targetIndex = sourceIndex;
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * this.stacks.length);
    }
    this.animateTopCardBetweenStacks(sourceIndex, targetIndex);
  }

  private animateTopCardBetweenStacks(
    sourceIndex: number,
    targetIndex: number,
  ): void {
    const sourceStack = this.stacks[sourceIndex];
    const targetStack = this.stacks[targetIndex];

    if (!sourceStack || !targetStack) return;

    this.raiseStackToFront(sourceStack); //Make z-index of source stack the highest so we can animate from top to top

    const movingCard = this.popTopCard(sourceStack); //Remove top most card from source stack
    if (!movingCard) return;

    this.isAnimating = true;

    const { width, height } = { width: 1920, height: 1080 };
    const targetX = this.getStackCenterX(targetIndex, width);
    const targetY = this.getNextCardYForStack(targetStack, height);
    targetStack.cards.push(movingCard);
    this.updateStackLabel(sourceStack);

    gsap.to(movingCard, {
      x: targetX,
      y: targetY,
      duration: CARD_MOVE_DURATION_SECONDS,
      ease: 'power2.inOut',
      onComplete: () => {
        targetStack.container.addChild(movingCard);
        this.bringCardToFront(movingCard);
        this.updateStackLabel(targetStack);
        this.isAnimating = false;
        setTimeout(() => {
          this.animateRandomTopCardMove();
        }, CARD_MOVE_RESTART_DELAY_MS);
      },
    });
  }

  private popTopCard(stack: CardStack): CardSprite | null {
    if (stack.cards.length === 0) return null;
    const card = stack.cards.pop() ?? null;
    if (!card) return null;
    return card;
  }

  private raiseStackToFront(stack: CardStack): void {
    // Recompute zIndex for all stacks so they stay in the range [0, STACK_COUNT - 1].
    const ordered = [...this.stacks].sort(
      (a, b) => a.container.zIndex - b.container.zIndex,
    );

    const withoutTarget = ordered.filter((s) => s !== stack);
    const newOrder = [...withoutTarget, stack];

    newOrder.forEach((s, index) => {
      s.container.zIndex = index;
    });

    this.root.sortChildren();
  }

  private bringCardToFront(card: CardSprite): void {
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

  private getNextCardYForStack(stack: CardStack, height: number): number {
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

  private updateStackLabel(
    stack: CardStack,
  ): void {
    stack.label.text = String(stack.cards.length);
  }
}

