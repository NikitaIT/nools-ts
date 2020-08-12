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
  property,
  equality,
  FactObject,
  Args,
  Fact,
  Context,
} from "./import";
const modify_right: Partial<Record<nodeType, typeof base_modify_right>> = {
  [nodeType.beta]: beta.modify_right,
  [nodeType.exists]: exists.modify_right,
  [nodeType.join]: join.modify_right,
  [nodeType.not]: not.modify_right,
};

export const base_modify_right: Args<FactObject> = function (
  nodes,
  n,
  context,
  wm
) {
  const node = nodes[n];
  _base_assert(modify_right[node.tp] as any, "modify_right")(
    nodes,
    n,
    context,
    wm
  );
};
