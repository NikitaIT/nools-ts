import { ITuple } from "./misc/tuple-entry";
import { LinkedList, ILinkNode } from "../STD/linked-list";
import { INode, INodeWithPatterns, INotNode } from "../runtime/nodes/types";
import {
  removeFromRightMemory,
  removeFromLeftMemory,
  retract,
  __addToRightMemory,
  __addToLeftMemory,
  assert,
  modify,
} from "./beta-node";
import { Context, Match } from "../context";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { memory_get, memory_remove } from "./misc/memory";

export function addToLeftBlockedMemory(
  nodes: INode[],
  n: number,
  context: ILinkNode<Context>
) {
  const node = nodes[n] as INotNode;
  const data = context.data,
    hashCode = data.hashCode;
  const ctx = node.leftMemory[hashCode];
  node.leftTupleMemory[hashCode] = context;
  if (ctx) {
    memory_remove(node.leftTuples, ctx);
  }
  return node;
}

export function __cloneContext(nodes: INode[], n: number, context: Context) {
  const node = nodes[n] as INotNode;
  return context.clone(
    undefined,
    undefined,
    context.match.merge(node.notMatch)
  );
}

function blockedContext<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  rightContext: Context,
  propagate = false,
  wm: WorkingMemory<TObject>
) {
  leftContext.blocker = rightContext;
  removeFromLeftMemory(nodes, n, leftContext);
  addToLeftBlockedMemory(nodes, n, rightContext.blocking!.push(leftContext));
  propagate && retract(nodes, n, __cloneContext(nodes, n, leftContext), wm);
}

export function blockFromAssertLeft<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  rightContext: Context,
  wm: WorkingMemory<TObject>
) {
  blockedContext(nodes, n, leftContext, rightContext, false, wm);
}

export function assert_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const node = nodes[n] as INotNode;
  const values = memory_get(node.rightTuples, context);
  const thisConstraint = node.constraint;
  if (
    context &&
    values.every((value) => {
      const rc = value.data;
      if (thisConstraint.isMatch(context, rc)) {
        blockFromAssertLeft(nodes, n, context, rc, wm);
        return false;
      } else {
        return true;
      }
    })
  ) {
    propagateFromLeft(nodes, n, context, wm);
  }
}

export function assert_right<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  __addToRightMemory(nodes, n, context);
  context.blocking = new LinkedList<Context>();
  const node = nodes[n] as INotNode;
  const fl = memory_get(node.leftTuples, context).slice(); // todo: why do we need call slice?
  const thisConstraint = node.constraint;
  fl.forEach((l) => {
    const leftContext = l.data;
    if (thisConstraint.isMatch(leftContext, context)) {
      blockFromAssertRight(nodes, n, leftContext, context, wm);
    }
  });
}

export function retract_right<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const ctx = removeFromRightMemory(nodes, n, context),
    rightContext = ctx.data,
    blocking = rightContext.blocking!;
  if (blocking.length) {
    //if we are blocking left contexts
    // const leftContext,
    const node = nodes[n] as INotNode;
    const thisConstraint = node.constraint;
    let blockingNode = { next: blocking.head } as ILinkNode<Context>;
    //  rc;
    while ((blockingNode = blockingNode.next!)) {
      const leftContext = blockingNode.data;
      removeFromLeftBlockedMemory(nodes, n, leftContext);
      const rm = memory_get(node.rightTuples, leftContext);
      if (
        leftContext &&
        rm.every((m) => {
          const rc = m.data;
          if (thisConstraint.isMatch(leftContext, rc)) {
            blockedContext(nodes, n, leftContext, rc, false, wm);
            return false;
          } else {
            return true;
          }
        })
      ) {
        notBlockedContext(nodes, n, leftContext, true, wm);
      }
    }
    blocking.clear();
  }
}

function notBlockedContext<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  propagate: boolean,
  wm: WorkingMemory<TObject>
) {
  __addToLeftMemory(nodes, n, leftContext);
  propagate && assert(nodes, n, __cloneContext(nodes, n, leftContext), wm);
}

function propagateFromLeft<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  wm: WorkingMemory<TObject>
) {
  notBlockedContext(nodes, n, leftContext, true, wm);
}

function propagateFromRight<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  wm: WorkingMemory<TObject>
) {
  notBlockedContext(nodes, n, leftContext, true, wm);
}

function blockFromAssertRight<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  leftContext: Context,
  rightContext: Context,
  wm: WorkingMemory<TObject>
) {
  blockedContext(nodes, n, leftContext, rightContext, true, wm);
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
    retract(nodes, n, __cloneContext(nodes, n, ctx), wm);
  } else {
    if (!removeFromLeftBlockedMemory(nodes, n, context)) {
      throw new Error();
    }
  }
}

export function removeFromLeftBlockedMemory(
  nodes: INode[],
  n: number,
  context: Context
) {
  const node = nodes[n] as INotNode;
  const ret = node.leftTupleMemory[context.hashCode] || null;
  if (ret) {
    delete node.leftTupleMemory[context.hashCode];
    ret.data.blocker!.blocking!.remove(ret);
  }
  return ret;
}

export function modify_left<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
) {
  const ctx = removeFromLeftMemory(nodes, n, context);
  const node = nodes[n] as INotNode;
  const thisConstraint = node.constraint;
  const rightTuples = memory_get(node.rightTuples, context);
  let isBlocked = false;
  let leftContext = ctx && ctx.data;
  if (!leftContext) {
    //blocked before
    // ctx = node.removeFromLeftBlockedMemory(context);
    const ctx = removeFromLeftBlockedMemory(nodes, n, context);
    leftContext = ctx.data;
    isBlocked = true;
  }
  if (leftContext) {
    let blocker: ITuple | undefined;
    if (leftContext && leftContext.blocker) {
      //we were blocked before so only check nodes previous to our blocker
      blocker = node.rightMemory[leftContext.blocker.hashCode];
      // @ts-ignore
      leftContext.blocker = null;
    }
    if (blocker) {
      const rc = blocker.data;
      if (thisConstraint.isMatch(context, rc)) {
        //we cant be proagated so retract previous
        if (!isBlocked) {
          //we were asserted before so retract
          retract(nodes, n, __cloneContext(nodes, n, leftContext), wm);
        }
        context.blocker = rc;
        addToLeftBlockedMemory(nodes, n, rc.blocking!.push(context));
        // @ts-ignore
        context = null;
      }
    }
    if (
      context &&
      rightTuples.every((rightTuple) => {
        const rc = rightTuple.data;
        if (thisConstraint.isMatch(context, rc)) {
          //we cant be proagated so retract previous
          if (!isBlocked) {
            //we were asserted before so retract
            retract(nodes, n, __cloneContext(nodes, n, leftContext), wm);
          }
          addToLeftBlockedMemory(nodes, n, rc.blocking!.push(context));
          context.blocker = rc;
          return false;
        } else {
          return true;
        }
      })
    ) {
      //we were propogated before
      //we can still be propogated
      __addToLeftMemory(nodes, n, context);
      if (!isBlocked) {
        //we weren't blocked before so modify
        modify(nodes, n, __cloneContext(nodes, n, context), wm);
      } else {
        //we were blocked before but aren't now
        assert(nodes, n, __cloneContext(nodes, n, context), wm);
      }
    }
  } else {
    throw new Error();
  }
}

export function modify_right<TObject extends FactObject>(
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: Context,
  wm: WorkingMemory<TObject>
): void {
  const ctx = removeFromRightMemory(nodes, n, context);
  if (ctx) {
    const rightContext = ctx.data;
    const node = nodes[n] as INotNode;
    const leftTuples = memory_get(node.leftTuples, context).slice();
    const leftTuplesLength = leftTuples.length;
    const thisConstraint = node.constraint;
    const blocking = rightContext.blocking!;
    __addToRightMemory(nodes, n, context);
    context.blocking = new LinkedList<Context>();
    //check old blocked contexts
    //check if the same contexts blocked before are still blocked
    let blockingNode = { next: blocking.head } as ILinkNode<Context>;
    while ((blockingNode = blockingNode.next!)) {
      const leftContext = blockingNode.data;
      // @ts-ignore
      leftContext.blocker = null;
      if (thisConstraint.isMatch(leftContext, context)) {
        leftContext.blocker = context;
        addToLeftBlockedMemory(nodes, n, context.blocking.push(leftContext));
      } else {
        //we arent blocked anymore
        // @ts-ignore
        leftContext.blocker = null;
        let nn = ctx;
        while ((nn = nn.next!)) {
          const rc = nn.data;
          if (thisConstraint.isMatch(leftContext, rc)) {
            leftContext.blocker = rc;
            addToLeftBlockedMemory(nodes, n, rc.blocking!.push(leftContext));
            break;
          }
        }
        if (leftContext) {
          __addToLeftMemory(nodes, n, leftContext);
          assert(nodes, n, __cloneContext(nodes, n, leftContext), wm);
        }
      }
    }
    if (leftTuplesLength) {
      //check currently left tuples in memory
      leftTuples.forEach((leftTuple) => {
        const leftContext = leftTuple.data;
        if (thisConstraint.isMatch(leftContext, context)) {
          retract(nodes, n, __cloneContext(nodes, n, leftContext), wm);
          removeFromLeftMemory(nodes, n, leftContext);
          addToLeftBlockedMemory(nodes, n, context.blocking!.push(leftContext));
          leftContext.blocker = context;
        }
      });
    }
  } else {
    throw new Error();
  }
}
