import { Facts } from "../WorkingMemory";

export type ILinkNode<T> = IFirstNode<T> | ILastNode<T> | IMiddleNode<T>;

export type IFirstNode<T> = {
  data: T;
  prev?: null | undefined;
  next?: IMiddleNode<T> | ILastNode<T>;
};
export type ILastNode<T> = {
  data: T;
  prev?: IFirstNode<T> | IMiddleNode<T>;
  next?: null | undefined;
};
export type IMiddleNode<T> = {
  data: T;
  prev: IFirstNode<T> | IMiddleNode<T> | ILastNode<T>;
  next: IFirstNode<T> | IMiddleNode<T> | ILastNode<T>;
};

export interface ILinkedList<T> {
  head: ILinkNode<T> | null;
  push(data: T): ILinkNode<T>;

  remove(node: ILinkNode<T>): void;

  clear(): void;

  forEach(cb: (data: T) => void): void;

  toArray(): T[];

  removeByData(data: T): void;

  [Symbol.iterator](): IterableIterator<ILinkNode<T>>;
}
export class LinkedList<T> implements ILinkedList<T>, Facts<T> {
  head: IFirstNode<T> | null = null;
  tail: ILastNode<T> | null = null;
  length = 0;

  public push(data: T) {
    const tailOld = this.tail;
    this.tail = createNodeAfter(tailOld, data);
    if (tailOld) {
      ((tailOld as any) as IFirstNode<T>).next = this.tail;
    }
    if (!this.head) {
      this.head = this.tail as IFirstNode<T>;
    }
    this.length++;
    return this.tail;
  }

  public remove(node: ILinkNode<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next as IFirstNode<T>;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev as ILastNode<T>;
    }
    //node.data = node.prev = node.next = null;
    this.length--;
  }
  *[Symbol.iterator]() {
    for (
      let head: ILinkNode<T> | null | undefined = this.head;
      head;
      head = head.next
    ) {
      yield head;
    }
  }
  public forEach(cb: (data: T) => void) {
    for (let head of this) {
      cb(head.data);
    }
  }

  public toArray() {
    let ret: T[] = [];
    for (let head of this) {
      // ret.push(head);		// todo need test
      ret.push(head.data);
    }
    return ret;
  }

  public removeByData(data: T) {
    for (let head of this) {
      if (head.data === data) {
        this.remove(head);
        break;
      }
    }
  }

  public clear() {
    this.head = this.tail = null;
    this.length = 0;
  }
}

function createNodeAfter<T>(tail: ILastNode<T> | null, data: T): ILastNode<T> {
  return { data: data, prev: tail as any };
}
