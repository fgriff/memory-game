import { Element } from '../../core/Element/Element';
import { Button } from '../Button/Button';
import './Header.scss';

export class Header extends Element {
  constructor({ onNewGame, onOpenLeaderboard } = {}) {
    super({ tagName: 'header', classNames: 'header' });

    this.newGameButton = new Button({
      text: 'Новая игра',
      classNames: 'header__btn',
    }).render(this.element);

    this.newGameButton.onClick(() => onNewGame?.());

    this.leaderboardButton = new Button({
      text: 'Таблица лидеров',
      classNames: 'header__btn',
    }).render(this.element);

    this.leaderboardButton.onClick(() => onOpenLeaderboard?.());
  }
}
