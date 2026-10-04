import { Element } from '../../core/Element/Element';
import { Card } from '../Card/Card';
import { createDeck } from '../../services/Deck/Deck';
import './Board.scss';

export class Board extends Element {
  #cards = [];

  constructor() {
    super({ classNames: 'game-field' });

    this.#cards = createDeck().map((cardData) =>
      new Card({
        id: cardData.id,
        pairId: cardData.pairId,
        name: cardData.name,
        imageSrc: cardData.imageSrc,
      }).render(this.element),
    );
  }
}
