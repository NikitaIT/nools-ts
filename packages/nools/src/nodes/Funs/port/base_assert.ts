import { Regestry } from "../Regestry";
import { Args, FactObject, Fact, Context } from "../import";

export const base_assert: Args<FactObject, Fact | Context> = function (nodes, n, fact, wm) {
  const node = nodes[n];
  const fun = Regestry.assert[node.tp];
  if (!fun) {
    console.error(node, fact);
    for (const [outNode] of node.nodes.entries()) {
      base_assert(nodes, outNode, fact, wm);
    }
  } else {
    fun(nodes, n, fact, wm);
  }
};
