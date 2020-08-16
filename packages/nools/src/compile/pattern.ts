import { IFromConstraint } from "../constraint";
import { cst } from "./constraint";
import { IObjectPattern, patternType, IFromPattern } from "../pattern";
const funcs: Record<patternType, (constraint: any) => any> = {
  [patternType.object]: obj,
  [patternType.initial_fact]: obj,
  [patternType.not]: obj,
  [patternType.exists]: obj,
  [patternType.from]: from,
  [patternType.from_exists]: from,
  [patternType.from_not]: from,
} as any;

function obj(pattern: IObjectPattern) {
  delete pattern.class_type;
  // pattern.constraints = pattern.constraints.map(cst);
  delete pattern.pattern;
  // delete pattern.constraints;
  return pattern;
}

function from(pattern: IFromPattern) {
  pattern = obj(pattern) as IFromPattern;
  pattern.from = cst(pattern.from) as IFromConstraint;
  return pattern;
}
export function pt(pattern: IObjectPattern | IFromPattern) {
  const fun = funcs[pattern.tp];
  return fun(pattern);
}
