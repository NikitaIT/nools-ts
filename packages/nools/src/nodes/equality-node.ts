import { Context } from "../context";
import { IEqualityNode, INode } from "../runtime/nodes/types";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { Args } from "./Args";
import { propagate_assert, propagate_modify, propagate_retract } from "./Funs";

export const assert: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n] as IEqualityNode;
  const isMatch = node.ca(context.factHash);
  node.memory.set(context.pathsHash, isMatch);
  if (isMatch) {
    propagate_assert(nodes, n, context, wm);
  }
};

export const modify: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n] as IEqualityNode;
  const hashCode = context.pathsHash;
  const memory = node.memory;
  const wasMatch = memory.get(hashCode);
  const isMatch = node.ca(context.factHash);
  node.memory.set(context.pathsHash, isMatch);
  if (isMatch) {
    if (wasMatch) {
      propagate_modify(nodes, n, context, wm);
    } else {
      propagate_assert(nodes, n, context, wm);
    }
  } else if (wasMatch) {
    propagate_retract(nodes, n, context, wm);
  }
};

export const retract: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n] as IEqualityNode;
  const hashCode = context.pathsHash;
  const memory = node.memory;
  if (memory.get(hashCode)) {
    propagate_retract(nodes, n, context, wm);
  }
  memory.delete(hashCode);
};
