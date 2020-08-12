import { _base_assert } from "./_base_assert";
import {
  nodeType,
  not,
  from_not,
  exists_from,
  from,
  exists,
  beta,
  FactObject,
  Args,
} from "./import";
const retract_left: Partial<Record<nodeType, typeof base_retract_left>> = {
  [nodeType.beta]: beta.retract_left,
  [nodeType.exists]: exists.retract_left,
  [nodeType.exists_from]: exists_from.retract_left,
  [nodeType.from]: from.retract_left,
  [nodeType.from_not]: from_not.retract_left,
  [nodeType.join]: beta.retract_left,
  [nodeType.not]: not.retract_left,
};
export const base_retract_left: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(retract_left[node.tp] as any, "retract_left")(
    nodes,
    n,
    context,
    wm
  );
};
