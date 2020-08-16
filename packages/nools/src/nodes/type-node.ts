import { ITypeNode } from "../runtime/nodes/types";
import { INode, INodeWithPatterns } from "../runtime/nodes/INode";
import { Context } from "../context";
import { Fact } from "../facts/fact";
import { FactObject } from "../WorkingMemory";
import { Args } from "./Args";
import { base_assert, base_dispose, base_modify, base_retract } from "./Funs";

export class TypeNode {
  assert = wrap(base_assert);

  modify = wrap(base_modify);

  retract = wrap(base_retract);

  dispose<TObject extends FactObject>(nodes: Array<INode & INodeWithPatterns>, n: number) {
    const node = nodes[n];
    for (const [outNode] of node.nodes.entries()) {
      base_dispose(nodes, outNode);
    }
  }
}

function wrap<TObject extends FactObject>(fn: Args<TObject>): Args<TObject, Fact> {
  return (nodes, n, fact, wm) => {
    const node = nodes[n];
    if ((node as ITypeNode).ca(fact.object)) {
      for (const [outNode, paths] of node.nodes.entries()) {
        fn(nodes, outNode, new Context(fact, paths), wm);
      }
    }
  };
}

export const typeUtils = new TypeNode();
