import { Element } from '../../core/Element/Element';
import './Modal.scss';

export class Modal extends Element {
  #window;
  #contentSlot;
  #onClose;
  #isOpen = false;

  constructor({ onClose } = {}) {
    super({ tagName: 'dialog', classNames: 'modal' });

    this.#onClose = onClose;

    this.#window = new Element({ classNames: 'modal__window' }).render(
      this.element,
    );

    this.#contentSlot = new Element({ classNames: 'modal__content' }).render(
      this.#window.element,
    );

    this.onClick((event) => {
      if (!this.#window.element.contains(event.target)) {
        this.close();
      }
    });

    this.element.addEventListener('close', () => {
      if (this.#isOpen) {
        this.#isOpen = false;
        document.body.classList.remove('modal-open');
        this.#onClose?.();
      }
    });
  }

  get isOpen() {
    return this.#isOpen;
  }

  open(content) {
    if (this.#isOpen) {
      return this;
    }

    if (content) {
      this.setContent(content);
    }

    this.#isOpen = true;
    document.body.classList.add('modal-open');
    this.element.showModal();

    return this;
  }

  close() {
    if (!this.#isOpen) {
      return this;
    }

    this.element.close();

    return this;
  }

  setContent(content) {
    while (this.#contentSlot.element.firstChild) {
      this.#contentSlot.element.firstChild.remove();
    }

    if (content) {
      content.render(this.#contentSlot);
    }

    return this;
  }
}
