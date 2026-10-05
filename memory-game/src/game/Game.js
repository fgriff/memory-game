import { createDeck } from '../services/Deck/Deck';
import { EventBus } from '../core/EventBus/EventBus';
import {
  EVENT_CARD_DISABLE,
  EVENT_CARD_ENABLE,
  EVENT_CARD_FLIP,
  EVENT_CARD_MATCH,
  EVENT_CARD_UNFLIP,
  EVENT_GAME_NEW,
  EVENT_GAME_WIN,
  EVENT_STATE_UPDATE,
  MATCH_DELAY_MS,
  PAIRS_COUNT,
} from '../utils/constants';

export class Game {
  #bus;
  #deck = [];
  #moves = 0;
  #pairsFound = 0;
  #firstCard = null;
  #isLocked = false;
  #unmatchTimer = null;
  #isFinished = false;

  constructor(bus = new EventBus()) {
    this.#bus = bus;
    this.#startNewGame();
  }

  #startNewGame() {
    if (this.#unmatchTimer !== null) {
      clearTimeout(this.#unmatchTimer);
      this.#unmatchTimer = null;
    }

    this.#deck = createDeck();
    this.#moves = 0;
    this.#pairsFound = 0;
    this.#firstCard = null;
    this.#isLocked = false;
    this.#isFinished = false;

    this.#bus.emit(EVENT_GAME_NEW, { deck: this.#deck });
    this.#emitState();
  }

  #emitState() {
    this.#bus.emit(EVENT_STATE_UPDATE, {
      moves: this.#moves,
      pairsFound: this.#pairsFound,
      totalPairs: PAIRS_COUNT,
    });
  }

  get deck() {
    return this.#deck;
  }

  get bus() {
    return this.#bus;
  }

  cardClickHandler(card) {
    if (this.#isFinished) {
      return;
    }

    if (this.#isLocked) {
      return;
    }

    if (!this.#firstCard) {
      this.#firstCard = card;
      this.#bus.emit(EVENT_CARD_FLIP, { id: card.id });

      return;
    }

    if (this.#firstCard.id === card.id) {
      return;
    }

    this.#bus.emit(EVENT_CARD_FLIP, { id: card.id });
    this.#moves += 1;
    this.#emitState();

    const first = this.#firstCard;
    this.#firstCard = null;

    if (first.pairId === card.pairId) {
      this.#pairsFound += 1;
      this.#bus.emit(EVENT_CARD_MATCH, { id: first.id });
      this.#bus.emit(EVENT_CARD_MATCH, { id: card.id });
      this.#emitState();

      if (this.#pairsFound === PAIRS_COUNT) {
        this.#isFinished = true;
        this.#bus.emit(EVENT_GAME_WIN, { moves: this.#moves });
      }

      return;
    }

    this.#isLocked = true;
    this.#bus.emit(EVENT_CARD_DISABLE, {});

    this.#unmatchTimer = setTimeout(() => {
      this.#unmatchTimer = null;
      this.#bus.emit(EVENT_CARD_UNFLIP, { id: first.id });
      this.#bus.emit(EVENT_CARD_UNFLIP, { id: card.id });
      this.#isLocked = false;
      this.#bus.emit(EVENT_CARD_ENABLE, {});
    }, MATCH_DELAY_MS);
  }

  startNewGame() {
    this.#startNewGame();
  }
}
