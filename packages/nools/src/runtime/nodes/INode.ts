import { IConstraint } from "../../constraint";
import { IPattern } from "../../pattern";

export enum nodeType {
  // notNodeType = 'not' | 'exists';
  not = 0,
  exists = 1,
  // joinNodeType = 'join' | 'from' | 'from-not' | 'exists-from' | notNodeType
  join = 2,
  from = 3,
  from_not = 4,
  exists_from = 5,
  // betaNodeType = 'beta' | joinNodeType
  beta = 6,
  // adapterNodeType = 'leftadapter' | 'rightadapter'
  leftadapter = 7,
  rightadapter = 8,
  // alphaNodeType = 'type' | 'alias' | 'equality' | 'property'
  type = 9,
  alias = 10,
  equality = 11,
  property = 12,
  // nodeType = 'terminal' | 'join-reference' | alphaNodeType | adapterNodeType | betaNodeType
  terminal = 13,
  join_reference = 14,
}

// SubNodesIndex = [outNode, pattern]
export type SubNodesIndex = [number, number];
export interface INode {
  tp: nodeType;
  ps: number[];
  id: number;
  nodes?: Map<number, IPattern[]>;
  root?: IRootNode;
}
export interface INodeWithPatterns {
  nodes: Map<number, IPattern[]>;
}
// ns in Root is INode[], in childs is SubNodesIndex[]
export interface INodeWithSubNodes {
  ns: SubNodesIndex[];
}

export interface IAlphaNode extends INode {
  constraint: IConstraint;
  c: number;
  ca(it: any, fh?: any): boolean;
  eq(constraint: IAlphaNode): boolean;
}
export interface IAlphaNodeData extends INode {
  c: number;
}
export interface IAlphaNodeBeforeCompile extends INode {
  ca(it: any, fh?: any): boolean;
}

export interface IBucket {
  counter: number;
  recency: number;
}

export interface IRootNode extends IBucketed {
  ns: Array<INode & INodeWithSubNodes>;
  ps: IPattern[];
  ts: number[];
  js: number[];
  as: number[];
  tps: number[];
  cs: IConstraint[];
}

export interface IBucketed {
  bucket: IBucket;
}
