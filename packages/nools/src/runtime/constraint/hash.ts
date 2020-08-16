import { clone, isEqual } from "@nools/lodash-port";
import { constraintType, IConstraint, IHashConstraint } from "../../constraint";

export function hash(constraint: IHashConstraint): IHashConstraint {
  const alias = constraint.a;
  const cst = clone(constraint.constraint);
  return {
    tp: constraintType.hash,
    a: alias,
    constraint: cst,
    assert() {
      return true;
    },
    equal(that: IConstraint) {
      return that.tp === constraintType.hash && that.a === alias && isEqual(cst, (that as IHashConstraint).constraint);
    },
  };
}
