import {
  constraintType,
  IConstraint,
  IObjectConstraint,
} from "../../constraint";

export function obj(
  constraint: IObjectConstraint,
  defines: Map<string, any>
): IObjectConstraint {
  // @ts-ignore
  const cls = defines.get(constraint.cls);
  const alias = constraint.a;
  return {
    tp: constraintType.object,
    a: alias,
    constraint: cls,
    assert(fact: any, fh?: any) {
      return fact instanceof cls || fact.constructor === cls;
    },
    equal(that: IConstraint) {
      return (
        that.tp === constraintType.object &&
        cls === (that as IObjectConstraint).constraint
      ); // todo: isEqual?????
    },
  };
}
