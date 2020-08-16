import { Args, FactObject } from "../import";
import { Regestry } from "../Regestry";
import { _base_assert } from "./_base_assert";

export const base_retract_right: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n];
  _base_assert(Regestry.retract_right[node.tp] as any, "retract_right")(nodes, n, context, wm);
};
