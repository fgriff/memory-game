import { Element } from '../../core/Element/Element';
import { Card } from '../Card/Card';
import './Board.scss';

export class Board extends Element {
  #cards = [];

  constructor({ deck }) {
    super({ classNames: 'game-field' });

    this.#cards = deck.map((cardData) =>
      new Card({
        id: cardData.id,
        pairId: cardData.pairId,
        name: cardData.name,
        imageSrc: cardData.imageSrc,
      }).render(this.element),
    );
  }
}
