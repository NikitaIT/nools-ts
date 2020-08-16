import { Args, FactObject, Context, Fact } from "../import";
import { Regestry } from "../Regestry";

export const base_retract: Args<FactObject, Fact | Context> = function (nodes, n, fact, wm) {
  const node = nodes[n];
  const fun = Regestry.retract[node.tp];
  if (!fun) {
    console.error(node, fact);
    for (const [outNode] of node.nodes.entries()) {
      base_retract(nodes, outNode, fact, wm);
    }
  } else {
    fun(nodes, n, fact, wm);
  }
};
