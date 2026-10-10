import { Element } from '../../core/Element/Element';
import { Button } from '../Button/Button';
import './VictoryModal.scss';

export class VictoryModal extends Element {
  #title;
  #movesText;
  #onNewGame;
  #onClose;

  constructor({ onNewGame, onClose } = {}) {
    super({ classNames: 'victory' });

    this.#onNewGame = onNewGame;
    this.#onClose = onClose;

    this.#title = new Element({
      tagName: 'h2',
      classNames: 'victory__title',
      textContent: 'Победа!',
    }).render(this.element);

    this.#movesText = new Element({
      classNames: 'victory__moves',
    }).render(this.element);

    const actions = new Element({ classNames: 'victory__actions' }).render(
      this.element,
    );

    new Button({
      text: 'Новая игра',
      classNames: 'victory__btn',
    })
      .render(actions)
      .onClick(() => this.#onNewGame?.());

    new Button({
      text: 'Закрыть',
      classNames: 'victory__btn',
    })
      .render(actions)
      .onClick(() => this.#onClose?.());

    this.setMoves(0);
  }

  setMoves(moves) {
    this.#movesText.setText(`Ходов: ${moves}`);

    return this;
  }
}
