import { AgendaTree, IConstraint, IPattern } from "../import";
import { IRootNode, IAlphaNode, IAlphaNodeBeforeCompile } from "./INode";

export interface IEqualityNode extends IAlphaNode {
  memory: Map<string, boolean>;
}
export interface IEqualityNodeBeforeCompile extends IAlphaNodeBeforeCompile {
  memory: Map<string, boolean>;
}
export function equality(
  node: IEqualityNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[]
): IEqualityNodeBeforeCompile {
  const constraint = cs[node.c];
  return {
    id: node.id,
    ca: constraint.assert,
    nodes: node.nodes,
    ps: node.ps,
    memory: new Map<string, boolean>(),
    tp: node.tp,
  };
}
