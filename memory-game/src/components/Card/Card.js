import { Element } from '../../core/Element/Element';
import './Card.scss';

export class Card extends Element {
  #cardId;
  #pairId;

  constructor({ id, pairId, name, imageSrc }) {
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

    this.cardBack.element.append(
      this.#createImage({ src: imageSrc, alt: name }),
    );
  }

  #createImage({ src, alt = '' }) {
    const img = document.createElement('img');
    img.className = 'card__image';
    img.src = src ?? '';
    img.alt = alt;

    return img;
  }

  get id() {
    return this.#cardId;
  }

  get pairId() {
    return this.#pairId;
  }
}
