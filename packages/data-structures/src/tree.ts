function compare(a: number, b: number) {
  const ret = 0;
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else if (!b) {
    return 1;
  }
  return ret;
}

function isNotUndefinedOrNull<T>(val: T | null | undefined): val is T {
  return val !== undefined && val !== null;
}

export type Dir = "left" | "right";

export interface ITreeNode<T> extends Record<Dir, ITreeNode<T> | null> {
  data: T;
  parent?: ITreeNode<T> | null | undefined;
  // left?: ITreeNode<T> | null | undefined;
  // right?: ITreeNode<T> | null | undefined;
  level?: number;
  balance?: number;
  red?: boolean;
  // [dir: string]: ITreeNode<T> | T | number | boolean;
}
export const enum Order {
  PRE = "pre_order",
  IN = "in_order",
  POST = "post_order",
  REVERSE = "reverse_order",
}

export class Tree<T> {
  private __root: ITreeNode<T> | null = null;
  constructor(cmp?: (a: T, b: T) => number) {
    cmp && (this.compare = cmp);
  }
  public compare = (compare as any) as (a: T, b: T) => number;
  get root() {
    return this.__root;
  }
  protected setRoot(root: ITreeNode<T> | null) {
    this.__root = root;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insert(data: T): void {
    throw new Error("Not Implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove(data: T): void {
    throw new Error("Not Implemented");
  }

  clear() {
    this.setRoot(null);
  }

  isEmpty() {
    return !this.root;
  }

  print() {
    this.__printNode(this.root, 0);
  }
  /**
   * Prints a node
   * @param node node to print
   * @param level the current level the node is at, Used for formatting
   */
  __printNode(node?: ITreeNode<T> | null, level = 0) {
    //console.log(level);
    const str: string[] = [];
    if (isNotUndefinedOrNull(node)) {
      this.__printNode(node.right, level + 1);
      str.push("\t".repeat(level));
      str.push(node.data + "\n");
      console.log(str.join(""));
      this.__printNode(node.left, level + 1);
    } else {
      str.push("\t".repeat(level));
      str.push("~");
      console.log(str.join(""));
    }
  }

  forEach(cb: (data: T, tree: Tree<T>) => void, order: Order) {
    if (typeof cb !== "function") {
      throw new TypeError();
    }
    order = order || Order.IN;
    this.traverse(this.root, order, (node) => {
      cb(node, this);
    });
  }

  traverse(node: ITreeNode<T> | null | undefined, order: Order = Order.PRE, callback: (data: T) => void) {
    if (!node) {
      return;
    }
    if (order === Order.PRE) {
      callback(node.data);
      this.traverse(node.left, order, callback);
      this.traverse(node.right, order, callback);
    } else if (order === Order.IN) {
      this.traverse(node.left, order, callback);
      callback(node.data);
      this.traverse(node.right, order, callback);
    } else if (order === Order.POST) {
      this.traverse(node.left, order, callback);
      this.traverse(node.right, order, callback);
      callback(node.data);
    } else if (order === Order.REVERSE) {
      this.traverse(node.right, order, callback);
      callback(node.data);
      this.traverse(node.left, order, callback);
    }
  }

  traverseWithCondition(
    node: ITreeNode<T> | null | undefined,
    order: Order = Order.PRE,
    callback: (data: T) => boolean,
  ): boolean {
    let cont = true;
    if (node) {
      if (order === Order.PRE) {
        cont = callback(node.data);
        if (cont) {
          cont = this.traverseWithCondition(node.left, order, callback);
          if (cont) {
            cont = this.traverseWithCondition(node.right, order, callback);
          }
        }
      } else if (order === Order.IN) {
        cont = this.traverseWithCondition(node.left, order, callback);
        if (cont) {
          cont = callback(node.data);
          if (cont) {
            cont = this.traverseWithCondition(node.right, order, callback);
          }
        }
      } else if (order === Order.POST) {
        cont = this.traverseWithCondition(node.left, order, callback);
        if (cont) {
          if (cont) {
            cont = this.traverseWithCondition(node.right, order, callback);
          }
          if (cont) {
            cont = callback(node.data);
          }
        }
      } else if (order === Order.REVERSE) {
        cont = this.traverseWithCondition(node.right, order, callback);
        if (cont) {
          cont = callback(node.data);
          if (cont) {
            cont = this.traverseWithCondition(node.left, order, callback);
          }
        }
      }
    }
    return cont;
  }

  map(cb: (data: T, tree: Tree<T>) => T, order: Order) {
    if (typeof cb !== "function") {
      throw new TypeError();
    }

    order = order || Order.IN;
    const ret = new Tree<T>();
    this.traverse(this.root, order, (node) => {
      ret.insert(cb(node, this));
    });
    return ret;
  }

  filter(cb: (data: T, tree: Tree<T>) => boolean, order: Order) {
    if (typeof cb !== "function") {
      throw new TypeError();
    }

    order = order || Order.IN;
    const ret = new Tree<T>();
    this.traverse(this.root, order, (node) => {
      if (cb(node, this)) {
        ret.insert(node);
      }
    });
    return ret;
  }
  some(cb: (data: T, tree: Tree<T>) => boolean, order: Order) {
    if (typeof cb !== "function") {
      throw new TypeError();
    }

    order = order || Order.IN;
    let ret = false;
    this.traverseWithCondition(this.root, order, (node) => {
      ret = cb(node, this);
      return !ret;
    });
    return ret;
  }
  every(cb: (data: T, tree: Tree<T>) => boolean, order: Order) {
    if (typeof cb !== "function") {
      throw new TypeError();
    }
    order = order || Order.IN;
    let ret = false;
    this.traverseWithCondition(this.root, order, (node) => {
      ret = cb(node, this);
      return ret;
    });
    return ret;
  }

  toArray(order?: Order) {
    order = order || Order.IN;
    const arr: T[] = [];
    this.traverse(this.root, order, function (node) {
      arr.push(node);
    });
    return arr;
  }

  reduce(
    fun: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
    accumulator?: T,
    order?: Order,
  ): T;
  reduce<U>(
    fun: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
    accumulator?: U,
    order?: Order,
  ): U;
  reduce(fun: any, accumulator: any, order: Order) {
    const arr = this.toArray(order);
    return arr.reduce(fun, accumulator);
  }

  reduceRight(
    fun: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
    accumulator?: T,
    order?: Order,
  ): T;

  reduceRight<U>(
    fun: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => T,
    accumulator?: U,
    order?: Order,
  ): U;
  reduceRight(fun: any, accumulator: any, order: Order) {
    const arr = this.toArray(order);
    return arr.reduceRight(fun, accumulator);
  }

  contains(value: T) {
    let ret = false;
    let root = this.root;
    while (root !== null) {
      const cmp = this.compare(value, root.data);
      if (cmp) {
        root = (cmp === -1 ? root.left : root.right) || null;
      } else {
        ret = true;
        root = null;
      }
    }
    return ret;
  }

  find(value: T) {
    let ret: T | undefined = undefined;
    let root = this.root;
    while (root) {
      const cmp = this.compare(value, root.data);
      if (cmp) {
        root = (cmp === -1 ? root.left : root.right) || null;
      } else {
        ret = root.data;
        break;
      }
    }
    return ret;
  }

  findLessThan(value: T, exclusive?: boolean) {
    //find a better way!!!!
    const ret: T[] = [];
    const compare = this.compare;
    this.traverseWithCondition(this.root, Order.IN, function (v) {
      const cmp = compare(value, v);
      if ((!exclusive && cmp === 0) || cmp === 1) {
        ret.push(v);
        return true;
      } else {
        return false;
      }
    });
    return ret;
  }

  findGreaterThan(value: T, exclusive?: boolean) {
    //find a better way!!!!
    const ret: T[] = [];
    const compare = this.compare;
    this.traverse(this.root, Order.REVERSE, function (v) {
      const cmp = compare(value, v);
      if ((!exclusive && cmp === 0) || cmp === -1) {
        ret.push(v);
        return true;
      } else {
        return false;
      }
    });
    return ret;
  }
}
