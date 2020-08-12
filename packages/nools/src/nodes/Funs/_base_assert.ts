import { Args, FactObject } from "./import";

export function _base_assert<TObject extends FactObject>(
  fun: Args<TObject>,
  methodName: string
): Args<TObject> {
  return (nodes, n, context, wm) => {
    const node = nodes[n];
    if (!fun) {
      console.error(node, context);
      throw `cannot find method ${methodName}`;
    } else {
      fun(nodes, n, context, wm);
    }
  };
}
