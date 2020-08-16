import { Args, FactObject } from "../import";
import { Regestry } from "../Regestry";
import { _base_assert } from "./_base_assert";

export const base_modify_left: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n];
  _base_assert(Regestry.modify_left[node.tp] as any, "modify_left")(nodes, n, context, wm);
};
