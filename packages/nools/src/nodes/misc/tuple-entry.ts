import { Table, ITreeData } from "./table";
import { Context } from "../../context";

let TUPLE_ID = 0;

export interface ITuple {
  data: Context;
  tuples: TupleEntry[];
  hashCode: number;
  prev: ITuple | null;
  next: ITuple | null;
}

export class TupleEntry {
  tuples: ITuple[] = [];
  // protected tupleMap = new WeakMap<K, V>();
  protected hashCode = TUPLE_ID++;
  tables = new Map<string, Table>();
  protected entry: Table;
  protected canRemove = false;
  protected length = 0;
  protected val: ITreeData | null;
  constructor(val: ITreeData | null, entry: Table, canRemove: boolean) {
    this.val = val;
    this.canRemove = canRemove;
    this.entry = entry;
  }
  reset() {
    this.tables = new Map<string, Table>();
    return this.tables;
  }
  // constructor(entry: Table, canRemove: boolean) {
  // 	this.canRemove = canRemove;
  // 	this.entry = entry;
  // }

  addNode(node: ITuple) {
    this.tuples[this.length++] = node;
    if (this.length > 1) {
      this.entry.clearCache();
    }
    return this;
  }

  removeNode(node: ITuple) {
    const tuples = this.tuples,
      index = tuples.indexOf(node);
    if (index !== -1) {
      tuples.splice(index, 1);
      this.length--;
      this.entry.clearCache();
    }
    if (this.canRemove && !this.length) {
      this.entry.remove(this.val!);
    }
  }
}
