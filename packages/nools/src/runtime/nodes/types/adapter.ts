import { IConstraint, IPattern, AgendaTree } from "../import";
import { INode, IRootNode } from "./INode";

export interface IAdapterNode extends INode {}
export function adapter(
  node: IAdapterNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[]
): IAdapterNode {
  return {
    id: node.id,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
  };
}
