export class Item {
  constructor(public id: number, public quantity: number) {}

  // Method to convert Item to plain object
  toPlainObject() {
    return {
      id: this.id,
      quantity: this.quantity,
    };
  }
}
