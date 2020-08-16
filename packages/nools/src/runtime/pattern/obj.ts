import { IObjectPattern } from "../../pattern";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function obj(pattern: IObjectPattern, defines: Map<string, any>, scope: Map<string, any>): IObjectPattern {
  // todo: check ignore
  // @ts-ignore
  const class_type = defines.get(pattern.cls);
  // const constraints = pattern.constraints.map((constraint) => {
  // 	return cst(constraint, defines, scope);
  // });
  // const constraints: IConstraint[] = null;
  return {
    tp: pattern.tp,
    id: pattern.id,
    class_type: class_type,
    a: pattern.a,
    pattern: pattern.pattern,
    constraints: pattern.constraints,
    // constraints: Clone(pattern.constraints)
  };
}
