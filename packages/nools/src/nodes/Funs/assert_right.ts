import { _base_assert } from "./_base_assert";
import { nodeType, not, join, exists, beta, FactObject, Args } from "./import";
const assert_right: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.assert_right,
  [nodeType.exists]: exists.assert_right,
  [nodeType.join]: join.assert_right,
  [nodeType.not]: not.assert_right,
};
export const base_assert_right: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(assert_right[node.tp] as any, "assert_right")(
    nodes,
    n,
    context,
    wm
  );
};
