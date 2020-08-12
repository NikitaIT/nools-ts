import { _base_assert } from "./_base_assert";
import {
  nodeType,
  not,
  from_not,
  join,
  exists_from,
  from,
  exists,
  beta,
  FactObject,
  Args,
} from "./import";

const assert_left: Partial<Record<nodeType, typeof base_assert_left>> = {
  [nodeType.beta]: beta.assert_left,
  [nodeType.exists]: exists.assert_left,
  [nodeType.exists_from]: exists_from.assert_left,
  [nodeType.from]: from.assert_left,
  [nodeType.from_not]: from_not.assert_left,
  [nodeType.join]: join.assert_left,
  [nodeType.not]: not.assert_left,
};
export const base_assert_left: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(assert_left[node.tp] as any, "assert_left")(
    nodes,
    n,
    context,
    wm
  );
};
