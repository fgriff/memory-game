import { Element } from '../../core/Element/Element';
import { PAIRS_COUNT } from '../../utils/constants';
import './Counter.scss';

export class Counter extends Element {
  #movesCount;
  #pairsCount;

  constructor() {
    super({ tagName: 'section', classNames: 'counter' });

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
    this.#pairsCount.setText(`Пары: ${value} из ${PAIRS_COUNT}`);

    return this;
  }
}
