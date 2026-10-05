import { Element } from '../../core/Element/Element';
import { Header } from '../Header/Header';
import { Counter } from '../Counter/Counter';
import { Board } from '../Board/Board';
import { Game } from '../../game/Game';
import { Modal } from '../Modal/Modal';
import { VictoryModal } from '../VictoryModal/VictoryModal';
import { LeaderboardModal } from '../LeaderboardModal/LeaderboardModal';
import { Leaderboard } from '../../services/Leaderboard/Leaderboard';
import './App.scss';

export class App extends Element {
  #game;
  #header;
  #counter;
  #board;
  #boardContainer;
  #modal;
  #victoryContent;
  #leaderboardContent;

  constructor() {
    super({ classNames: 'app' });

    this.#game = new Game();

    this.#header = new Header({
      onNewGame: () => this.#game.startNewGame(),
      onOpenLeaderboard: () => this.#openLeaderboard(),
    }).render(this.element);

    this.#counter = new Counter().render(this.element);

    this.#boardContainer = new Element({
      classNames: 'app__board-container',
    }).render(this.element);

    this.#board = this.#createBoard(this.#game.deck);

    this.#modal = new Modal().render(this.element);

    this.#victoryContent = new VictoryModal({
      onNewGame: () => {
        this.#modal.close();
        this.#game.startNewGame();
      },
      onClose: () => this.#modal.close(),
    });

    this.#leaderboardContent = new LeaderboardModal({
      onClose: () => this.#modal.close(),
    });

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

    bus.subscribe('state:update', ({ moves, pairsFound }) => {
      this.#counter.setMoves(moves);
      this.#counter.setPairs(pairsFound);
    });

    bus.subscribe('card:flip', ({ id }) => this.#findCard(id)?.flip());
    bus.subscribe('card:unflip', ({ id }) => this.#findCard(id)?.unflip());
    bus.subscribe('card:match', ({ id }) => this.#findCard(id)?.match());
    bus.subscribe('card:disable', () => {
      this.#board.cards.forEach((card) => card.setDisabled(true));
    });
    bus.subscribe('card:enable', () => {
      this.#board.cards.forEach((card) => card.setDisabled(false));
    });
    bus.subscribe('game:win', ({ moves }) => this.#winHandler(moves));
    bus.subscribe('game:new', ({ deck }) => {
      this.#board.destroy();
      this.#board = this.#createBoard(deck);
    });
  }

  #findCard(id) {
    return this.#board.cards.find((card) => card.id === id);
  }

  #winHandler(moves) {
    Leaderboard.addResult(moves);
    this.#victoryContent.setMoves(moves);
    this.#modal.open(this.#victoryContent);
  }

  #openLeaderboard() {
    this.#leaderboardContent.refresh();
    this.#modal.open(this.#leaderboardContent);
  }
}
