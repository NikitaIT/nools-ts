import { _base_assert } from "./_base_assert";
import {
  nodeType,
  not,
  from_not,
  join,
  terminal,
  exists_from,
  from,
  exists,
  type,
  alias,
  beta,
  FactObject,
  Args,
} from "./import";
const modify_left: Partial<Record<nodeType, typeof base_modify_left>> = {
  [nodeType.beta]: beta.modify_left,
  [nodeType.exists]: exists.modify_left,
  [nodeType.exists_from]: exists_from.modify_left,
  [nodeType.from]: from.modify_left,
  [nodeType.from_not]: from_not.modify_left,
  [nodeType.join]: join.modify_left,
  [nodeType.not]: not.modify_left,
};
export const base_modify_left: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(modify_left[node.tp] as any, "modify_left")(
    nodes,
    n,
    context,
    wm
  );
};
