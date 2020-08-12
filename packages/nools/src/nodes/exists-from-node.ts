import { isArray } from "@nools/lodash-port";
import { IFromPattern } from "../pattern";
import { INode, INodeWithPatterns } from "../runtime/nodes/types";
import { IExistsFromNode } from "../runtime/nodes/types/from_not";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { Context } from "../context";
import {
  __addToLeftMemory,
  assert,
  removeFromLeftMemory,
  modify,
  retract,
} from "./beta-node";

function __isMatch<TObject extends FactObject>(
  node: IExistsFromNode,
  oc: Context,
  o: any,
  add: boolean,
  wm: WorkingMemory<TObject>
) {
  let ret = false;
  if (node.type_assert(o)) {
    const createdFact = wm.getFactHandle(o);
    const context = new Context(createdFact)
      .mergeMatch(oc.match)
      .set(node.alias, o);
    if (add) {
      let fm = node.fromMemory[createdFact.id];
      if (!fm) {
        fm = node.fromMemory[createdFact.id] = {};
      }
      fm[oc.hashCode] = oc;
    }
    const fh = context.factHash;
    const eqConstraints = node.__equalityConstraints;
    ret =
      !!eqConstraints.length &&
      eqConstraints.every((eqConstraint) => {
        return eqConstraint(fh);
      });
  }
  return ret;
}

function __findMatches<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as IExistsFromNode;
  const fh = context.factHash,
    o = node.from_assert(fh),
    isMatch = false;
  if (isArray(o)) {
    context.blocked = (o as any[]).some((o) => {
      return __isMatch(node, context, o, true, wm);
    });
    if (context.blocked) {
      assert(nodes, n, context.clone(), wm);
    }
  } else if (o !== undefined && __isMatch(node, context, o, true, wm)) {
    context.blocked = true;
    assert(nodes, n, context.clone(), wm);
  }
  return isMatch;
}

export function assert_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  __addToLeftMemory(nodes, n, context);
  __findMatches(nodes, n, context, wm);
}

function __modify<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  leftContext: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as IExistsFromNode;
  const leftContextBlocked = leftContext.blocked;
  const fh = context.factHash,
    o = node.from_assert(fh);
  if (isArray(o)) {
    context.blocked = (o as any[]).some((o) => {
      return __isMatch(node, context, o, true, wm);
    });
  } else if (o !== undefined) {
    context.blocked = __isMatch(node, context, o, true, wm);
  }
  const newContextBlocked = context.blocked;
  if (newContextBlocked) {
    if (leftContextBlocked) {
      modify(nodes, n, context.clone(), wm);
    } else {
      assert(nodes, n, context.clone(), wm);
    }
  } else if (leftContextBlocked) {
    retract(nodes, n, context.clone(), wm);
  }
}

export function modify_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const ctx = removeFromLeftMemory(nodes, n, context);
  if (ctx) {
    __addToLeftMemory(nodes, n, context);
    __modify(nodes, n, context, ctx.data, wm);
  } else {
    throw new Error();
  }
  const node = nodes[n] as IExistsFromNode;
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
  wm: WorkingMemory<TObject>
) {
  const tuple = removeFromLeftMemory(nodes, n, context);
  if (tuple) {
    const ctx = tuple.data;
    if (ctx.blocked) {
      retract(nodes, n, ctx.clone(), wm);
    }
  }
}
