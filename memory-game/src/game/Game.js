import { createDeck } from '../services/Deck/Deck';
import { EventBus } from '../core/EventBus/EventBus';

const TOTAL_PAIRS = 8;
const MATCH_DELAY_MS = 1000;

export class Game {
  #bus;
  #deck = [];
  #moves = 0;
  #pairsFound = 0;
  #firstCard = null;
  #isLocked = false;
  #unmatchTimer = null;

  constructor(bus = new EventBus()) {
    this.#bus = bus;
    this.#startNewGame();
  }

  #startNewGame() {
    this.#deck = createDeck();
  }

  #emitState() {
    this.#bus.emit('state:update', {
      moves: this.#moves,
      pairsFound: this.#pairsFound,
      totalPairs: TOTAL_PAIRS,
    });
  }

  get deck() {
    return this.#deck;
  }

  get bus() {
    return this.#bus;
  }

  cardClickHandler(card) {
    if (this.#isLocked) {
      return;
    }

    if (!this.#firstCard) {
      this.#firstCard = card;
      this.#bus.emit('card:flip', { id: card.id });

      return;
    }

    if (this.#firstCard.id === card.id) {
      return;
    }

    this.#bus.emit('card:flip', { id: card.id });
    this.#moves += 1;
    this.#emitState();

    const first = this.#firstCard;
    this.#firstCard = null;

    if (first.pairId === card.pairId) {
      this.#pairsFound += 1;
      this.#bus.emit('card:match', { id: first.id });
      this.#bus.emit('card:match', { id: card.id });
      this.#emitState();

      return;
    }

    this.#isLocked = true;
    this.#bus.emit('card:disable', {});

    this.#unmatchTimer = setTimeout(() => {
      this.#unmatchTimer = null;
      this.#bus.emit('card:unflip', { id: first.id });
      this.#bus.emit('card:unflip', { id: card.id });
      this.#isLocked = false;
      this.#bus.emit('card:enable', {});
    }, MATCH_DELAY_MS);
  }
}
