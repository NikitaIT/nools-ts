import { isString } from "@nools/lodash-port";
import { IContext, ICompileOptions } from "../interfaces";
import { compile } from "./compile";
import { topLevelTokens } from "./parser/tokens";
import { parse } from "./parser/parse";
import { build } from "./nodes";

export function parse_rules(src: string, options: ICompileOptions) {
  if (!isString(src)) {
    return null;
  }
  const context = { define: [], rules: [], scope: [] } as IContext;
  parse({ src, keywords: topLevelTokens, context });
  const r = compile(context, options);
  return build(r.rules, r.cs);
}
