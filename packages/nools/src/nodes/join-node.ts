import { Context } from "../context";
import { INode, IJoinNode, INodeWithPatterns } from "../runtime/nodes/types";
import {
  __addToLeftMemory,
  assert,
  __addToMemoryMatches,
  modify,
  retract,
  __addToRightMemory,
  removeFromLeftMemory,
  propagateRetractModifyFromLeft,
  removeFromRightMemory,
  propagateRetractModifyFromRight,
} from "./beta-node";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { memory_get } from "./misc/memory";

function propagateFromLeft<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  rm: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as IJoinNode;
  const mr = node.constraint.match(context, rm);
  if (mr.isMatch) {
    assert(
      nodes,
      n,
      __addToMemoryMatches(
        nodes,
        n,
        rm,
        context,
        context.clone(undefined, undefined, mr)
      ),
      wm
    );
  }
  // return this;
}

export function assert_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  __addToLeftMemory(nodes, n, context);
  const node = nodes[n] as IJoinNode;
  const rm = memory_get(node.rightTuples, context);
  rm.forEach((m) => {
    propagateFromLeft(nodes, n, context, m.data, wm);
  });
}

function propagateFromRight<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  lm: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as IJoinNode;
  const mr = node.constraint.match(lm, context);
  if (mr.isMatch) {
    assert(
      nodes,
      n,
      __addToMemoryMatches(
        nodes,
        n,
        context,
        lm,
        context.clone(undefined, undefined, mr)
      ),
      wm
    );
  }
  // return node;
}

export function assert_right<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  __addToRightMemory(nodes, n, context);
  const node = nodes[n] as IJoinNode;
  const lm = memory_get(node.leftTuples, context);
  lm.forEach((m) => {
    propagateFromRight(nodes, n, context, m.data, wm);
  });
}

function propagateAssertModifyFromLeft<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  rightMatches: { [factid: string]: Context },
  rm: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as IJoinNode;
  const factId = rm.hashCode;
  if (factId in rightMatches) {
    const mr = node.constraint.match(context, rm);
    const mrIsMatch = mr.isMatch;
    if (!mrIsMatch) {
      retract(nodes, n, rightMatches[factId].clone(), wm);
    } else {
      modify(
        nodes,
        n,
        __addToMemoryMatches(
          nodes,
          n,
          rm,
          context,
          context.clone(undefined, undefined, mr)
        ),
        wm
      );
    }
  } else {
    propagateFromLeft(nodes, n, context, rm, wm);
  }
}

export function modify_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const previousContext = removeFromLeftMemory(nodes, n, context).data;
  __addToLeftMemory(nodes, n, context);
  const node = nodes[n] as IJoinNode;
  const rm = memory_get(node.rightTuples, context);
  if (!rm.length) {
    propagateRetractModifyFromLeft(nodes, n, previousContext, wm);
  } else {
    const rightMatches = previousContext.rightMatches!;
    rm.forEach((m) => {
      propagateAssertModifyFromLeft(
        nodes,
        n,
        context,
        rightMatches,
        m.data,
        wm
      );
    });
  }
}

function propagateAssertModifyFromRight<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  leftMatches: { [factid: string]: Context },
  lm: Context,
  wm: WorkingMemory<TObject>
) {
  const factId = lm.hashCode;
  if (factId in leftMatches) {
    const node = nodes[n] as IJoinNode;
    const mr = node.constraint.match(lm, context);
    const mrIsMatch = mr.isMatch;
    if (!mrIsMatch) {
      retract(nodes, n, leftMatches[factId].clone(), wm);
    } else {
      modify(
        nodes,
        n,
        __addToMemoryMatches(
          nodes,
          n,
          context,
          lm,
          context.clone(undefined, undefined, mr)
        ),
        wm
      );
    }
  } else {
    propagateFromRight(nodes, n, context, lm, wm);
  }
}

export function modify_right<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const previousContext = removeFromRightMemory(nodes, n, context).data;
  __addToRightMemory(nodes, n, context);
  const node = nodes[n] as IJoinNode;
  const lm = memory_get(node.leftTuples, context);
  if (!lm.length) {
    propagateRetractModifyFromRight(nodes, n, previousContext, wm);
  } else {
    const leftMatches = previousContext.leftMatches!;
    lm.forEach((m) => {
      propagateAssertModifyFromRight(
        nodes,
        n,
        context,
        leftMatches,
        m.data,
        wm
      );
    });
  }
}
