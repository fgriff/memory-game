import { createDeck } from '../services/Deck/Deck';
import { EventBus } from '../core/EventBus/EventBus';

export class Game {
  #bus;
  #deck = [];
  #firstCard = null;

  constructor(bus = new EventBus()) {
    this.#bus = bus;
    this.#startNewGame();
  }

  #startNewGame() {
    this.#deck = createDeck();
  }

  get deck() {
    return this.#deck;
  }

  get bus() {
    return this.#bus;
  }

  cardClickHandler(card) {
    if (!this.#firstCard) {
      this.#firstCard = card;
      this.#bus.emit('card:flip', { id: card.id });

      return;
    }
  }
}
