import { INode, INodeWithPatterns } from "../import";
import { Regestry } from "../Regestry";

export function base_dispose(nodes: Array<INode & INodeWithPatterns>, n: number) {
  const node = nodes[n];
  const fun = Regestry.dispose[node.tp];
  if (!fun) {
    for (const [outNode] of node.nodes.entries()) {
      base_dispose(nodes, outNode);
    }
  } else {
    fun(nodes, n);
  }
}
