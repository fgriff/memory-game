import { Element } from '../../core/Element/Element';
import { Card } from '../Card/Card';
import './Board.scss';

export class Board extends Element {
  #cards = [];
  #onCardSelect;

  constructor({ deck, onSelect }) {
    super({ classNames: 'game-field' });

    this.#onCardSelect = onSelect;

    this.#cards = deck.map((cardData) =>
      new Card({
        id: cardData.id,
        pairId: cardData.pairId,
        name: cardData.name,
        imageSrc: cardData.imageSrc,
        onSelect: (card) => this.#onCardSelect?.(card),
      }).render(this.element),
    );
  }

  get cards() {
    return this.#cards;
  }
}
