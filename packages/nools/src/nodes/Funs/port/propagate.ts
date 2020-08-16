import { intersection } from "@nools/lodash-port";
import { base_assert } from "./base_assert";
import { base_dispose } from "./base_dispose";
import { Args, Context, FactObject, INode, INodeWithPatterns } from "../import";
import { base_modify } from "./base_modify";
import { base_retract } from "./base_retract";

export const propagate_modify = propagate_smf(base_modify);
export const propagate_retract = propagate_smf(base_retract);
export const propagate_assert = propagate_smf(base_assert);
export function propagate_smf<TObject extends FactObject>(fn: Args<TObject>): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n];
    for (const [outNode, paths] of node.nodes.entries()) {
      // @ts-ignore
      const continuingPaths = intersection(paths, context.paths);
      if (continuingPaths.length) {
        fn(nodes, outNode, new Context(context.fact, continuingPaths, context.match), wm);
      }
    }
  };
}
export function propagate_dispose(nodes: Array<INode & INodeWithPatterns>, n: number) {
  const node = nodes[n];
  for (const [outNode] of node.nodes.entries()) {
    base_dispose(nodes, outNode);
  }
}
