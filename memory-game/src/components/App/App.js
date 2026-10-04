import { Element } from '../../core/Element/Element';
import { Board } from '../Board/Board';
import { Header } from '../Header/Header';
import './App.scss';

export class App extends Element {
  constructor() {
    super({ classNames: 'app' });

    this.header = new Header().render(this.element);

    this.board = new Board().render(this.element);
  }
}
