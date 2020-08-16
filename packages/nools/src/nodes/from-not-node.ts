import { isArray } from "@nools/lodash-port";
import { IFromNotNode } from "../runtime/nodes/types";
import { INode, INodeWithPatterns } from "../runtime/nodes/INode";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { Context } from "../context";
import { __addToLeftMemory, assert, modify, retract, removeFromLeftMemory } from "./beta-node";

function __isMatch<TObject extends FactObject>(
  node: IFromNotNode,
  oc: Context,
  o: any,
  add: boolean,
  wm: WorkingMemory<TObject>,
) {
  let ret = false;
  if (node.type_assert(o)) {
    const createdFact = wm.getFactHandle(o);
    const context = new Context(createdFact, null).mergeMatch(oc.match).set(node.alias, o);
    if (add) {
      let fm = node.fromMemory[createdFact.id];
      if (!fm) {
        fm = node.fromMemory[createdFact.id] = {};
      }
      fm[oc.hashCode] = oc;
    }
    const fh = context.factHash;
    ret = node.__equalityConstraints.every((eqConstraint) => {
      return eqConstraint(fh, fh);
    });
  }
  return ret;
}

export function __findMatches<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>,
) {
  const node = nodes[n] as IFromNotNode;
  const fh = context.factHash,
    o = node.from_assert(fh),
    isMatch = false;
  if (isArray(o)) {
    (o as any[]).some((o) => {
      if (__isMatch(node, context, o, true, wm)) {
        context.blocked = true;
        return true;
      } else {
        return false;
      }
    });
    assert(nodes, n, context.clone(), wm);
  } else if (o !== undefined && !(context.blocked = __isMatch(node, context, o, true, wm))) {
    assert(nodes, n, context.clone(), wm);
  }
  return isMatch;
}

export function assert_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>,
) {
  __addToLeftMemory(nodes, n, context);
  __findMatches(nodes, n, context, wm);
}

function __modify<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  leftContext: Context,
  wm: WorkingMemory<TObject>,
) {
  const node = nodes[n] as IFromNotNode;
  const leftContextBlocked = leftContext.blocked;
  const fh = context.factHash,
    o = node.from_assert(fh);
  if (isArray(o)) {
    (o as any[]).some((o) => {
      if (__isMatch(node, context, o, true, wm)) {
        context.blocked = true;
        return true;
      } else {
        return false;
      }
    });
  } else if (o !== undefined) {
    context.blocked = __isMatch(node, context, o, true, wm);
  }
  const newContextBlocked = context.blocked;
  if (!newContextBlocked) {
    if (leftContextBlocked) {
      assert(nodes, n, context.clone(), wm);
    } else {
      modify(nodes, n, context.clone(), wm);
    }
  } else if (!leftContextBlocked) {
    retract(nodes, n, leftContext.clone(), wm);
  }
}

export function modify_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>,
) {
  const ctx = removeFromLeftMemory(nodes, n, context);
  if (ctx) {
    __addToLeftMemory(nodes, n, context);
    __modify(nodes, n, context, ctx.data, wm);
  } else {
    throw new Error();
  }
  const node = nodes[n] as IFromNotNode;
  const fm = node.fromMemory[context.fact.id];
  node.fromMemory[context.fact.id] = {};
  if (fm) {
    for (const i in fm) {
      // update any contexts associated with this fact
      if (i !== context.hashCode) {
        const lc = fm[i];
        const ctx = removeFromLeftMemory(nodes, n, lc);
        if (ctx) {
          const lc_cp = lc.clone();
          lc_cp.blocked = false;
          __addToLeftMemory(nodes, n, lc_cp);
          __modify(nodes, n, lc_cp, ctx.data, wm);
        }
      }
    }
  }
}

export function retract_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>,
) {
  const tuple = removeFromLeftMemory(nodes, n, context);
  if (tuple) {
    const ctx = tuple.data;
    if (!ctx.blocked) {
      retract(nodes, n, ctx.clone(), wm);
    }
  }
}
