export interface CardStackState {
  readonly index: number;
  cardCount: number;
}

export class CardStackLogic {
  private readonly stacks: CardStackState[];

   private lastTargetIndex: number | null = null;

  constructor(stackCount: number, initialCardsPerStack: number) {
    this.stacks = Array.from({ length: stackCount }, (_, index) => ({
      index,
      cardCount: initialCardsPerStack,
    }));
  }

  getStackCount(): number {
    return this.stacks.length;
  }

  getCardCount(stackIndex: number): number {
    const stack = this.stacks[stackIndex];
    return stack ? stack.cardCount : 0;
  }

  getNonEmptyStackIndices(): number[] {
    return this.stacks
      .filter((stack) => stack.cardCount > 0)
      .map((stack) => stack.index);
  }

  chooseRandomMove():
    | {
        sourceIndex: number;
        targetIndex: number;
      }
    | null {
    if (this.stacks.length < 2) {
      return null;
    }

    let nonEmptySourceIndices = this.getNonEmptyStackIndices();

    if (nonEmptySourceIndices.length === 0) {
      return null;
    }

    if (this.lastTargetIndex !== null && nonEmptySourceIndices.length > 1) {
      nonEmptySourceIndices = nonEmptySourceIndices.filter(
        (index) => index !== this.lastTargetIndex,
      );
    }

    if (nonEmptySourceIndices.length === 0) {
      return null;
    }

    const sourceIndex =
      nonEmptySourceIndices[
        Math.floor(Math.random() * nonEmptySourceIndices.length)
      ];

    let targetIndex = sourceIndex;
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * this.stacks.length);
    }

    return { sourceIndex, targetIndex };
  }

  moveTopCard(sourceIndex: number, targetIndex: number): void {
    const source = this.stacks[sourceIndex];
    const target = this.stacks[targetIndex];

    if (!source || !target) {
      return;
    }

    if (source.cardCount <= 0) {
      return;
    }

    source.cardCount -= 1;
    target.cardCount += 1;
    this.lastTargetIndex = targetIndex;
  }
}


