import { IPattern, patternType } from "../../pattern";
import { from } from "./from";
import { obj } from "./obj";

const funcByType: Partial<Record<
  patternType,
  (pattern: any, defines: Map<string, any>, scope: Map<string, any>) => any
>> = {
  [patternType.object]: obj,
  [patternType.initial_fact]: obj,
  [patternType.not]: obj,
  [patternType.exists]: obj,
  [patternType.from]: from,
  [patternType.from_exists]: from,
  [patternType.from_not]: from,
};
export function pt(pattern: IPattern, defines: Map<string, any>, scope: Map<string, any>) {
  const fun = funcByType[pattern.tp];
  return fun ? fun(pattern, defines, scope) : pattern;
}
