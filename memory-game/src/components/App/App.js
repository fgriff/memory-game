import { Element } from '../../core/Element/Element';
import { Header } from '../Header/Header';
import { Counter } from '../Counter/Counter';
import { Board } from '../Board/Board';
import { Game } from '../../game/Game';
import './App.scss';

export class App extends Element {
  #game;
  #header;
  #counter;
  #board;
  #boardContainer;

  constructor() {
    super({ classNames: 'app' });

    this.#game = new Game();

    this.#header = new Header().render(this.element);

    this.#counter = new Counter().render(this.element);

    this.#boardContainer = new Element({
      classNames: 'app__board-container',
    }).render(this.element);

    this.#board = this.#createBoard(this.#game.deck);

    this.#bindGameEvents();
  }

  #createBoard(deck) {
    const board = new Board({
      deck,
      onSelect: (card) => this.#game.cardClickHandler(card),
    }).render(this.#boardContainer);

    return board;
  }

  #bindGameEvents() {
    const bus = this.#game.bus;

    bus.subscribe('card:flip', ({ id }) => this.#findCard(id)?.flip());
  }

  #findCard(id) {
    return this.#board.cards.find((card) => card.id === id);
  }
}
