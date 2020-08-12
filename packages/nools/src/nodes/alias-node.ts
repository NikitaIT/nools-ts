import { Args } from "./Args";
import { propagate_assert, propagate_modify, propagate_retract } from "./Funs";
import { FactObject } from "../WorkingMemory";
import { IAliasNode } from "../runtime/nodes/types";

export const assert = wrap(propagate_assert);
export const modify = wrap(propagate_modify);
export const retract = wrap(propagate_retract);

function wrap<TObject extends FactObject>(fn: Args<TObject>): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n] as IAliasNode;
    return fn(nodes, n, context.set(node.alias, context.fact.object), wm);
  };
}
