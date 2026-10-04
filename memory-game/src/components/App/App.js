import { Element } from '../../core/Element/Element';
import { Header } from '../Header/Header';
import { Counter } from '../Counter/Counter';
import { Board } from '../Board/Board';
import './App.scss';

export class App extends Element {
  #header;
  #counter;
  #board;

  constructor() {
    super({ classNames: 'app' });

    this.#header = new Header().render(this.element);

    this.#counter = new Counter().render(this.element);

    this.#board = new Board().render(this.element);
  }
}
