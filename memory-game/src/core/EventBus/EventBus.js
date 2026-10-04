export class EventBus {
  #listeners = new Map();

  subscribe(eventName, handler) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, new Set());
    }

    this.#listeners.get(eventName).add(handler);

    return () => this.unsubscribe(eventName, handler);
  }

  unsubscribe(eventName, handler) {
    this.#listeners.get(eventName)?.delete(handler);
  }

  emit(eventName, payload) {
    this.#listeners.get(eventName)?.forEach((handler) => handler(payload));
  }
}
