import { AgendaTree, IConstraint, IPattern } from "../import";
import { IAlphaNode, IAlphaNodeBeforeCompile, IRootNode } from "../INode";

export type ITypeNode = IAlphaNode;

export type ITypeNodeBeforeCompile = IAlphaNodeBeforeCompile;
export function tp(
  node: ITypeNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[],
): ITypeNodeBeforeCompile {
  const constraint = cs[node.c];
  return {
    id: node.id,
    ca: constraint.assert,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
  };
}
