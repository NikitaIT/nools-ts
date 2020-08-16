import { INode } from "../INode";

export type IAdapterNode = INode;
export function adapter(node: IAdapterNode): IAdapterNode {
  return {
    id: node.id,
    nodes: node.nodes,
    ps: node.ps,
    tp: node.tp,
  };
}
