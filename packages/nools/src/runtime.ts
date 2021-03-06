import { compile as runtime_compile } from "./runtime/compile";

import { ICompileOptions } from "./interfaces";
import { IRootNode } from "./runtime/nodes/INode";

export function compile(root: IRootNode, options: ICompileOptions) {
  return runtime_compile(root, options);
}
