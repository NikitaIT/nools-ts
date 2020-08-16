import { AgendaTree, IConstraint, IPattern, IObjectPattern } from "../import";
import { INode, IRootNode } from "../INode";

export interface IAliasNode extends INode {
  constraint: IObjectPattern; // IPattern[p] === constraint
  alias: string;
}
export interface IAliasNodeAfterCompile extends INode {
  constraint: IObjectPattern; // IPattern[p] === constraint
  p: number; // p === IndexOf IPattern[]
  // constraintAssert(it: any, fh?: any): boolean;
  eq(constraint: IAliasNode): boolean;
  alias: string;
}
export interface IAliasNodeData extends INode {
  p: number; // p === IndexOf IPattern[]
  alias: string;
}
export function alias(
  node: IAliasNodeData,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
): IAliasNode {
  const pattern = patterns[node.p] as IObjectPattern;
  return {
    // constraint: pt(node.constraint, defines, scope),
    constraint: pattern,
    alias: node.alias,
    id: node.id,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
  };
}
