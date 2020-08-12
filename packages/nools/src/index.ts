import { parse_rules } from "./compile/index";

import { compile as runtime_compile } from "./runtime/compile";

import { ICompileOptions } from "./interfaces";

export function compile(src: string, options: ICompileOptions) {
  const root = parse_rules(src, options);
  if (!root) {
    throw new Error("compile without src");
  }
  // console.log('----------------------------------');
  // console.info(JSON.stringify(flow));
  // console.log('++++++++++++++++++++++++++++++++++');
  return runtime_compile(root, options);
}
