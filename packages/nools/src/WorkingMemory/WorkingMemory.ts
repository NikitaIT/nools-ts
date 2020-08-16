import { Fact } from "../facts/fact";
import { InitialFact } from "../facts/initial";
import { ILinkNode } from "../STD";
import { FactNotExistsError } from "./FactNotExistsError";

export interface Facts<T> {
  head: ILinkNode<T> | null;

  push(data: T): ILinkNode<T>;

  remove(node: ILinkNode<T>): void;

  clear(): void;

  [Symbol.iterator](): IterableIterator<ILinkNode<T>>;
}
// todo: may be not class?
export type FactObject = any;
export class WorkingMemory<TObject extends FactObject> {
  constructor(private readonly facts: Facts<Fact<TObject>>, private recency: number = 0) {}

  dispose() {
    this.facts.clear();
  }

  getFacts() {
    const ret: any[] = [];
    for (const head of this.facts) {
      const val = head.data.object;
      if (!(val instanceof InitialFact)) {
        ret.push(val);
      }
    }
    return ret;
  }

  // typeof TObject
  getFactsByType<TType extends new (...args: any) => any>(Type: TType): Array<InstanceType<TType>> {
    const ret: any[] = [];
    for (const head of this.facts) {
      const val = head.data.object;
      if (
        !(val instanceof InitialFact) &&
        // @ts-ignore
        (val instanceof Type || val.constructor === Type)
      ) {
        ret.push(val);
      }
    }
    return ret;
  }

  getFactHandle(o: TObject) {
    for (const head of this.facts) {
      const existingFact = head.data;
      if (existingFact.equals(o)) {
        return existingFact;
      }
    }
    return new Fact(o, this.recency++);
  }

  modifyFact(o: TObject) {
    for (const head of this.facts) {
      const existingFact = head.data;
      if (existingFact.equals(o)) {
        existingFact.recency = this.recency++;
        return existingFact;
      }
    }
    //if we made it here we did not find the fact
    throw new FactNotExistsError();
  }

  assertFact(o: TObject) {
    const ret = new Fact(o, this.recency++);
    this.facts.push(ret);
    return ret;
  }

  retractFact(o: TObject) {
    const facts = this.facts;
    for (const head of facts) {
      const existingFact = head.data;
      if (existingFact.equals(o)) {
        facts.remove(head);
        return existingFact;
      }
    }
    //if we made it here we did not find the fact
    throw new FactNotExistsError();
  }
}
