import { Element } from '../../core/Element/Element';
import './Card.scss';

export class Card extends Element {
  #cardId;
  #pairId;

  constructor({ id, pairId }) {
    super({
      classNames: 'card',
      attributes: {
        'data-card-id': String(id),
        'data-pair-id': String(pairId),
      },
    });

    this.#cardId = id;
    this.#pairId = pairId;

    this.cardInner = new Element({ classNames: 'card__inner' }).render(
      this.element,
    );

    this.cardFront = new Element({
      classNames: 'card__face card__face_front',
    }).render(this.cardInner.element);

    this.cardBack = new Element({
      classNames: 'card__face card__face_back',
    }).render(this.cardInner.element);
  }

  get id() {
    return this.#cardId;
  }

  get pairId() {
    return this.#pairId;
  }
}
