import { Element } from '../../core/Element/Element';
import './Card.scss';

export class Card extends Element {
  #cardId;
  #pairId;
  #isFlipped = false;
  #isMatched = false;
  #isDisabled = false;
  #onSelect;

  constructor({ id, pairId, name, imageSrc, onSelect }) {
    super({
      classNames: 'card',
      attributes: {
        'data-card-id': String(id),
        'data-pair-id': String(pairId),
      },
    });

    this.#cardId = id;
    this.#pairId = pairId;
    this.#onSelect = onSelect;

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

    this.onClick(() => this.#clickHandler());
  }

  #createImage({ src, alt = '' }) {
    const img = document.createElement('img');
    img.className = 'card__image';
    img.src = src ?? '';
    img.alt = alt;
    img.draggable = false;

    return img;
  }

  #clickHandler() {
    if (!this.isClickable) {
      return;
    }

    this.#onSelect?.(this);
  }

  get id() {
    return this.#cardId;
  }

  get pairId() {
    return this.#pairId;
  }

  get isFlipped() {
    return this.#isFlipped;
  }

  get isMatched() {
    return this.#isMatched;
  }

  get isDisabled() {
    return this.#isDisabled;
  }

  get isClickable() {
    return !this.#isDisabled && !this.#isFlipped && !this.#isMatched;
  }

  flip() {
    if (this.#isFlipped || this.#isMatched) {
      return this;
    }

    this.#isFlipped = true;
    this.addClass('flipped');

    return this;
  }

  unflip() {
    if (!this.#isFlipped) {
      return this;
    }

    this.#isFlipped = false;
    this.removeClass('flipped');

    return this;
  }

  match() {
    this.#isMatched = true;
    this.addClass('matched');

    return this;
  }

  setDisabled(value) {
    this.#isDisabled = Boolean(value);
    this.toggleClass('disabled', this.#isDisabled);

    return this;
  }

  reset() {
    this.removeClass('flipped');
    this.removeClass('matched');
    this.removeClass('disabled');

    this.#isFlipped = false;
    this.#isMatched = false;
    this.#isDisabled = false;

    return this;
  }
}
