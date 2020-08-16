import { IFromConstraint } from "../../constraint";
import { IFromPattern } from "../../pattern";
import { obj } from "./obj";
import { cst } from "../constraint";

export function from(pattern: IFromPattern, defines: Map<string, any>, scope: Map<string, any>) {
  const from = pattern.from;
  pattern = obj(pattern, defines, scope) as IFromPattern;
  pattern.from = cst(from, defines, scope) as IFromConstraint;
  return pattern;
}
