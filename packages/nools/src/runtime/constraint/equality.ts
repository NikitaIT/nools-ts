import { IConstraint, IEqualityConstraint } from "../../constraint";
import { getMatcher } from "../../constraint-matcher";
import { op } from "./op";
import { isEqual } from "@nools/lodash-port";

export function equality(constraint: IEqualityConstraint, defines: Map<string, any>, scope: Map<string, any>) {
  const options = op(constraint.options, scope);
  const cst = constraint.constraint;
  const matcher = getMatcher(cst, options, true);
  const alias = constraint.a;
  return {
    // pattern: options.pattern,	// todo:::: can this be removed?
    tp: constraint.tp,
    a: alias,
    constraint: cst,
    assert(fact: any, fh?: any) {
      return matcher(fact, fh);
    },
    equal(that: IConstraint) {
      return (
        /*constraint.type == 'equality' && */ that.a == alias, isEqual(cst, (that as IEqualityConstraint).constraint)
      );
    },
  };
}
