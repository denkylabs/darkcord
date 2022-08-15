export class BitField<T extends number = number, FLAGS = Record<string, number>> {
  constructor (public raw: T, public flags: FLAGS) {}
  has (bits: T) {
    return (bits & this.raw) === bits;
  }

  toArray () {
    return Object.keys(this.flags).filter(bit => this.has((this.flags as Record<string, unknown>)[bit] as T));
  }
}
