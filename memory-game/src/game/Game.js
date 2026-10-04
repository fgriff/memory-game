import { createDeck } from '../services/Deck/Deck';

export class Game {
  #deck = [];

  constructor() {
    this.#startNewGame();
  }

  #startNewGame() {
    this.#deck = createDeck();
  }

  get deck() {
    return this.#deck;
  }
}
