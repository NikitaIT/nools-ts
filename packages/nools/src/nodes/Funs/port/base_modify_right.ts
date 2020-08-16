import { Args, FactObject } from "../import";
import { Regestry } from "../Regestry";
import { _base_assert } from "./_base_assert";

export const base_modify_right: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n];
  _base_assert(Regestry.modify_right[node.tp] as any, "modify_right")(nodes, n, context, wm);
};
