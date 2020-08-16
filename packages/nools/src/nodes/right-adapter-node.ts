import { intersection } from "@nools/lodash-port";
import { FactObject } from "../WorkingMemory";
import { Args } from "./Args";
import {
  base_assert_left,
  base_assert_right,
  base_modify_left,
  base_modify_right,
  base_retract_left,
  base_retract_right,
} from "./Funs";

export enum AdapterNodeType {
  assert = "assert",
  retract = "retract",
  modify = "modify",
}
export const Right = {
  [AdapterNodeType.assert]: base_assert_right,
  [AdapterNodeType.retract]: base_retract_right,
  [AdapterNodeType.modify]: base_modify_right,
};
export const Left = {
  [AdapterNodeType.assert]: base_assert_left,
  [AdapterNodeType.retract]: base_retract_left,
  [AdapterNodeType.modify]: base_modify_left,
};
export function getAdapterNode<TObject extends FactObject>(
  t: typeof Left | typeof Right,
  type: AdapterNodeType,
): Args<TObject> {
  return (nodes, n, context, wm) => {
    if (context.paths) {
      wrapPaths(t[type])(nodes, n, context, wm);
    } else {
      wrapNoPaths(t[type])(nodes, n, context, wm);
    }
  };
}
export function wrapNoPaths<TObject extends FactObject>(fn: Args<TObject>): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n];
    for (const [outNode] of node.nodes.entries()) {
      fn(nodes, outNode, context, wm);
    }
  };
}
export function wrapPaths<TObject extends FactObject>(fn: Args<TObject>): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n];
    for (const [outNode, paths] of node.nodes.entries()) {
      const continuingPaths = intersection(paths, context.paths!);
      if (continuingPaths.length) {
        fn(nodes, outNode, context.clone(undefined, continuingPaths, undefined), wm);
      }
    }
  };
}
