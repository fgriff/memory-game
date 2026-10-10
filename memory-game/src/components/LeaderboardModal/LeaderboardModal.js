import { Element } from '../../core/Element/Element';
import { Button } from '../Button/Button';
import { formatDate } from '../../utils/formatDate';
import { Leaderboard } from '../../services/Leaderboard/Leaderboard';
import './LeaderboardModal.scss';

export class LeaderboardModal extends Element {
  #body;
  #onClose;

  constructor({ onClose } = {}) {
    super({ classNames: 'leaderboard' });

    this.#onClose = onClose;

    new Element({
      tagName: 'h2',
      classNames: 'leaderboard__title',
      textContent: 'Таблица лидеров',
    }).render(this.element);

    this.#body = new Element({ classNames: 'leaderboard__body' }).render(
      this.element,
    );

    const actions = new Element({ classNames: 'leaderboard__actions' }).render(
      this.element,
    );

    new Button({
      text: 'Закрыть',
      classNames: 'leaderboard__btn',
    })
      .render(actions)
      .onClick(() => this.#onClose?.());

    this.refresh();
  }

  #clearBody() {
    while (this.#body.element.firstChild) {
      this.#body.element.firstChild.remove();
    }
  }

  #createTable(results) {
    const table = document.createElement('table');
    table.className = 'leaderboard__table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Место', 'Ходы', 'Дата'].forEach((label) => {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.append(th);
    });
    thead.append(headRow);

    const tbody = document.createElement('tbody');
    results.forEach((item, index) => {
      const tr = document.createElement('tr');

      const place = document.createElement('td');
      place.textContent = String(index + 1);

      const moves = document.createElement('td');
      moves.textContent = String(item.moves);

      const date = document.createElement('td');
      date.textContent = formatDate(item.date);

      tr.append(place, moves, date);
      tbody.append(tr);
    });

    table.append(thead, tbody);

    return table;
  }

  refresh() {
    this.#clearBody();

    const results = Leaderboard.getTop();

    if (results.length === 0) {
      new Element({
        classNames: 'leaderboard__empty',
        textContent: 'Пока нет результатов',
      }).render(this.#body);

      return;
    }

    const table = this.#createTable(results);
    this.#body.element.append(table);

    return this;
  }
}
