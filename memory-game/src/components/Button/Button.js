import { Element } from '../../core/Element/Element';
import './Button.scss';

export class Button extends Element {
  constructor({ text, classNames }) {
    super({
      tagName: 'button',
      classNames: `btn ${classNames}`,
      textContent: text,
    });
  }
}
