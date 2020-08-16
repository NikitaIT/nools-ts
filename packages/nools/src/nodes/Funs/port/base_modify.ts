import { Args, FactObject, Fact, Context } from "../import";
import { Regestry } from "../Regestry";

export const base_modify: Args<FactObject, Fact | Context> = function (nodes, n, fact, wm) {
  const node = nodes[n];
  const fun = Regestry.modify[node.tp];
  if (!fun) {
    console.error(node, fact);
    for (const [outNode] of node.nodes.entries()) {
      base_modify(nodes, outNode, fact, wm);
    }
  } else {
    fun(nodes, n, fact, wm);
  }
};
