import { Element } from '../../core/Element/Element';
import './Counter.scss';

const TOTAL_PAIRS = 8;

export class Counter extends Element {
  #movesCount;
  #pairsCount;

  constructor() {
    super({ classNames: 'counter' });

    this.#movesCount = new Element({ classNames: 'counter__item' }).render(
      this.element,
    );

    this.#pairsCount = new Element({ classNames: 'counter__item' }).render(
      this.element,
    );

    this.setMoves(0);
    this.setPairs(0);
  }

  setMoves(value) {
    this.#movesCount.setText(`Ходы: ${value}`);

    return this;
  }

  setPairs(value) {
    this.#pairsCount.setText(`Пары: ${value} из ${TOTAL_PAIRS}`);

    return this;
  }
}
