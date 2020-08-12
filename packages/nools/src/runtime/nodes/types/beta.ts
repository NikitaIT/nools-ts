import {
  AgendaTree,
  IConstraint,
  IMemory,
  IPattern,
  ITuple,
  Memory,
} from "../import";
import { INode, IRootNode } from "./INode";

export interface IBetaNode extends INode {
  leftMemory: { [hasCode: string]: ITuple };
  rightMemory: { [hasCode: string]: ITuple };
  leftTuples: IMemory;
  rightTuples: IMemory;
}
export function beta(
  node: IBetaNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[]
): IBetaNode {
  return {
    id: node.id,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
    leftMemory: {},
    rightMemory: {},
    leftTuples: Memory(),
    rightTuples: Memory(),
  };
}
