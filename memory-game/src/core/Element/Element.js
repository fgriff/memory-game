export class Element {
  #element;
  #listeners = [];

  constructor({
    tagName = 'div',
    classNames = [],
    textContent = '',
    attributes = {},
  } = {}) {
    this.#element = document.createElement(tagName);

    if (attributes) {
      const { class: _, ...rest } = attributes;

      Object.entries(rest).forEach(([name, value]) => {
        if (typeof value === 'boolean') {
          this.#element.toggleAttribute(name, value);
        } else {
          this.#element.setAttribute(name, value);
        }
      });
    }

    const classList = (
      Array.isArray(classNames) ? classNames : String(classNames).split(' ')
    ).filter(Boolean);

    if (classList.length) {
      this.#element.classList.add(...classList);
    }

    this.#element.textContent = textContent ?? '';
  }

  get element() {
    return this.#element;
  }

  render(parentNode) {
    const target =
      parentNode instanceof Element ? parentNode.element : parentNode;
    target.append(this.#element);

    return this;
  }

  on(eventName, handler, options) {
    this.#element.addEventListener(eventName, handler, options);
    this.#listeners.push({ eventName, handler, options });

    return this;
  }

  onClick(handler) {
    return this.on('click', handler);
  }
}
