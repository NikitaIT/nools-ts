import { clone } from "@nools/lodash-port";
import { AgendaTree, IConstraint, IPattern } from "../import";
import { IAlphaNode, IRootNode, IAlphaNodeBeforeCompile, IAlphaNodeData } from "../INode";

export interface IPropertyNode extends IAlphaNode {
  alias: string;
  constiables: any;
}
export interface IPropertyNodeData extends IAlphaNodeData {
  alias: string;
  constiables: any;
}
export interface IPropertyNodeBeforeCompile extends IAlphaNodeBeforeCompile {
  constraint: IConstraint;
  alias: string;
  constiables: any;
}
export function property(
  node: IPropertyNodeData,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[],
): IPropertyNodeBeforeCompile {
  const constraint = cs[node.c];
  const alias = node.alias;
  return {
    id: node.id,
    ca: constraint.assert,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
    constraint: constraint,
    alias: alias,
    constiables: clone(node.constiables),
  };
}
