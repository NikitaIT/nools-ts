import { _base_assert } from "./_base_assert";
import { nodeType, not, exists, beta, FactObject, Args } from "./import";

const retract_right: Partial<Record<nodeType, typeof base_retract_right>> = {
  [nodeType.beta]: beta.retract_right,
  [nodeType.join]: beta.retract_right,
  [nodeType.exists]: exists.retract_right,
  [nodeType.not]: not.retract_right,
};
export const base_retract_right: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(retract_right[node.tp] as any, "retract_right")(
    nodes,
    n,
    context,
    wm
  );
};
