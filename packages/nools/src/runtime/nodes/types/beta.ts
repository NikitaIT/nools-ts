import { IMemory, ITuple, Memory } from "../import";
import { INode } from "../INode";

export interface IBetaNode extends INode {
  leftMemory: { [hasCode: string]: ITuple };
  rightMemory: { [hasCode: string]: ITuple };
  leftTuples: IMemory;
  rightTuples: IMemory;
}
export function beta(node: IBetaNode): IBetaNode {
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
