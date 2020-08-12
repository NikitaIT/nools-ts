import { isEqual } from "@nools/lodash-port";
import { constraintType, IConstraint, IFromConstraint } from "../../constraint";
import { getSourceMatcher } from "../../constraint-matcher";
import { op } from "./op";

export function from(
  constraint: IFromConstraint,
  defines: Map<string, any>,
  scope: Map<string, any>
): IFromConstraint {
  const alias = constraint.a;
  const condition = constraint.condition;
  const options = op(constraint.options, scope);
  const matcher = getSourceMatcher(condition, options, true);
  return {
    tp: constraintType.from,
    options: options,
    condition: condition,
    a: alias,
    constraint: matcher,
    assert(fact: any, fh?: any) {
      return matcher(fact, fh);
    },
    equal(that: IConstraint) {
      return (
        that.tp === constraintType.from &&
        that.a === alias &&
        isEqual(condition, (that as IFromConstraint).constraint)
      );
    },
  };
}
