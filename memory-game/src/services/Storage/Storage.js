const STORAGE_KEY = 'fgriff-memory-game';

export class Storage {
  static getData() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);

      if (!rawData) {
        return [];
      }

      const data = JSON.parse(rawData);

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    } catch {
      return [];
    }
  }

  static saveData(results) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {}
  }

  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}
