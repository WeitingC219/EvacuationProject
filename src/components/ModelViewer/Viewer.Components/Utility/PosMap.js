export default class PosMap {
  constructor() {
    this._map = new Map();
  }

  static _idString([x, y]) {
    return `${x}x${y}`;
  }

  add([x, y], score) {
    const idString = PosMap._idString([x, y]);

    if (!this._map.has(idString)) {
      this._map.set(idString, score);
    }
  }

  isEmpty() {
    return this._map.size === 0;
  }

  has([x, y]) {
    return this._map.has(PosMap._idString([x, y]));
  }

  get([x, y], defaultValue) {
    const idString = PosMap._idString([x, y]);

    if (this._map.has(idString)) {
      return this._map.get(idString);
    }
    return defaultValue;
  }

  set([x, y], score) {
    return this._map.set(PosMap._idString([x, y]), score);
  }

  remove([x, y]) {
    return this._map.delete(PosMap._idString([x, y]));
  }
}
