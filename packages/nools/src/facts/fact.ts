let id = 0;
export class Fact<TObject = any> {
  object: TObject;
  id = id++;
  constructor(obj: TObject, public recency = 0) {
    this.object = obj;
  }
  equals(fact: TObject) {
    return fact === this.object;
  }

  hashCode() {
    return this.id;
  }
}
