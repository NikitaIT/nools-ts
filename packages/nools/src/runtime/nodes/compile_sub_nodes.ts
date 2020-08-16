import { clone } from "@nools/lodash-port";
import { IPattern } from "./import";
import { INode, INodeWithSubNodes } from "./INode";

export function compile_sub_nodes(patterns: IPattern[], node: INode & INodeWithSubNodes) {
  const n = clone(node, true);
  const nodes = (n.nodes = new Map<number, IPattern[]>());
  node.ns.forEach(([outNode, pattern]) => {
    if (!nodes.has(outNode)) {
      nodes.set(outNode, []);
    }
    nodes.get(outNode)!.push(patterns[pattern]);
  });
  return n;
}
