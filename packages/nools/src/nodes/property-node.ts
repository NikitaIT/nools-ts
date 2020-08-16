import { Context } from "../context";
import { IPropertyNode } from "../runtime/nodes/types";
import { INode, INodeWithPatterns } from "../runtime/nodes/INode";
import { Args } from "./Args";
import { propagate_assert, propagate_modify, propagate_retract } from "./Funs";
import { FactObject, WorkingMemory } from "../WorkingMemory";

export const assert = wrap(propagate_assert);
export const modify = wrap(propagate_modify);

function wrap<TObject extends FactObject>(fn: Args<TObject>): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n] as IPropertyNode;
    const c = new Context(context.fact, context.paths);
    const constiables = node.constiables,
      o = context.fact.object;
    c.set(node.alias, o);
    for (const key in constiables) {
      const val = constiables[key];
      c.set(val, o[key]);
    }
    fn(nodes, n, c, wm);
  };
}

export function retract<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>,
) {
  propagate_retract(nodes, n, new Context(context.fact, context.paths), wm);
}
