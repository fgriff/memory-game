import { Storage } from '../Storage/Storage';
import { LEADERS_COUNT } from '../../utils/constants';

export class Leaderboard {
  static sort(results) {
    return results.slice().sort((a, b) => {
      if (a.moves !== b.moves) {
        return a.moves - b.moves;
      }

      return a.date - b.date;
    });
  }

  static getAll() {
    return Leaderboard.sort(Storage.getData());
  }

  static getTop(limit = LEADERS_COUNT) {
    return Leaderboard.getAll().slice(0, limit);
  }

  static isEmpty() {
    return Storage.getData().length === 0;
  }

  static addResult(moves, date = Date.now()) {
    const entry = { moves, date };
    const all = [...Storage.getData(), entry];
    const sorted = Leaderboard.sort(all);
    const top = sorted.slice(0, LEADERS_COUNT);
    Storage.saveData(top);
  }

  static clear() {
    Storage.clear();
  }
}
