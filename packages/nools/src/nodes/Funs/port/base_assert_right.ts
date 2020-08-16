import { _base_assert } from "./_base_assert";
import { Args, FactObject } from "../import";
import { Regestry } from "../Regestry";

export const base_assert_right: Args<FactObject> = function (nodes, n, context, wm) {
  const node = nodes[n];
  _base_assert(Regestry.assert_right[node.tp] as any, "assert_right")(nodes, n, context, wm);
};
